import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Crown,
  Download,
  FileText,
  Layers3,
  Loader2,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const enumValue = (value, fallback = '') => String(value?.value || value || fallback).toLowerCase();

const titleCase = (value) => String(value || '')
  .replace(/_/g, ' ')
  .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatDate = (value, fallback = 'Not scheduled') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
};

const formatMoney = (value, currency = 'USD') => {
  const amount = Number(value || 0);
  if (!amount) return 'No recurring charge';
  try {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || 'USD'} ${amount.toLocaleString()}`;
  }
};

const roleValue = (user) => {
  if (user?.is_admin || user?.user_type === 'administrator') return 'admin';
  return enumValue(user?.role, 'user');
};

const statusValue = (user) => enumValue(user?.status, 'active');
const planValue = (user) => enumValue(user?.subscription_plan, 'unassigned') || 'unassigned';

const planLabel = (planId, plans) => {
  if (planId === 'unassigned') return 'Unassigned';
  return plans.find((plan) => plan.id === planId)?.name || titleCase(planId);
};

const isPremiumAccount = (user) => (
  Boolean(user?.is_premium)
  || roleValue(user) === 'premium'
  || ['professional', 'enterprise', 'premium'].includes(planValue(user))
);

const accountClassLabel = (user) => {
  const labels = {
    administrator: 'Administrator',
    workspace_user: 'Workspace member',
    corporate_client: 'Corporate client',
    court_registrar: 'Court registrar',
  };
  return labels[user?.user_type] || 'Workspace member';
};

const initials = (user) => (
  `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U'
);

