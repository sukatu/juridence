import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CalendarClock,
  Check,
  CreditCard,
  FileText,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const titleCase = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value) => {
  if (!value) return 'No fixed renewal date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const formatPrice = (plan) => {
  const amount = Number(plan.price || 0);
  if (!amount) return plan.id === 'basic' ? 'No recurring charge' : 'No charge';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: plan.currency || 'USD', maximumFractionDigits: 0 }).format(amount);
};

const UsageMeter = ({ label, value, limit }) => {
  const hasLimit = Number.isFinite(Number(limit)) && Number(limit) > 0;
  const percentage = hasLimit ? Math.min(100, Math.round((Number(value || 0) / Number(limit)) * 100)) : 0;
  return (
    <div className="dd-usage-meter">
      <div><strong>{label}</strong><span>{Number(value || 0).toLocaleString()} {hasLimit ? `of ${Number(limit).toLocaleString()}` : 'used'}</span></div>
      <div className="dd-usage-track"><span style={{ width: hasLimit ? `${percentage}%` : '0%' }} /></div>
      <small>{hasLimit ? `${Math.max(0, Number(limit) - Number(value || 0)).toLocaleString()} remaining` : 'No configured monthly limit'}</small>
    </div>
  );
};

const BillingPlanPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBilling = async () => {
    setLoading(true);
    setError('');
    const [currentResult, plansResult, historyResult] = await Promise.allSettled([
      apiGet('/subscription/current'),
      apiGet('/subscription/plans'),
      apiGet('/subscription/usage', { limit: 20 }),
    ]);
    if (currentResult.status === 'fulfilled') setSubscription(currentResult.value);
    if (plansResult.status === 'fulfilled') setPlans(plansResult.value || []);
    if (historyResult.status === 'fulfilled') setHistory(historyResult.value || []);
    if (currentResult.status === 'rejected' && plansResult.status === 'rejected') {
      setError(currentResult.reason?.message || 'Subscription information could not be loaded.');
    }
    setLoading(false);
  };

  useEffect(() => { loadBilling(); }, []);

  const currentPlan = useMemo(() => (
    plans.find((plan) => plan.is_current || plan.id === subscription?.plan)
  ), [plans, subscription]);

  const usage = subscription?.usage || {};
  const limits = subscription?.limits || {};

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Account administration</p><h2>Billing & Plan</h2><p>Review the current subscription, monthly usage and available product tiers.</p></div>
        <div className="dd-heading-actions"><button className="dd-button dd-button-secondary" type="button" onClick={loadBilling} disabled={loading}><RefreshCw size={14} /> Refresh</button></div>
      </div>

      {loading ? <div className="dd-loading-state"><Loader2 size={17} className="dd-spin" /> Loading subscription</div> : error ? (
        <div className="dd-empty-state"><CreditCard size={22} /><div><strong>Billing information is unavailable</strong><p>{error}</p></div></div>
      ) : (
        <>
          <div className="dd-current-plan">
            <div><span className="dd-plan-mark"><CreditCard size={19} /></span><div><small>Current account plan</small><strong>{currentPlan?.name || titleCase(subscription?.plan || 'Free')}</strong><p>{currentPlan?.description || 'Subscription access for this signed-in account.'}</p></div></div>
            <div className="dd-plan-metrics"><span><ShieldCheck size={14} /> {titleCase(subscription?.status || 'Active')}</span><span><CalendarClock size={14} /> {formatDate(subscription?.expires_at)}</span></div>
          </div>

          <div className="dd-billing-grid">
            <section className="dd-panel">
              <div className="dd-panel-header"><div><h3>Current period usage</h3><p>Usage recorded for this account in the current month.</p></div><Gauge size={16} /></div>
              <div className="dd-panel-body dd-usage-list">
                <UsageMeter label="Searches" value={usage.searches_this_month} limit={limits.searches_per_month} />
                <UsageMeter label="API calls" value={usage.api_calls_this_month} limit={limits.api_calls_per_month} />
              </div>
            </section>
            <section className="dd-panel">
              <div className="dd-panel-header"><div><h3>Included capabilities</h3><p>Features returned by the active subscription.</p></div><FileText size={16} /></div>
              <div className="dd-feature-list">{(subscription?.features || []).map((feature) => <div key={feature}><Check size={13} /><span>{feature}</span></div>)}{!subscription?.features?.length && <p>No plan features are recorded.</p>}</div>
            </section>
          </div>

          <div className="dd-plan-grid">{plans.map((plan) => {
            const isCurrent = plan.is_current || plan.id === subscription?.plan;
            return <article className={`dd-plan-card${plan.is_popular ? ' is-recommended' : ''}`} key={plan.id}>{isCurrent && <span className="dd-plan-label">Current plan</span>}<h3>{plan.name}</h3><p>{plan.description}</p><div className="dd-plan-price"><strong>{formatPrice(plan)}</strong><span>{Number(plan.price || 0) ? `per ${plan.billing_cycle}` : 'standard access'}</span></div><ul>{(plan.features || []).filter((feature) => feature.included).map((feature) => <li key={feature.name}><Check size={14} /><span><strong>{feature.name}</strong><small>{feature.description}</small></span></li>)}</ul><button type="button" className={`dd-button ${isCurrent ? 'dd-button-secondary' : 'dd-button-primary'} dd-button-block`} disabled>{isCurrent ? 'Current plan' : 'Contact account owner'}</button></article>;
          })}</div>

          <section className="dd-panel">
            <div className="dd-panel-header"><div><h3>Recent usage activity</h3><p>Latest metered activity for this account.</p></div><Activity size={16} /></div>
            <div className="dd-table-wrap dd-billing-history"><table className="dd-data-table"><thead><tr><th>Resource</th><th>Count</th><th>Recorded</th></tr></thead><tbody>{history.map((record) => <tr key={record.id}><td><strong>{titleCase(record.resource_type)}</strong></td><td>{Number(record.count || 0).toLocaleString()}</td><td>{formatDate(record.recorded_at || record.created_at)}</td></tr>)}{!history.length && <tr><td colSpan="3"><div className="dd-empty-table">No metered usage has been recorded for this account.</div></td></tr>}</tbody></table></div>
          </section>
        </>
      )}
      <div className="dd-inline-alert is-info">Subscription changes and commercial terms are controlled by the workspace account owner. Displayed prices are product catalogue values and may differ from a signed order form.</div>
    </section>
  );
};

export default BillingPlanPage;
