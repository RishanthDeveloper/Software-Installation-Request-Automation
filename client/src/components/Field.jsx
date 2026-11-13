import { cloneElement, useEffect } from 'react';

// A labelled form field. The label sits above, the hint and the error under it,
// and the control is linked to both for screen readers.
export function Field({ id, label, optional, hint, error, children }) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {optional && <span className="optional"> (optional)</span>}
      </label>
      {cloneElement(children, {
        id,
        'aria-invalid': error ? 'true' : undefined,
        'aria-describedby': describedBy,
      })}
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      {error && <p id={errorId} className="field__error">{error}</p>}
    </div>
  );
}

// Turns the server's validation details into { fieldName: message }.
export function fieldErrorsFrom(error) {
  const out = {};
  if (Array.isArray(error?.details)) {
    error.details.forEach((d) => {
      if (d.field && !out[d.field]) out[d.field] = d.message;
    });
  }
  return out;
}

// After a failed submit, move the focus to the first field that failed.
export function useFocusFirstError(errors) {
  useEffect(() => {
    if (Object.keys(errors).length) {
      document.querySelector('[aria-invalid="true"]')?.focus();
    }
  }, [errors]);
}