const csvDownload = (filename, rows) => {
  const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const blob = new Blob(
    [rows.map((row) => row.map(quote).join(',')).join('\n')],
    { type: 'text/csv;charset=utf-8' },
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

const AdminBillingPlanPage = ({ userInfo, onNavigate }) => {
  const [view, setView] = useState('coverage');
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [paymentQuery, setPaymentQuery] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [paymentPage, setPaymentPage] = useState(1);

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError('');
    setNotice('');
    const results = await Promise.allSettled([
      apiGet('/subscription/plans'),
      apiGet('/admin/users', { page: 1, limit: 100 }),
      apiGet('/admin/payments', { page: 1, limit: 100 }),
    ]);
    const [plansResult, usersResult, paymentsResult] = results;

    if (plansResult.status === 'fulfilled') setPlans(Array.isArray(plansResult.value) ? plansResult.value : []);
    if (usersResult.status === 'fulfilled') setUsers(usersResult.value?.users || []);
    if (paymentsResult.status === 'fulfilled') setPayments(paymentsResult.value?.payments || []);

    const failures = results.filter((result) => result.status === 'rejected');
    if (failures.length === results.length) {
      setError(failures[0]?.reason?.message || 'Billing administration data could not be loaded.');
    } else if (failures.length) {
      setNotice(`${failures.length} billing data source${failures.length === 1 ? '' : 's'} could not be loaded. Available records are shown.`);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadBilling(); }, [loadBilling]);

  const planCounts = useMemo(() => users.reduce((counts, user) => {
    const plan = planValue(user);
    counts[plan] = (counts[plan] || 0) + 1;
    return counts;
  }, {}), [users]);

  const activeAccounts = users.filter((user) => statusValue(user) === 'active').length;
  const assignedAccounts = users.filter((user) => planValue(user) !== 'unassigned').length;
  const premiumAccounts = users.filter(isPremiumAccount).length;

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const plan = planValue(user);
      const status = statusValue(user);
      const haystack = [
        user.first_name, user.last_name, user.email, user.organization, user.job_title,
        accountClassLabel(user), titleCase(roleValue(user)), planLabel(plan, plans),
      ].filter(Boolean).join(' ').toLowerCase();
      return (planFilter === 'all' || plan === planFilter)
        && (statusFilter === 'all' || status === statusFilter)
        && (!needle || haystack.includes(needle));
    });
  }, [users, query, planFilter, statusFilter, plans]);

  const paymentUsers = useMemo(() => new Map(users.map((user) => [Number(user.id), user])), [users]);
  const filteredPayments = useMemo(() => {
    const needle = paymentQuery.trim().toLowerCase();
    return payments.filter((payment) => {
      const status = enumValue(payment.status, 'pending');
      const user = paymentUsers.get(Number(payment.user_id));
      const haystack = [
        payment.id, payment.stripe_payment_intent_id, payment.payment_method,
        payment.currency, user?.first_name, user?.last_name, user?.email,
      ].filter(Boolean).join(' ').toLowerCase();
      return (paymentStatus === 'all' || status === paymentStatus)
        && (!needle || haystack.includes(needle));
    });
  }, [payments, paymentQuery, paymentStatus, paymentUsers]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filteredUsers.length ? ((currentPage - 1) * pageSize) + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, filteredUsers.length);

  const paymentTotalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const currentPaymentPage = Math.min(paymentPage, paymentTotalPages);
  const pagedPayments = filteredPayments.slice(
    (currentPaymentPage - 1) * pageSize,
    currentPaymentPage * pageSize,
  );
  const paymentRangeStart = filteredPayments.length ? ((currentPaymentPage - 1) * pageSize) + 1 : 0;
  const paymentRangeEnd = Math.min(currentPaymentPage * pageSize, filteredPayments.length);

  useEffect(() => { setPage(1); }, [query, planFilter, statusFilter]);
  useEffect(() => { setPaymentPage(1); }, [paymentQuery, paymentStatus]);

  const clearCoverageFilters = () => {
    setQuery('');
    setPlanFilter('all');
    setStatusFilter('all');
  };

  const exportCoverage = () => csvDownload('juridence-billing-account-coverage.csv', [
    ['Name', 'Email', 'Organisation', 'Account class', 'Access role', 'Plan', 'Premium entitlement', 'Status', 'Renewal date'],
    ...filteredUsers.map((user) => [
      `${user.first_name || ''} ${user.last_name || ''}`.trim(), user.email, user.organization || '',
      accountClassLabel(user), titleCase(roleValue(user)), planLabel(planValue(user), plans),
      isPremiumAccount(user) ? 'Yes' : 'No', titleCase(statusValue(user)),
      formatDate(user.subscription_expires),
    ]),
  ]);

  const exportPayments = () => csvDownload('juridence-payment-ledger.csv', [
    ['Payment reference', 'Account', 'Email', 'Amount', 'Currency', 'Status', 'Billing period start', 'Billing period end', 'Recorded'],
    ...filteredPayments.map((payment) => {
      const user = paymentUsers.get(Number(payment.user_id));
      return [
        payment.stripe_payment_intent_id || `PAY-${payment.id}`,
        user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : `User ${payment.user_id}`,
        user?.email || '', payment.amount, payment.currency, titleCase(enumValue(payment.status)),
        formatDate(payment.billing_period_start, 'Not recorded'),
        formatDate(payment.billing_period_end, 'Not recorded'),
        formatDate(payment.created_at, 'Not recorded'),
      ];
    }),
  ]);

  const currentEmail = String(userInfo?.email || '').toLowerCase();

  return (
    <div className="dd-admin-billing">
      <section className="dd-module-shell">
        <div className="dd-module-heading">
          <div>
            <p className="dd-eyebrow">Commercial administration</p>
            <h2>Billing &amp; Plan</h2>
            <p>Review product plans, account coverage and recorded payment activity.</p>
          </div>
          <div className="dd-heading-actions">
            <button type="button" className="dd-button dd-button-secondary" onClick={loadBilling} disabled={loading}><RefreshCw size={13} className={loading ? 'dd-spin' : ''} /> Refresh</button>
            <button type="button" className="dd-button dd-button-primary" onClick={() => onNavigate?.('subscription-requests')}><FileText size={13} /> Subscription requests <ArrowRight size={12} /></button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="dd-module-shell"><div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading billing administration</div></section>
      ) : error ? (
        <section className="dd-module-shell"><div className="dd-empty-state"><WalletCards size={22} /><strong>Billing administration is unavailable</strong><p>{error}</p><button type="button" className="dd-button dd-button-secondary" onClick={loadBilling}><RefreshCw size={13} /> Try again</button></div></section>
      ) : (
        <>
          <section className="dd-kpi-row dd-kpi-row-four" aria-label="Billing administration summary">
            <article><UserCheck size={19} /><div><strong>{activeAccounts}</strong><span>Active accounts</span></div></article>
            <article><Layers3 size={19} /><div><strong>{assignedAccounts}</strong><span>Plan assignments</span></div></article>
            <article><Crown size={19} /><div><strong>{premiumAccounts}</strong><span>Premium entitlements</span></div></article>
            <article><Receipt size={19} /><div><strong>{payments.length}</strong><span>Payment records</span></div></article>
          </section>

          <div className="dd-info-strip"><ShieldCheck size={14} /><span>Access roles and commercial plans are separate. An unassigned plan means no commercial entitlement is recorded on the account.</span></div>
          {notice && <div className="dd-inline-alert is-warning">{notice}</div>}

          <section className="dd-module-shell dd-admin-billing-panel">
            <div className="dd-admin-billing-tabs" role="tablist" aria-label="Billing and plan views">
              <button type="button" role="tab" aria-selected={view === 'coverage'} className={view === 'coverage' ? 'is-active' : ''} onClick={() => setView('coverage')}><Users size={13} /> Account coverage <span>{users.length}</span></button>
              <button type="button" role="tab" aria-selected={view === 'catalogue'} className={view === 'catalogue' ? 'is-active' : ''} onClick={() => setView('catalogue')}><Layers3 size={13} /> Plan catalogue <span>{plans.length}</span></button>
              <button type="button" role="tab" aria-selected={view === 'ledger'} className={view === 'ledger' ? 'is-active' : ''} onClick={() => setView('ledger')}><Receipt size={13} /> Payment ledger <span>{payments.length}</span></button>
            </div>

            {view === 'coverage' && (
              <>
                <div className="dd-admin-billing-filter-bar">
                  <label className="dd-admin-billing-search"><span>Search accounts</span><span className="dd-search-control"><Search size={13} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or organisation" aria-label="Search billing accounts" /></span></label>
                  <label><span>Plan</span><select className="dd-select-control" value={planFilter} onChange={(event) => setPlanFilter(event.target.value)} aria-label="Filter accounts by plan"><option value="all">All plans</option><option value="unassigned">Unassigned</option>{plans.map((plan) => <option value={plan.id} key={plan.id}>{plan.name}</option>)}</select></label>
                  <label><span>Status</span><select className="dd-select-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter billing accounts by status"><option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
                  <button type="button" className="dd-button dd-button-secondary" onClick={clearCoverageFilters}>Clear</button>
                  <button type="button" className="dd-button dd-button-secondary" onClick={exportCoverage} disabled={!filteredUsers.length}><Download size={13} /> Export CSV</button>
                </div>
                <div className="dd-list-header dd-admin-billing-list-header"><div><strong>Account plan coverage</strong><span>{filteredUsers.length} matching account{filteredUsers.length === 1 ? '' : 's'}</span></div><span>Records {rangeStart}-{rangeEnd}</span></div>
                <div className="dd-table-wrap dd-admin-billing-table">
                  <table className="dd-data-table">
                    <thead><tr><th>Account</th><th>Organisation</th><th>Access role</th><th>Plan</th><th>Entitlement</th><th>Status</th><th>Renewal</th></tr></thead>
                    <tbody>
                      {pagedUsers.map((user) => {
                        const role = roleValue(user);
                        const plan = planValue(user);
                        const isCurrent = currentEmail && String(user.email || '').toLowerCase() === currentEmail;
                        return (
                          <tr key={user.id}>
                            <td><div className="dd-client-account"><span className="dd-team-avatar">{initials(user)}</span><div><strong>{user.first_name} {user.last_name}{isCurrent && <em className="dd-current-user-tag">You</em>}</strong><small>{user.email}</small></div></div></td>
                            <td><strong>{user.organization || 'Not recorded'}</strong><small>{accountClassLabel(user)}</small></td>
                            <td><span className={`dd-access-role is-${role}`}>{role === 'admin' ? <ShieldCheck size={11} /> : role === 'premium' ? <Crown size={11} /> : <Users size={11} />}{titleCase(role)}</span></td>
                            <td><span className={`dd-plan-state is-${plan}`}>{planLabel(plan, plans)}</span></td>
                            <td><span className={`dd-entitlement-state${isPremiumAccount(user) ? ' is-premium' : ''}`}>{isPremiumAccount(user) ? <Crown size={11} /> : <Check size={11} />}{isPremiumAccount(user) ? 'Premium' : 'Standard'}</span></td>
                            <td><span className={`dd-status-badge is-${statusValue(user)}`}>{statusValue(user)}</span></td>
                            <td>{formatDate(user.subscription_expires)}</td>
                          </tr>
                        );
                      })}
                      {!pagedUsers.length && <tr><td colSpan="7"><div className="dd-empty-table">No accounts match these billing filters.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="dd-client-pagination">
                  <span>Records {rangeStart}-{rangeEnd} of {filteredUsers.length}</span>
                  <div><button type="button" className="dd-button dd-button-secondary" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button><span>Page {currentPage} of {totalPages}</span><button type="button" className="dd-button dd-button-secondary" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button></div>
                </div>
              </>
            )}

            {view === 'catalogue' && (
              <>
                <div className="dd-list-header"><div><strong>Product plan catalogue</strong><span>Commercial tiers available to workspace accounts</span></div><span>{plans.length} plans</span></div>
                <div className="dd-admin-plan-grid">
                  {plans.map((plan) => (
                    <article className={`dd-admin-plan-card${plan.is_popular ? ' is-recommended' : ''}`} key={plan.id}>
                      <header><div><small>{plan.is_popular ? 'Recommended tier' : 'Product tier'}</small><h3>{plan.name}</h3></div>{plan.is_popular && <Crown size={17} />}</header>
                      <p>{plan.description}</p>
                      <div className="dd-admin-plan-price"><strong>{formatMoney(plan.price, plan.currency)}</strong><span>{Number(plan.price || 0) ? `per ${plan.billing_cycle}` : 'catalogue rate'}</span></div>
                      <ul>{(plan.features || []).filter((feature) => feature.included).map((feature) => <li key={feature.name}><Check size={12} /><span><strong>{feature.name}</strong><small>{feature.description}</small></span></li>)}</ul>
                      <footer><Users size={13} /><strong>{planCounts[plan.id] || 0}</strong><span>assigned account{planCounts[plan.id] === 1 ? '' : 's'}</span></footer>
                    </article>
                  ))}
                  {!plans.length && <div className="dd-empty-table">No product plans are configured.</div>}
                </div>
              </>
            )}

            {view === 'ledger' && (
              <>
                <div className="dd-admin-billing-filter-bar is-ledger">
                  <label className="dd-admin-billing-search"><span>Search payments</span><span className="dd-search-control"><Search size={13} /><input type="search" value={paymentQuery} onChange={(event) => setPaymentQuery(event.target.value)} placeholder="Reference, account or email" aria-label="Search payment ledger" /></span></label>
                  <label><span>Status</span><select className="dd-select-control" value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} aria-label="Filter payments by status"><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="refunded">Refunded</option><option value="cancelled">Cancelled</option></select></label>
                  <button type="button" className="dd-button dd-button-secondary" onClick={() => { setPaymentQuery(''); setPaymentStatus('all'); }}>Clear</button>
                  <button type="button" className="dd-button dd-button-secondary" onClick={exportPayments} disabled={!filteredPayments.length}><Download size={13} /> Export CSV</button>
                </div>
                <div className="dd-list-header dd-admin-billing-list-header"><div><strong>Recorded payment activity</strong><span>{filteredPayments.length} matching record{filteredPayments.length === 1 ? '' : 's'}</span></div><span>Records {paymentRangeStart}-{paymentRangeEnd}</span></div>
                <div className="dd-table-wrap dd-admin-payment-table">
                  <table className="dd-data-table">
                    <thead><tr><th>Reference</th><th>Account</th><th>Amount</th><th>Status</th><th>Billing period</th><th>Recorded</th></tr></thead>
                    <tbody>
                      {pagedPayments.map((payment) => {
                        const user = paymentUsers.get(Number(payment.user_id));
                        return (
                          <tr key={payment.id}>
                            <td><strong>{payment.stripe_payment_intent_id || `PAY-${String(payment.id).padStart(6, '0')}`}</strong><small>{payment.payment_method || 'Payment method not recorded'}</small></td>
                            <td><strong>{user ? `${user.first_name} ${user.last_name}` : `User ${payment.user_id}`}</strong><small>{user?.email || 'Account details unavailable'}</small></td>
                            <td><strong>{formatMoney(payment.amount, payment.currency)}</strong><small>{payment.currency || 'USD'}</small></td>
                            <td><span className={`dd-status-badge is-${enumValue(payment.status, 'pending')}`}>{enumValue(payment.status, 'pending')}</span></td>
                            <td>{formatDate(payment.billing_period_start, 'Not recorded')} - {formatDate(payment.billing_period_end, 'Not recorded')}</td>
                            <td>{formatDate(payment.created_at, 'Not recorded')}</td>
                          </tr>
                        );
                      })}
                      {!pagedPayments.length && <tr><td colSpan="6"><div className="dd-empty-table">No payment records match these filters.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="dd-client-pagination">
                  <span>Records {paymentRangeStart}-{paymentRangeEnd} of {filteredPayments.length}</span>
                  <div><button type="button" className="dd-button dd-button-secondary" disabled={currentPaymentPage <= 1} onClick={() => setPaymentPage((value) => Math.max(1, value - 1))}>Prev</button><span>Page {currentPaymentPage} of {paymentTotalPages}</span><button type="button" className="dd-button dd-button-secondary" disabled={currentPaymentPage >= paymentTotalPages} onClick={() => setPaymentPage((value) => Math.min(paymentTotalPages, value + 1))}>Next</button></div>
                </div>
              </>
            )}
          </section>

          <div className="dd-inline-alert is-info">This page is a read-only commercial register. Plan changes, payment collection and approvals remain controlled by the subscription workflow and signed commercial terms.</div>
        </>
      )}
    </div>
  );
};

export default AdminBillingPlanPage;
