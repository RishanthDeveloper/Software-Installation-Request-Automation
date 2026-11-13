export function Notice({ tone = 'info', children, action }) {
  if (!children) return null;
  return (
    <div className={`notice notice--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {action}
    </div>
  );
}

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  return (
    <Notice
      tone="error"
      action={onRetry && <button type="button" className="text-button" onClick={onRetry}>Try again</button>}
    >
      {error.message}
    </Notice>
  );
}

export function SuccessMessage({ children }) {
  return <Notice tone="success">{children}</Notice>;
}

export function LoadingRows({ rows = 4 }) {
  return (
    <div className="skeleton" aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, i) => <span key={i} />)}
    </div>
  );
}
