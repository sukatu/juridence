import React, { forwardRef, useId } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const buttonVariants = {
  primary: 'ui-btn-primary',
  secondary: 'ui-btn-secondary',
  outline: 'ui-btn-outline',
  ghost: 'ui-btn-ghost',
  danger: 'ui-btn-danger',
  white: 'ui-btn-outline',
  dark: 'ui-btn-primary',
};

const buttonSizes = {
  sm: 'ui-btn-sm',
  md: '',
  lg: 'ui-btn-lg',
  xl: 'ui-btn-lg',
};

export const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  to,
  className = '',
  children,
  type = 'button',
  ...props
}, ref) => {
  const classes = cx(
    'ui-btn',
    buttonVariants[variant] || buttonVariants.primary,
    buttonSizes[size] || '',
    fullWidth && 'w-full',
    className
  );
  const iconElement = icon && !loading ? <span className="shrink-0">{icon}</span> : null;
  const content = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" /> : iconPosition === 'left' && iconElement}
      <span>{children}</span>
      {!loading && iconPosition === 'right' && iconElement}
    </>
  );

  if (to && !disabled && !loading) {
    return <Link ref={ref} to={to} className={classes} {...props}>{content}</Link>;
  }

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
});

Button.displayName = 'Button';

export const IconButton = forwardRef(({ label, variant = 'ghost', size = 'md', className = '', children, ...props }, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    className={cx('ui-icon-btn', className)}
    aria-label={label}
    title={label}
    {...props}
  >
    {children}
  </Button>
));

IconButton.displayName = 'IconButton';

export const Field = ({ label, htmlFor, required, hint, error, className = '', children }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="ui-label">
        {label}{required && <span className="ml-1 text-[#b52f3f]">*</span>}
      </label>
    )}
    {children}
    {error ? <p className="ui-field-error" role="alert">{error}</p> : hint && <p className="ui-hint">{hint}</p>}
  </div>
);

export const Input = forwardRef(({
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  id,
  required,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <Field label={label} htmlFor={inputId} required={required} hint={hint} error={error} className={className}>
      <div className={cx('ui-control flex items-center gap-3 px-3.5', error && '!border-[#b52f3f]')}>
        {leadingIcon && <span className="shrink-0 text-[#71838d]">{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={cx('h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm outline-none', inputClassName)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {trailing && <span className="shrink-0">{trailing}</span>}
      </div>
    </Field>
  );
});

Input.displayName = 'Input';

export const Select = forwardRef(({
  label,
  hint,
  error,
  id,
  required,
  className = '',
  selectClassName = '',
  children,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = id || generatedId;
  return (
    <Field label={label} htmlFor={selectId} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={cx('ui-control appearance-none px-3.5 pr-10', error && '!border-[#b52f3f]', selectClassName)}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={17} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71838d]" />
      </div>
    </Field>
  );
});

Select.displayName = 'Select';

export const Textarea = forwardRef(({
  label,
  hint,
  error,
  id,
  required,
  className = '',
  textareaClassName = '',
  rows = 4,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = id || generatedId;
  return (
    <Field label={label} htmlFor={textareaId} required={required} hint={hint} error={error} className={className}>
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        rows={rows}
        className={cx('ui-control resize-y px-3.5 py-3', error && '!border-[#b52f3f]', textareaClassName)}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
});

Textarea.displayName = 'Textarea';

export const Checkbox = forwardRef(({ label, description, className = '', id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <label htmlFor={inputId} className={cx('flex cursor-pointer items-start gap-3', className)}>
      <input ref={ref} id={inputId} type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#9aabb3] text-[#17875a] focus:ring-[#17875a]" {...props} />
      <span>
        <span className="block text-sm font-medium text-[#405867]">{label}</span>
        {description && <span className="mt-1 block text-xs leading-5 text-[#7a8991]">{description}</span>}
      </span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export const Radio = forwardRef(({ label, description, className = '', id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <label htmlFor={inputId} className={cx('flex cursor-pointer items-start gap-3', className)}>
      <input ref={ref} id={inputId} type="radio" className="mt-0.5 h-4 w-4 border-[#9aabb3] text-[#17875a] focus:ring-[#17875a]" {...props} />
      <span>
        <span className="block text-sm font-medium text-[#405867]">{label}</span>
        {description && <span className="mt-1 block text-xs leading-5 text-[#7a8991]">{description}</span>}
      </span>
    </label>
  );
});

Radio.displayName = 'Radio';

const badgeVariants = {
  neutral: 'ui-badge-neutral',
  success: 'ui-badge-success',
  warning: 'ui-badge-warning',
  danger: 'ui-badge-danger',
  info: 'ui-badge-info',
};

export const Badge = ({ variant = 'neutral', className = '', children }) => (
  <span className={cx('ui-badge', badgeVariants[variant] || badgeVariants.neutral, className)}>{children}</span>
);

export const Panel = ({ title, description, actions, footer, className = '', bodyClassName = '', children }) => (
  <section className={cx('ui-panel', className)}>
    {(title || description || actions) && (
      <div className="ui-panel-header flex items-start justify-between gap-4">
        <div>
          {title && <h2 className="font-semibold text-[#17334a]">{title}</h2>}
          {description && <p className="mt-1 text-xs leading-5 text-[#7a8991]">{description}</p>}
        </div>
        {actions}
      </div>
    )}
    <div className={cx('ui-panel-body', bodyClassName)}>{children}</div>
    {footer && <div className="ui-panel-footer">{footer}</div>}
  </section>
);

export const PageHeader = ({ eyebrow, title, description, actions, className = '' }) => (
  <div className={cx('ui-page-header', className)}>
    <div>
      {eyebrow && <p className="ui-page-eyebrow">{eyebrow}</p>}
      <h1 className="ui-page-title">{title}</h1>
      {description && <p className="ui-page-description">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export { cx };
