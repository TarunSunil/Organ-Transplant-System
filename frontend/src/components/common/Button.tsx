import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  onClick,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
}) => {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  
  return (
    <button
      className={`${baseClass} ${className} flex items-center gap-2 transition-all duration-200 hover:transform hover:scale-105`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === 'left' && (
        <span className="text-lg font-bold">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="text-lg font-bold">{icon}</span>
      )}
    </button>
  );
};

export default Button;