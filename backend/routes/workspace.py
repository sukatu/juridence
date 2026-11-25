from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import MetaData, Table, func, select
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models.security import LoginSession, SecurityEvent, TwoFactorAuth
from models.user import User, UserRole, UserStatus


router = APIRouter(prefix="/api/workspace", tags=["workspace"])


def _workspace_users(db: Session, current_user: User):
    organization = (current_user.organization or "").strip()
    if current_user.tenant_id:
        return db.query(User).filter(User.tenant_id == current_user.tenant_id)
    if organization:
        return db.query(User).filter(
            func.lower(func.trim(User.organization)) == organization.lower()
        )
    return db.query(User).filter(User.id == current_user.id)


def _is_workspace_admin(user: User) -> bool:
    role = user.role.value if hasattr(user.role, "value") else str(user.role or "user")
    return bool(user.is_admin or user.is_tenant_admin or role == UserRole.ADMIN.value)


def _role_label(user: User) -> str:
    role = user.role.value if hasattr(user.role, "value") else str(user.role or "user")
    if _is_workspace_admin(user):
        return "Workspace administrator"
    if user.user_type == "court_registrar":
        return "Court registrar"
    if role == UserRole.PREMIUM.value:
        return "Premium member"
    return "Workspace member"


def _status_value(user: User) -> str:
    return user.status.value if hasattr(user.status, "value") else str(user.status or "active")


def _workspace_log_rows(
    db: Session,
    table_name: str,
    member_ids: list[int],
    start_date: datetime,
):
    """Read legacy or current log schemas without altering either table."""
    table = Table(table_name, MetaData(), autoload_with=db.get_bind())
    created_column = table.c.get("created_at")
    if created_column is None:
        created_column = table.c.get("timestamp")
    if created_column is None or table.c.get("user_id") is None:
        return []
    statement = (
        select(table)
        .where(table.c.user_id.in_(member_ids), created_column >= start_date)
        .order_by(created_column.desc())
        .limit(2000)
    )
    return [dict(row) for row in db.execute(statement).mappings().all()]


@router.get("/security-summary")
async def get_workspace_security_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    two_fa = db.query(TwoFactorAuth).filter(TwoFactorAuth.user_id == current_user.id).first()
    sessions = db.query(LoginSession).filter(
        LoginSession.user_id == current_user.id,
        LoginSession.is_active == True,
    ).order_by(LoginSession.last_activity.desc()).limit(10).all()
    recent_event = db.query(SecurityEvent).filter(
        SecurityEvent.user_id == current_user.id,
    ).order_by(SecurityEvent.created_at.desc()).first()

    score = 0
    if current_user.hashed_password:
        score += 25
    if current_user.is_verified:
        score += 25
    if two_fa and two_fa.is_enabled:
        score += 30
    if current_user.last_login:
        score += 20

    return {
        "two_factor": {
            "configured": bool(two_fa and two_fa.method),
            "enabled": bool(two_fa and two_fa.is_enabled),
            "method": two_fa.method if two_fa else None,
            "last_used": two_fa.last_used.isoformat() if two_fa and two_fa.last_used else None,
        },
        "active_sessions": [
            {
                "id": session.id,
                "ip_address": session.ip_address,
                "user_agent": session.user_agent,
                "last_activity": session.last_activity.isoformat(),
                "expires_at": session.expires_at.isoformat(),
            }
            for session in sessions
        ],
        "recent_event": {
            "description": recent_event.description,
            "created_at": recent_event.created_at.isoformat(),
        } if recent_event else None,
        "has_password": bool(current_user.hashed_password),
        "is_verified": bool(current_user.is_verified),
        "security_score": score,
    }


