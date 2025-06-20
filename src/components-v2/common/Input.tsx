import React from 'react';

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  size?: 'small' | 'medium' | 'large';
  error?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  disabled = false,
  required = false,
  name,
  id,
  size = 'medium',
  error = false,
  helperText
}) => {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-5 py-4 text-lg'
  };

  const baseClasses = 'input w-full rounded-md border transition-colors duration-200';
  const sizeClass = sizeClasses[size];
  const errorClasses = error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className={`${baseClasses} ${sizeClass} ${errorClasses} ${disabledClasses} ${className}`}
      />
      {helperText && (
        <p className={`mt-1 text-sm ${error ? 'text-red-500' : 'text-gray-500'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input; 