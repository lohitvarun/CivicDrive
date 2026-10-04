import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const Toast = () => {
  const { toasts } = useAuth();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warn: <AlertTriangle size={18} />
  };

  return (
    <div className="toast-box">
      {toasts.map(t => (
        <div key={t.id} className={`toast-item ${t.type}`}>
          {icons[t.type] || icons.info}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};
