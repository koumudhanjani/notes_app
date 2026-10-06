import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let color = '#10b981';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          color = '#ef4444';
        } else if (toast.type === 'info') {
          Icon = Info;
          color = '#6366f1';
        }

        return (
          <div key={toast.id} className="toast" onClick={() => removeToast(toast.id)}>
            <Icon size={16} color={color} />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
