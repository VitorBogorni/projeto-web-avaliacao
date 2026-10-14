'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  id?: string;
  htmlFor?: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export default function FormField({
  id,
  htmlFor,
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
  const targetId = id || htmlFor || '';

  return (
    <div className="form-group form-field">
      <label htmlFor={targetId} className="form-label">
        {label} {required && <span className="required-asterisk" aria-hidden="true" style={{ color: 'var(--danger)', fontWeight: 800 }}>*</span>}
      </label>

      {children}

      {error && (
        <span
          id={targetId ? `${targetId}-erro` : undefined}
          role="alert"
          className="form-error field-error-msg"
        >
          {error}
        </span>
      )}
    </div>
  );
}
