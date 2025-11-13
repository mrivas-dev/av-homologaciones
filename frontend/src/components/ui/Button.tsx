import { ButtonHTMLAttributes, forwardRef } from 'react';
import { FaSpinner } from 'react-icons/fa';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary/50',
  secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary/50',
  outline: 'bg-transparent border border-gray-300 dark:border-gray-600 text-dark dark:text-light hover:bg-gray-50 dark:hover:bg-gray-800',
  ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-dark dark:text-light',
  link: 'bg-transparent hover:underline text-primary hover:text-primary-dark p-0 h-auto',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>((
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    leftIcon,
    rightIcon,
    ...props
  },
  ref
) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const widthStyles = fullWidth ? 'w-full' : 'w-auto';
  
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {isLoading && <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />}
      {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };
