import React from 'react';
import { FiCheck, FiX } from 'react-icons/fi';
import { PASSWORD_CONSTRAINTS, validatePasswordStrength, calculatePasswordStrength } from '../../utils/passwordValidation';

/**
 * Password Strength Indicator Component
 * Displays dynamic validation feedback with tick/cross icons
 */
export default function PasswordStrengthIndicator({ password, showStrengthBar = true }) {
  const validation = validatePasswordStrength(password);
  const strength = calculatePasswordStrength(password);

  const getStrengthBarColor = () => {
    const colors = {
      red: 'bg-red-500',
      orange: 'bg-orange-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
    };
    return colors[strength.color] || 'bg-gray-300';
  };

  const getStrengthTextColor = () => {
    const colors = {
      red: 'text-red-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      blue: 'text-blue-600',
      green: 'text-green-600',
    };
    return colors[strength.color] || 'text-gray-600';
  };

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      {showStrengthBar && password && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Password Strength:</span>
            <span className={`font-semibold ${getStrengthTextColor()}`}>
              {strength.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getStrengthBarColor()}`}
              style={{ width: `${(strength.score / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Constraint Checklist */}
      <div className="text-xs space-y-2">
        <p className="font-semibold text-gray-700">Password requirements:</p>
        <ul className="space-y-1.5">
          {Object.keys(PASSWORD_CONSTRAINTS).map((key) => {
            const constraint = PASSWORD_CONSTRAINTS[key];
            const passed = validation.constraints[key];
            
            return (
              <li
                key={key}
                className={`flex items-center gap-2 transition-colors duration-200 ${
                  password
                    ? passed
                      ? 'text-green-600'
                      : 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {password ? (
                  passed ? (
                    <FiCheck className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <FiX className="w-4 h-4 flex-shrink-0" />
                  )
                ) : (
                  <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  </span>
                )}
                <span>{constraint.message}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
