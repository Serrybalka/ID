export interface ToastMessage {
  id: number;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description?: string;
}

export function ToastStack({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="toast-stack" role="region" aria-label="Уведомления">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type}`} role="alert" key={toast.id}>
          <strong>{toast.title}</strong>
          {toast.description && <div>{toast.description}</div>}
        </div>
      ))}
    </div>
  );
}
