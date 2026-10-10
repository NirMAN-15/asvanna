import React, { useState } from 'react';
import { validatePassword } from '../utils/validation';

export default function PasswordStrengthInput({
  id = 'password',
  name = 'password',
  label = 'Password',
  value = '',
  onChange,
  required = true,
  placeholder = '••••••••',
  showCriteria = true,
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const valResult = validatePassword(value);
  const { score, hasLength, hasUpper, hasLower, hasNumber, hasSpecial, isValid } = valResult;

  const getStrengthLabel = () => {
    if (!value) return '';
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Moderate';
    return 'Strong';
  };

  const getStrengthColor = () => {
    if (!value) return 'bg-outline-variant';
    if (score <= 2) return 'bg-error';
    if (score <= 4) return 'bg-amber-500';
    return 'bg-emerald-600';
  };

  const criteria = [
    { label: 'At least 8 characters', met: hasLength },
    { label: 'One uppercase letter (A-Z)', met: hasUpper },
    { label: 'One lowercase letter (a-z)', met: hasLower },
    { label: 'One number (0-9)', met: hasNumber },
    { label: 'One special symbol (!@#$%...)', met: hasSpecial },
  ];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="font-label-md text-label-md text-on-surface-variant font-semibold" htmlFor={id}>
          {label}
        </label>
        {value && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              score <= 2
                ? 'bg-error/10 text-error'
                : score <= 4
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {getStrengthLabel()}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-11 pl-4 pr-11 font-body-md text-body-md bg-surface-container-lowest border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition outline-none ${
            value && !isValid ? 'border-amber-400' : value && isValid ? 'border-emerald-500' : 'border-outline-variant'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition p-1"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <span className="material-symbols-outlined text-lg leading-none">
            {showPassword ? 'visibility_off' : 'visibility'}
          </span>
        </button>
      </div>

      {/* Strength Bar */}
      {value.length > 0 && (
        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-0.5">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      )}

      {/* Validation Checklist */}
      {showCriteria && value.length > 0 && !isValid && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-on-surface-variant mt-1.5 p-2 bg-surface-container-lowest rounded-md border border-outline-variant/50">
          {criteria.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span
                className={`material-symbols-outlined text-sm ${
                  c.met ? 'text-emerald-600 font-bold' : 'text-slate-400'
                }`}
              >
                {c.met ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className={c.met ? 'text-emerald-700 font-medium line-through' : 'text-slate-600'}>
                {c.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
