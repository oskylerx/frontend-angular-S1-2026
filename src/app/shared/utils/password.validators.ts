import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordRules {
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  minLength: boolean;
}

export function evaluatePassword(value: string): PasswordRules {
  return {
    hasUppercase: /[A-Z]/.test(value),
    hasLowercase: /[a-z]/.test(value),
    hasNumber: /\d/.test(value),
    hasSpecial: /[^A-Za-z0-9]/.test(value),
    minLength: value.length >= 8
  };
}

export const strongPasswordValidator = (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '');
    if (!value) {
      return { required: true };
    }

    const result = evaluatePassword(value);
    const isValid = Object.values(result).every(Boolean);

    return isValid ? null : { strongPassword: result };
  };
};
