import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { cva } from 'class-variance-authority';

// Form wrapper component
export const Form = ({ children, onSubmit, className = '', ...props }) => {
  return (
    <form
      onSubmit={onSubmit}
      className={clsx('space-y-6', className)}
      {...props}
    >
      {children}
    </form>
  );
};

// Form field wrapper
export const FormField = ({ 
  children, 
  label, 
  description, 
  error, 
  required = false,
  className = '' 
}) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

// Enhanced input variants
const inputVariants = cva(
  [
    'block w-full rounded-md border transition-colors duration-200 focus:ring-2 focus:ring-offset-2',
    'placeholder:text-gray-400',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        default: [
          'border-gray-300',
          'bg-white',
          'text-gray-900',
          'focus:border-blue-500',
          'focus:ring-blue-500',
        ],
        error: [
          'border-red-300',
          'bg-white',
          'text-gray-900',
          'focus:border-red-500',
          'focus:ring-red-500',
        ],
        success: [
          'border-green-300',
          'bg-white',
          'text-gray-900',
          'focus:border-green-500',
          'focus:ring-green-500',
        ],
      },
      size: {
        sm: 'px-3 py-2 text-sm',
        default: 'px-3 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Enhanced Input component
export const EnhancedInput = forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  error = null,
  success = false,
  icon = null,
  rightIcon = null,
  ...props
}, ref) => {
  const inputVariant = error ? 'error' : success ? 'success' : variant;
  
  if (icon || rightIcon) {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {icon}
            </div>
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            inputVariants({ variant: inputVariant, size }),
            icon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
        {success && !rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <CheckCircleIcon className="h-5 w-5 text-green-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <input
      ref={ref}
      className={clsx(inputVariants({ variant: inputVariant, size }), className)}
      {...props}
    />
  );
});

EnhancedInput.displayName = 'EnhancedInput';

// Enhanced Textarea component
export const EnhancedTextarea = forwardRef(({
  className = '',
  variant = 'default',
  error = null,
  success = false,
  rows = 4,
  ...props
}, ref) => {
  const textareaVariant = error ? 'error' : success ? 'success' : variant;
  
  return (
    <div className="relative">
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(inputVariants({ variant: textareaVariant }), 'resize-none', className)}
        {...props}
      />
      {success && (
        <div className="absolute top-3 right-3 pointer-events-none">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
        </div>
      )}
    </div>
  );
});

EnhancedTextarea.displayName = 'EnhancedTextarea';

// Enhanced Select component
export const EnhancedSelect = forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  error = null,
  success = false,
  children,
  ...props
}, ref) => {
  const selectVariant = error ? 'error' : success ? 'success' : variant;
  
  return (
    <select
      ref={ref}
      className={clsx(
        inputVariants({ variant: selectVariant, size }),
        'cursor-pointer pr-10',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

EnhancedSelect.displayName = 'EnhancedSelect';

// File Upload component
export const FileUpload = ({
  onFileSelect,
  accept = '',
  multiple = false,
  className = '',
  children,
  disabled = false,
  maxSize = null, // in MB
  ...props
}) => {
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    
    if (maxSize) {
      const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        alert(`File(s) too large. Maximum size is ${maxSize}MB.`);
        return;
      }
    }
    
    onFileSelect?.(multiple ? files : files[0]);
  };

  return (
    <div className={clsx('relative', className)}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        {...props}
      />
      <div className={clsx(
        'border-2 border-dashed border-gray-300 rounded-lg p-6 text-center',
        'hover:border-gray-400 transition-colors duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      )}>
        {children || (
          <div>
            <p className="text-sm text-gray-600">
              Click to upload or drag and drop
            </p>
            {accept && (
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: {accept}
              </p>
            )}
            {maxSize && (
              <p className="text-xs text-gray-500">
                Maximum size: {maxSize}MB
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Checkbox component
export const EnhancedCheckbox = forwardRef(({
  className = '',
  label,
  description,
  error,
  ...props
}, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          className={clsx(
            'h-4 w-4 rounded border-gray-300',
            'text-blue-600 focus:ring-blue-500',
            error && 'border-red-300',
            className
          )}
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
          {error && (
            <p className="text-red-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

EnhancedCheckbox.displayName = 'EnhancedCheckbox';

// Radio Group component
export const RadioGroup = ({ options, value, onChange, name, className = '' }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {options.map((option) => (
        <div key={option.value} className="flex items-center">
          <input
            type="radio"
            id={`${name}-${option.value}`}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`${name}-${option.value}`}
            className="ml-3 block text-sm font-medium text-gray-700"
          >
            {option.label}
          </label>
        </div>
      ))}
    </div>
  );
};

// Multi-step form progress indicator
export const FormProgress = ({ currentStep, totalSteps, steps = [] }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={clsx(
              'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
              index <= currentStep
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            )}
          >
            {index + 1}
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
      {steps[currentStep] && (
        <p className="text-sm text-gray-600 mt-2 text-center">
          {steps[currentStep]}
        </p>
      )}
    </div>
  );
};

export default {
  Form,
  FormField,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  FileUpload,
  EnhancedCheckbox,
  RadioGroup,
  FormProgress,
};
