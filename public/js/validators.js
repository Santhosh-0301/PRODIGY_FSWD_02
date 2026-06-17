// ===== VALIDATORS =====

export const rules = {
  required:  (v) => v?.toString().trim() ? null : 'This field is required.',
  email:     (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)  ? null : 'Enter a valid email address.',
  phone:     (v) => !v || /^[0-9]{10}$/.test(v)                   ? null : 'Enter a valid 10-digit phone number.',
  salary:    (v) => !v || Number(v) >= 0                           ? null : 'Salary must be 0 or greater.',
  pastDate:  (v) => !v || new Date(v) <= new Date()                ? null : 'Date cannot be in the future.',
};

export function validateField(inputEl, ruleFn) {
  const value = inputEl.value;
  const error = ruleFn(value);
  const group = inputEl.closest('.form-group');
  const errEl = group?.querySelector('.form-error');

  if (error) {
    inputEl.classList.add('error');
    if (errEl) errEl.textContent = error;
    return false;
  } else {
    inputEl.classList.remove('error');
    if (errEl) errEl.textContent = '';
    return true;
  }
}

export function clearError(inputEl) {
  const group = inputEl.closest('.form-group');
  const errEl = group?.querySelector('.form-error');
  inputEl.classList.remove('error');
  if (errEl) errEl.textContent = '';
}

export function clearAllErrors(formEl) {
  formEl.querySelectorAll('.form-input.error, .form-select.error').forEach(el => {
    el.classList.remove('error');
  });
  formEl.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });
}
