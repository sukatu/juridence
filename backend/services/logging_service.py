"""
Comprehensive logging service for tracking user activities, access logs, and system events
"""

import json
import traceback
import uuid
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_
from models.logs import AccessLog, ActivityLog, AuditLog, ErrorLog, SecurityLog, LogLevel, ActivityType
from models.user import User
import requests
import ipaddress

class LoggingService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_client_info(self, request) -> Dict[str, Any]:
        """Extract client information from request"""
        try:
            # Get IP address
            ip_address = request.client.host
            if request.headers.get("x-forwarded-for"):
                ip_address = request.headers.get("x-forwarded-for").split(",")[0].strip()
            elif request.headers.get("x-real-ip"):
                ip_address = request.headers.get("x-real-ip")
            
            # Get user agent
            user_agent = request.headers.get("user-agent", "")
            
            # Get geolocation (simplified - in production, use a proper service)
            country = None
            city = None
            try:
                # This is a simplified approach - in production, use a proper geolocation service
                if ip_address and not ipaddress.ip_address(ip_address).is_private:
                    # You would typically use a service like MaxMind or similar
                    pass
            except:
                pass
            
            # Parse user agent for device info
            device_type = "desktop"
            browser = "unknown"
            os = "unknown"
            
            if user_agent:
                user_agent_lower = user_agent.lower()
                if any(mobile in user_agent_lower for mobile in ["mobile", "android", "iphone"]):
                    device_type = "mobile"
                elif "tablet" in user_agent_lower:
                    device_type = "tablet"
                
                if "chrome" in user_agent_lower:
                    browser = "chrome"
                elif "firefox" in user_agent_lower:
                    browser = "firefox"
                elif "safari" in user_agent_lower:
                    browser = "safari"
                elif "edge" in user_agent_lower:
                    browser = "edge"
                
                if "windows" in user_agent_lower:
                    os = "windows"
                elif "mac" in user_agent_lower:
                    os = "macos"
                elif "linux" in user_agent_lower:
                    os = "linux"
                elif "android" in user_agent_lower:
                    os = "android"
                elif "ios" in user_agent_lower:
                    os = "ios"
            
            return {
                "ip_address": ip_address,
                "user_agent": user_agent,
                "country": country,
                "city": city,
                "device_type": device_type,
                "browser": browser,
                "os": os
            }
        except Exception as e:
            return {
                "ip_address": "unknown",
                "user_agent": "unknown",
                "country": None,
                "city": None,
                "device_type": "unknown",
                "browser": "unknown",
                "os": "unknown"
            }
    
    def log_access(self, request, response, user_id: Optional[int] = None, 
                   session_id: Optional[str] = None, response_time: Optional[int] = None):
        """Log HTTP access"""
        try:
            client_info = self.get_client_info(request)
            
            access_log = AccessLog(
                user_id=user_id,
                session_id=session_id,
                ip_address=client_info["ip_address"],
                user_agent=client_info["user_agent"],
                method=request.method,
                url=str(request.url),
                endpoint=request.url.path,
                status_code=response.status_code,
                response_time=response_time,
                request_size=len(str(request.body)) if hasattr(request, 'body') else None,
                response_size=len(response.body) if hasattr(response, 'body') else None,
                referer=request.headers.get("referer"),
                country=client_info["country"],
                city=client_info["city"],
                device_type=client_info["device_type"],
                browser=client_info["browser"],
                os=client_info["os"]
            )
            
            self.db.add(access_log)
            self.db.commit()
        except Exception as e:
            print(f"Error logging access: {e}")
            self.db.rollback()
    
    def log_activity(self, user_id: Optional[int], activity_type: ActivityType, 
                    action: str, description: Optional[str] = None,
                    resource_type: Optional[str] = None, resource_id: Optional[str] = None,
                    old_values: Optional[Dict] = None, new_values: Optional[Dict] = None,
                    session_id: Optional[str] = None, ip_address: Optional[str] = None,
                    user_agent: Optional[str] = None, metadata: Optional[Dict] = None,
                    severity: LogLevel = LogLevel.INFO):
        """Log user activity"""
        try:
            activity_log = ActivityLog(
                user_id=user_id,
                session_id=session_id,
                activity_type=activity_type,
                action=action,
                description=description,
                resource_type=resource_type,
                resource_id=resource_id,
                old_values=old_values,
                new_values=new_values,
                ip_address=ip_address,
                user_agent=user_agent,
                log_metadata=metadata,
                severity=severity
            )
            
            self.db.add(activity_log)
            self.db.commit()
        except Exception as e:
            print(f"Error logging activity: {e}")
            self.db.rollback()
    
    def log_audit(self, user_id: Optional[int], table_name: str, record_id: str,
                 action: str, field_name: Optional[str] = None,
                 old_value: Optional[str] = None, new_value: Optional[str] = None,
                 session_id: Optional[str] = None, ip_address: Optional[str] = None,
                 user_agent: Optional[str] = None):
        """Log audit trail for data changes"""
        try:
            audit_log = AuditLog(
                user_id=user_id,
                session_id=session_id,
                table_name=table_name,
                record_id=record_id,
                action=action,
                field_name=field_name,
                old_value=old_value,
                new_value=new_value,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            self.db.add(audit_log)
            self.db.commit()
        except Exception as e:
            print(f"Error logging audit: {e}")
            self.db.rollback()
    
    def log_error(self, user_id: Optional[int], error_type: str, error_message: str,
                 stack_trace: Optional[str] = None, url: Optional[str] = None,
                 method: Optional[str] = None, status_code: Optional[int] = None,
                 session_id: Optional[str] = None, ip_address: Optional[str] = None,
                 user_agent: Optional[str] = None, metadata: Optional[Dict] = None,
                 severity: LogLevel = LogLevel.ERROR):
        """Log system errors"""
        try:
            error_log = ErrorLog(
                user_id=user_id,
                session_id=session_id,
                error_type=error_type,
                error_message=error_message,
                stack_trace=stack_trace,
                url=url,
                method=method,
                status_code=status_code,
                ip_address=ip_address,
                user_agent=user_agent,
                log_metadata=metadata,
                severity=severity
            )
            
            self.db.add(error_log)
            self.db.commit()
        except Exception as e:
            print(f"Error logging error: {e}")
            self.db.rollback()
    
    def log_security(self, user_id: Optional[int], event_type: str, description: str,
                    severity: LogLevel = LogLevel.WARNING, ip_address: Optional[str] = None,
                    user_agent: Optional[str] = None, country: Optional[str] = None,
                    city: Optional[str] = None, metadata: Optional[Dict] = None,
                    blocked: bool = False, session_id: Optional[str] = None):
        """Log security events"""
        try:
            security_log = SecurityLog(
                user_id=user_id,
                session_id=session_id,
                event_type=event_type,
                description=description,
                severity=severity,
                ip_address=ip_address,
                user_agent=user_agent,
                country=country,
                city=city,
                log_metadata=metadata,
                blocked=blocked
            )
            
            self.db.add(security_log)
            self.db.commit()
        except Exception as e:
            print(f"Error logging security event: {e}")
            self.db.rollback()
    
    def get_access_logs(self, user_id: Optional[int] = None, limit: int = 100, 
                       offset: int = 0, start_date: Optional[datetime] = None,
                       end_date: Optional[datetime] = None) -> List[AccessLog]:
        """Get access logs with filtering"""
        query = self.db.query(AccessLog)
        
        if user_id:
            query = query.filter(AccessLog.user_id == user_id)
        if start_date:
            query = query.filter(AccessLog.created_at >= start_date)
        if end_date:
            query = query.filter(AccessLog.created_at <= end_date)
        
        return query.order_by(desc(AccessLog.created_at)).offset(offset).limit(limit).all()
    
    def get_activity_logs(self, user_id: Optional[int] = None, activity_type: Optional[ActivityType] = None,
                         limit: int = 100, offset: int = 0, start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None) -> List[ActivityLog]:
        """Get activity logs with filtering"""
        query = self.db.query(ActivityLog)
        
        if user_id:
            query = query.filter(ActivityLog.user_id == user_id)
        if activity_type:
            query = query.filter(ActivityLog.activity_type == activity_type)
        if start_date:
            query = query.filter(ActivityLog.created_at >= start_date)
        if end_date:
            query = query.filter(ActivityLog.created_at <= end_date)
        
        return query.order_by(desc(ActivityLog.created_at)).offset(offset).limit(limit).all()
    
    def get_audit_logs(self, user_id: Optional[int] = None, table_name: Optional[str] = None,
                      limit: int = 100, offset: int = 0, start_date: Optional[datetime] = None,
                      end_date: Optional[datetime] = None) -> List[AuditLog]:
        """Get audit logs with filtering"""
        query = self.db.query(AuditLog)
        
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if table_name:
            query = query.filter(AuditLog.table_name == table_name)
        if start_date:
            query = query.filter(AuditLog.created_at >= start_date)
        if end_date:
            query = query.filter(AuditLog.created_at <= end_date)
        
        return query.order_by(desc(AuditLog.created_at)).offset(offset).limit(limit).all()
    
    def get_error_logs(self, user_id: Optional[int] = None, severity: Optional[LogLevel] = None,
                      resolved: Optional[bool] = None, limit: int = 100, offset: int = 0,
                      start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> List[ErrorLog]:
        """Get error logs with filtering"""
        query = self.db.query(ErrorLog)
        
        if user_id:
            query = query.filter(ErrorLog.user_id == user_id)
        if severity:
            query = query.filter(ErrorLog.severity == severity)
        if resolved is not None:
            query = query.filter(ErrorLog.resolved == resolved)
        if start_date:
            query = query.filter(ErrorLog.created_at >= start_date)
        if end_date:
            query = query.filter(ErrorLog.created_at <= end_date)
        
        return query.order_by(desc(ErrorLog.created_at)).offset(offset).limit(limit).all()
    
    def get_security_logs(self, user_id: Optional[int] = None, event_type: Optional[str] = None,
                         severity: Optional[LogLevel] = None, blocked: Optional[bool] = None,
                         limit: int = 100, offset: int = 0, start_date: Optional[datetime] = None,
                         end_date: Optional[datetime] = None) -> List[SecurityLog]:
        """Get security logs with filtering"""
        query = self.db.query(SecurityLog)
        
        if user_id:
            query = query.filter(SecurityLog.user_id == user_id)
        if event_type:
            query = query.filter(SecurityLog.event_type == event_type)
        if severity:
            query = query.filter(SecurityLog.severity == severity)
        if blocked is not None:
            query = query.filter(SecurityLog.blocked == blocked)
        if start_date:
            query = query.filter(SecurityLog.created_at >= start_date)
        if end_date:
            query = query.filter(SecurityLog.created_at <= end_date)
        
        return query.order_by(desc(SecurityLog.created_at)).offset(offset).limit(limit).all()
    
    def get_log_stats(self, start_date: Optional[datetime] = None, 
                     end_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get logging statistics"""
        try:
            base_query = self.db.query
            if start_date and end_date:
                date_filter = and_(
                    AccessLog.created_at >= start_date,
                    AccessLog.created_at <= end_date
                )
            else:
                date_filter = None
            
            # Access log stats
            access_query = self.db.query(AccessLog)
            if date_filter:
                access_query = access_query.filter(date_filter)
            
            total_requests = access_query.count()
            unique_users = access_query.distinct(AccessLog.user_id).count()
            error_requests = access_query.filter(AccessLog.status_code >= 400).count()
            
            # Activity log stats
            activity_query = self.db.query(ActivityLog)
            if date_filter:
                activity_query = activity_query.filter(date_filter)
            
            total_activities = activity_query.count()
            
            # Error log stats
            error_query = self.db.query(ErrorLog)
            if date_filter:
                error_query = error_query.filter(date_filter)
            
            total_errors = error_query.count()
            unresolved_errors = error_query.filter(ErrorLog.resolved == False).count()
            
            # Security log stats
            security_query = self.db.query(SecurityLog)
            if date_filter:
                security_query = security_query.filter(date_filter)
            
            total_security_events = security_query.count()
            blocked_events = security_query.filter(SecurityLog.blocked == True).count()
            
            return {
                "total_requests": total_requests,
                "unique_users": unique_users,
                "error_requests": error_requests,
                "error_rate": (error_requests / total_requests * 100) if total_requests > 0 else 0,
                "total_activities": total_activities,
                "total_errors": total_errors,
                "unresolved_errors": unresolved_errors,
                "total_security_events": total_security_events,
                "blocked_events": blocked_events,
                "period": {
                    "start_date": start_date.isoformat() if start_date else None,
                    "end_date": end_date.isoformat() if end_date else None
                }
            }
        except Exception as e:
            print(f"Error getting log stats: {e}")
            return {}
