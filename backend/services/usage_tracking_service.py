"""
Comprehensive usage tracking service for real-time billing and analytics
"""

import time
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from models.usage_tracking import UsageTracking, BillingSummary
from models.user import User
import logging

class UsageTrackingService:
    def __init__(self, db: Session):
        self.db = db
        
        # Cost rates (configurable)
        self.cost_rates = {
            "gpt-4": {
                "input": 0.00003,  # $0.03 per 1K tokens
                "output": 0.00006,  # $0.06 per 1K tokens
                "api_call": 0.001   # $0.001 per API call
            },
            "gpt-3.5-turbo": {
                "input": 0.0000015,  # $0.0015 per 1K tokens
                "output": 0.000002,  # $0.002 per 1K tokens
                "api_call": 0.0005   # $0.0005 per API call
            },
            "search": {
                "per_search": 0.01,  # $0.01 per search
                "per_result": 0.001  # $0.001 per result returned
            },
            "api_call": {
                "per_call": 0.005   # $0.005 per API call
            }
        }
    
    def track_usage(self, 
                   user_id: Optional[int] = None,
                   session_id: Optional[str] = None,
                   endpoint: str = "",
                   method: str = "GET",
                   resource_type: str = "api_call",
                   tokens_used: Optional[int] = None,
                   api_calls: int = 1,
                   response_time_ms: Optional[int] = None,
                   data_processed: Optional[int] = None,
                   query: Optional[str] = None,
                   filters_applied: Optional[Dict] = None,
                   results_count: Optional[int] = None,
                   ai_model: Optional[str] = None,
                   prompt_tokens: Optional[int] = None,
                   completion_tokens: Optional[int] = None,
                   ip_address: Optional[str] = None,
                   user_agent: Optional[str] = None,
                   referer: Optional[str] = None) -> UsageTracking:
        """Track a single usage event"""
        
        try:
            # Calculate estimated cost
            estimated_cost = self._calculate_cost(
                resource_type=resource_type,
                tokens_used=tokens_used,
                api_calls=api_calls,
                results_count=results_count,
                ai_model=ai_model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens
            )
            
            # Get cost rates
            cost_per_token, cost_per_api_call = self._get_cost_rates(resource_type, ai_model)
            
            # Create usage record
            usage_record = UsageTracking(
                user_id=user_id,
                session_id=session_id,
                endpoint=endpoint,
                method=method,
                resource_type=resource_type,
                tokens_used=tokens_used or 0,
                api_calls=api_calls,
                response_time_ms=response_time_ms,
                data_processed=data_processed,
                estimated_cost=estimated_cost,
                cost_per_token=cost_per_token,
                cost_per_api_call=cost_per_api_call,
                query=query,
                filters_applied=filters_applied,
                results_count=results_count,
                ai_model=ai_model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                ip_address=ip_address,
                user_agent=user_agent,
                referer=referer
            )
            
            self.db.add(usage_record)
            self.db.commit()
            self.db.refresh(usage_record)
            
            # Update user's real-time usage stats
            self._update_user_usage_stats(user_id, resource_type, estimated_cost)
            
            return usage_record
            
        except Exception as e:
            logging.error(f"Error tracking usage: {e}")
            self.db.rollback()
            raise
    
    def track_search_usage(self, 
                          user_id: Optional[int] = None,
                          session_id: Optional[str] = None,
                          query: str = "",
                          endpoint: str = "",
                          results_count: int = 0,
                          response_time_ms: Optional[int] = None,
                          filters_applied: Optional[Dict] = None,
                          ip_address: Optional[str] = None,
                          user_agent: Optional[str] = None) -> UsageTracking:
        """Track search operation usage"""
        
        return self.track_usage(
            user_id=user_id,
            session_id=session_id,
            endpoint=endpoint,
            method="GET",
            resource_type="search",
            api_calls=1,
            response_time_ms=response_time_ms,
            query=query,
            filters_applied=filters_applied,
            results_count=results_count,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def track_ai_usage(self,
                      user_id: Optional[int] = None,
                      session_id: Optional[str] = None,
                      endpoint: str = "",
                      ai_model: str = "gpt-3.5-turbo",
                      prompt_tokens: int = 0,
                      completion_tokens: int = 0,
                      response_time_ms: Optional[int] = None,
                      query: Optional[str] = None,
                      ip_address: Optional[str] = None,
                      user_agent: Optional[str] = None) -> UsageTracking:
        """Track AI chat usage"""
        
        total_tokens = prompt_tokens + completion_tokens
        
        return self.track_usage(
            user_id=user_id,
            session_id=session_id,
            endpoint=endpoint,
            method="POST",
            resource_type="ai_chat",
            tokens_used=total_tokens,
            api_calls=1,
            response_time_ms=response_time_ms,
            query=query,
            ai_model=ai_model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    def get_user_usage_summary(self, 
                              user_id: int, 
                              days: int = 30) -> Dict[str, Any]:
        """Get comprehensive usage summary for a user"""
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get usage records
        usage_records = self.db.query(UsageTracking).filter(
            UsageTracking.user_id == user_id,
            UsageTracking.created_at >= start_date,
            UsageTracking.created_at <= end_date
        ).all()
        
        # Calculate totals
        total_tokens = sum(record.tokens_used or 0 for record in usage_records)
        total_api_calls = sum(record.api_calls or 0 for record in usage_records)
        total_cost = sum(record.estimated_cost or 0 for record in usage_records)
        
        # Group by resource type
        by_resource_type = {}
        for record in usage_records:
            resource_type = record.resource_type
            if resource_type not in by_resource_type:
                by_resource_type[resource_type] = {
                    "count": 0,
                    "tokens": 0,
                    "cost": 0.0,
                    "api_calls": 0
                }
            
            by_resource_type[resource_type]["count"] += 1
            by_resource_type[resource_type]["tokens"] += record.tokens_used or 0
            by_resource_type[resource_type]["cost"] += record.estimated_cost or 0
            by_resource_type[resource_type]["api_calls"] += record.api_calls or 0
        
        # Get daily usage
        daily_usage = self.db.query(
            func.date(UsageTracking.created_at).label('date'),
            func.count(UsageTracking.id).label('count'),
            func.sum(UsageTracking.tokens_used).label('tokens'),
            func.sum(UsageTracking.estimated_cost).label('cost')
        ).filter(
            UsageTracking.user_id == user_id,
            UsageTracking.created_at >= start_date,
            UsageTracking.created_at <= end_date
        ).group_by(func.date(UsageTracking.created_at)).order_by('date').all()
        
        return {
            "user_id": user_id,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "days": days
            },
            "totals": {
                "total_records": len(usage_records),
                "total_tokens": total_tokens,
                "total_api_calls": total_api_calls,
                "total_cost": round(total_cost, 4)
            },
            "by_resource_type": by_resource_type,
            "daily_usage": [
                {
                    "date": day.date.isoformat(),
                    "count": day.count,
                    "tokens": day.tokens or 0,
                    "cost": round(day.cost or 0, 4)
                }
                for day in daily_usage
            ]
        }
    
    def generate_billing_summary(self, 
                                user_id: int, 
                                start_date: datetime, 
                                end_date: datetime) -> BillingSummary:
        """Generate billing summary for a user for a specific period"""
        
        # Get usage records for the period
        usage_records = self.db.query(UsageTracking).filter(
            UsageTracking.user_id == user_id,
            UsageTracking.created_at >= start_date,
            UsageTracking.created_at <= end_date
        ).all()
        
        # Calculate totals
        total_tokens = sum(record.tokens_used or 0 for record in usage_records)
        total_api_calls = sum(record.api_calls or 0 for record in usage_records)
        total_cost = sum(record.estimated_cost or 0 for record in usage_records)
        
        # Count by resource type
        searches = [r for r in usage_records if r.resource_type == "search"]
        ai_sessions = [r for r in usage_records if r.resource_type == "ai_chat"]
        api_calls = [r for r in usage_records if r.resource_type == "api_call"]
        
        # Calculate costs by type
        ai_chat_cost = sum(r.estimated_cost or 0 for r in ai_sessions)
        search_cost = sum(r.estimated_cost or 0 for r in searches)
        api_cost = sum(r.estimated_cost or 0 for r in api_calls)
        
        # Calculate averages
        tokens_per_search = total_tokens / len(searches) if searches else 0
        cost_per_search = search_cost / len(searches) if searches else 0
        avg_response_time = sum(r.response_time_ms or 0 for r in usage_records) / len(usage_records) if usage_records else 0
        
        # Create billing summary
        billing_summary = BillingSummary(
            user_id=user_id,
            billing_period_start=start_date,
            billing_period_end=end_date,
            total_tokens=total_tokens,
            total_api_calls=total_api_calls,
            total_searches=len(searches),
            total_ai_sessions=len(ai_sessions),
            total_cost=round(total_cost, 4),
            ai_chat_cost=round(ai_chat_cost, 4),
            search_cost=round(search_cost, 4),
            api_cost=round(api_cost, 4),
            tokens_per_search=round(tokens_per_search, 2),
            cost_per_search=round(cost_per_search, 4),
            avg_response_time=round(avg_response_time, 2)
        )
        
        self.db.add(billing_summary)
        self.db.commit()
        self.db.refresh(billing_summary)
        
        return billing_summary
    
    def _calculate_cost(self, 
                       resource_type: str,
                       tokens_used: Optional[int] = None,
                       api_calls: int = 1,
                       results_count: Optional[int] = None,
                       ai_model: Optional[str] = None,
                       prompt_tokens: Optional[int] = None,
                       completion_tokens: Optional[int] = None) -> float:
        """Calculate estimated cost for usage"""
        
        if resource_type == "ai_chat" and ai_model and tokens_used:
            rates = self.cost_rates.get(ai_model, self.cost_rates["gpt-3.5-turbo"])
            # Use separate rates for input/output if available
            if prompt_tokens and completion_tokens:
                return (prompt_tokens * rates["input"] / 1000) + (completion_tokens * rates["output"] / 1000)
            else:
                return tokens_used * (rates["input"] + rates["output"]) / 2000  # Average rate
        
        elif resource_type == "search":
            rates = self.cost_rates["search"]
            cost = rates["per_search"]
            if results_count:
                cost += results_count * rates["per_result"]
            return cost
        
        elif resource_type == "api_call":
            return api_calls * self.cost_rates["api_call"]["per_call"]
        
        return 0.0
    
    def _get_cost_rates(self, resource_type: str, ai_model: Optional[str] = None) -> tuple:
        """Get cost rates for a resource type"""
        
        if resource_type == "ai_chat" and ai_model:
            rates = self.cost_rates.get(ai_model, self.cost_rates["gpt-3.5-turbo"])
            return rates["input"], rates["api_call"]
        elif resource_type == "search":
            return 0.0, self.cost_rates["search"]["per_search"]
        else:
            return 0.0, self.cost_rates["api_call"]["per_call"]
    
    def _update_user_usage_stats(self, user_id: Optional[int], resource_type: str, cost: float):
        """Update user's real-time usage statistics"""
        if not user_id:
            return
        
        # This would update user's real-time stats in their profile
        # Implementation depends on your user model structure
        pass