@router.get("/team")
async def get_workspace_team(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    users = _workspace_users(db, current_user).order_by(User.first_name, User.last_name).all()
    members = [
        {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "organization": user.organization,
            "job_title": user.job_title,
            "role": user.role.value if hasattr(user.role, "value") else str(user.role),
            "role_label": _role_label(user),
            "status": _status_value(user),
            "is_admin": _is_workspace_admin(user),
            "user_type": user.user_type,
            "is_verified": user.is_verified,
            "last_login": user.last_login.isoformat() if user.last_login else None,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "is_current_user": user.id == current_user.id,
        }
        for user in users
    ]
    status_counts = {
        status.value: sum(1 for user in users if _status_value(user) == status.value)
        for status in UserStatus
    }
    role_counts = {}
    for user in users:
        label = _role_label(user)
        role_counts[label] = role_counts.get(label, 0) + 1

    return {
        "organization": current_user.organization or "Personal workspace",
        "tenant_id": current_user.tenant_id,
        "can_manage": _is_workspace_admin(current_user),
        "members": members,
        "stats": {
            "total": len(users),
            "active": status_counts.get(UserStatus.ACTIVE.value, 0),
            "pending": status_counts.get(UserStatus.PENDING.value, 0),
            "inactive": status_counts.get(UserStatus.INACTIVE.value, 0),
            "administrators": sum(1 for user in users if _is_workspace_admin(user)),
            "role_counts": role_counts,
        },
    }


@router.get("/audit")
async def get_workspace_audit(
    days: int = Query(30, ge=1, le=365),
    event_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    members = _workspace_users(db, current_user).all()
    member_ids = [member.id for member in members] or [current_user.id]
    member_map = {
        member.id: {
            "name": f"{member.first_name} {member.last_name}".strip() or member.email,
            "email": member.email,
        }
        for member in members
    }
    start_date = datetime.utcnow() - timedelta(days=days)

    audit_logs = _workspace_log_rows(db, "audit_logs", member_ids, start_date)
    activity_logs = _workspace_log_rows(db, "activity_logs", member_ids, start_date)
    security_events = _workspace_log_rows(db, "security_events", member_ids, start_date)

    events = []
    for log in audit_logs:
        actor = member_map.get(log.get("user_id"), {})
        created_at = log.get("created_at") or log.get("timestamp")
        old_value = log.get("old_value") if "old_value" in log else log.get("old_values")
        new_value = log.get("new_value") if "new_value" in log else log.get("new_values")
        events.append({
            "id": f"audit-{log.get('id')}",
            "source": "audit",
            "category": "Data change",
            "action": log.get("action") or "CHANGE",
            "resource": log.get("table_name") or "record",
            "record_id": str(log.get("record_id")) if log.get("record_id") is not None else None,
            "field_name": log.get("field_name"),
            "description": f"{str(log.get('action') or 'Change').title()} on {log.get('table_name') or 'record'} record {log.get('record_id')}",
            "old_value": old_value,
            "new_value": new_value,
            "ip_address": str(log.get("ip_address")) if log.get("ip_address") else None,
            "user_agent": log.get("user_agent"),
            "user_id": log.get("user_id"),
            "user_name": actor.get("name", "Unknown user"),
            "user_email": actor.get("email"),
            "created_at": created_at.isoformat(),
        })
    for log in activity_logs:
        actor = member_map.get(log.get("user_id"), {})
        activity_type = str(log.get("activity_type") or "activity")
        severity = str(log.get("severity") or "info")
        events.append({
            "id": f"activity-{log.get('id')}",
            "source": "activity",
            "category": "Workspace activity",
            "action": log.get("action") or activity_type.upper(),
            "resource": log.get("resource_type") or "workspace",
            "record_id": log.get("resource_id"),
            "field_name": None,
            "description": log.get("description") or log.get("action"),
            "old_value": log.get("old_values"),
            "new_value": log.get("new_values"),
            "ip_address": str(log.get("ip_address")) if log.get("ip_address") else None,
            "user_agent": log.get("user_agent"),
            "severity": severity,
            "user_id": log.get("user_id"),
            "user_name": actor.get("name", "Unknown user"),
            "user_email": actor.get("email"),
            "created_at": log.get("created_at").isoformat(),
        })
    for event in security_events:
        actor = member_map.get(event.get("user_id"), {})
        action = str(event.get("event_type") or "security")
        events.append({
            "id": f"security-{event.get('id')}",
            "source": "security",
            "category": "Security",
            "action": action.upper(),
            "resource": "account security",
            "record_id": str(event.get("user_id")),
            "field_name": None,
            "description": event.get("description"),
            "old_value": None,
            "new_value": None,
            "ip_address": str(event.get("ip_address")) if event.get("ip_address") else None,
            "user_agent": event.get("user_agent"),
            "risk_score": event.get("risk_score"),
            "user_id": event.get("user_id"),
            "user_name": actor.get("name", "Unknown user"),
            "user_email": actor.get("email"),
            "created_at": event.get("created_at").isoformat(),
        })

    normalized_type = (event_type or "").strip().lower()
    if normalized_type:
        events = [event for event in events if event["source"] == normalized_type]
    normalized_search = (search or "").strip().lower()
    if normalized_search:
        events = [
            event for event in events
            if normalized_search in " ".join(
                str(event.get(field) or "")
                for field in ("user_name", "user_email", "action", "resource", "record_id", "description")
            ).lower()
        ]

    events.sort(key=lambda event: event["created_at"], reverse=True)
    totals = {
        "total": len(events),
        "data_changes": sum(1 for event in events if event["source"] == "audit"),
        "activity": sum(1 for event in events if event["source"] == "activity"),
        "security_events": sum(1 for event in events if event["source"] == "security"),
        "high_risk": sum(1 for event in events if (event.get("risk_score") or 0) >= 50),
    }
    offset = (page - 1) * limit
    return {
        "organization": current_user.organization or "Personal workspace",
        "events": events[offset:offset + limit],
        "stats": totals,
        "page": page,
        "limit": limit,
        "total": len(events),
        "total_pages": max(1, (len(events) + limit - 1) // limit),
    }
