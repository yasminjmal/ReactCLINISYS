import React, { useState, useEffect, useRef } from 'react';
import { Info, CheckCircle2, AlertTriangle, X, Bolt } from 'lucide-react';
import './MessageAi.css';

const MessageAi = ({ message, type = 'info', action = null, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true);
  const messageRef = useRef(null);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
    }
  }, [message]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 200);
  };

  const typeConfig = {
    info: { Icon: Info, colorClass: 'text-sky-500', subtleBgClass: 'bg-sky-50 dark:bg-sky-900', borderClass: 'border-sky-200 dark:border-sky-700' },
    success: { Icon: CheckCircle2, colorClass: 'text-green-500', subtleBgClass: 'bg-green-50 dark:bg-green-900', borderClass: 'border-green-200 dark:border-green-700' },
    error: { Icon: AlertTriangle, colorClass: 'text-red-500', subtleBgClass: 'bg-red-50 dark:bg-red-900', borderClass: 'border-red-200 dark:border-red-700' },
    ai: { Icon: Bolt, colorClass: 'text-purple-500', subtleBgClass: 'bg-purple-50 dark:bg-purple-900', borderClass: 'border-purple-200 dark:border-purple-700' },
  };

  const { Icon, colorClass, subtleBgClass, borderClass } = typeConfig?.[type] || typeConfig.info;

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div
      ref={messageRef}
      className={`message-ai ${isVisible ? 'fade-in-scale' : 'fade-out-scale'}`}
    >
      <div className={`message-ai-content ${subtleBgClass} border ${borderClass} rounded-md shadow-md`}>
        <div className="message-ai-header">
          <div className="message-ai-icon-wrapper">
            <Icon className={`${colorClass} message-ai-icon`} size={18} aria-hidden="true" />
          </div>
          <button onClick={handleDismiss} className="message-ai-close-button" aria-label="Dismiss message">
            <X size={14} />
          </button>
        </div>
        <p className="message-ai-text">{message}</p>
        {action && action.text && action.onClick && (
          <div className="message-ai-action">
            <button onClick={action.onClick} className="message-ai-action-button">
              {action.text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageAi;