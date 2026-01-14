import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button component with multiple variants and sizes
 * @param {string} variant - Button style: 'primary', 'secondary', 'outline', 'ghost', 'danger'
 * @param {string} size - Button size: 'sm', 'md', 'lg', 'xl'
 * @param {boolean} disabled - Disable button
 * @param {boolean} loading - Show loading state
 * @param {string} to - If provided, renders as Link instead of button
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {React.ReactNode} icon - Optional icon element
 * @param {string} iconPosition - Icon position: 'left' or 'right'
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  to = null,
  className = '',
  children,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Variant classes
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500',
    secondary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500',
    outline: 'border-2 border-brand-500 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 focus:ring-brand-500',
    ghost: 'text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 focus:ring-brand-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    white: 'bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 focus:ring-slate-500',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500'
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  // Combine classes
  const classes = `
    ${baseClasses}
    ${variantClasses[variant] || variantClasses.primary}
    ${sizeClasses[size] || sizeClasses.md}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Loading spinner
  const loadingSpinner = loading ? (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
  ) : null;

  // Icon element
  const iconElement = icon && !loading ? (
    <span className={iconPosition === 'left' ? 'mr-2' : 'ml-2'}>
      {icon}
    </span>
  ) : null;

  // Content with icon and loading
  const content = (
    <>
      {loadingSpinner || (iconPosition === 'left' && iconElement)}
      {children}
      {iconPosition === 'right' && iconElement}
    </>
  );

  // Render as Link if 'to' prop is provided
  if (to && !disabled && !loading) {
    return (
      <Link
        to={to}
        className={classes}
        {...props}
      >
        {content}
      </Link>
    );
  }

  // Render as button
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;

