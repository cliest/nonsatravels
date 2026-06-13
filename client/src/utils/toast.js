// Professional centered modal toast notification system

const showToast = (message, type = 'info') => {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'toast-overlay';
  
  const overlayStyles = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    animation: 'fadeIn 0.3s ease-out',
  };
  
  Object.assign(overlay.style, overlayStyles);

  // Create toast modal
  const toast = document.createElement('div');
  toast.className = `toast-modal toast-${type}`;
  
  const icons = {
    success: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    error: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    info: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
    warning: `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`,
  };

  const colors = {
    success: '#10b981',
    error: '#ef4444',
    info: '#3b82f6',
    warning: '#f59e0b',
  };

  const bgColors = {
    success: '#ecfdf5',
    error: '#fef2f2',
    info: '#eff6ff',
    warning: '#fffbeb',
  };

  const textColors = {
    success: '#065f46',
    error: '#991b1b',
    info: '#ffa500',
    warning: '#92400e',
  };
  
  const toastStyles = {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    maxWidth: '450px',
    width: '90%',
    animation: 'scaleIn 0.3s ease-out',
    textAlign: 'center',
  };

  Object.assign(toast.style, toastStyles);
  
  toast.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
      <div style="width: 64px; height: 64px; border-radius: 50%; background-color: ${bgColors[type]}; display: flex; align-items: center; justify-content: center; color: ${colors[type]};">
        ${icons[type]}
      </div>
      <div style="font-size: 18px; font-weight: 600; color: ${textColors[type]};">
        ${message}
      </div>
    </div>
  `;

  overlay.appendChild(toast);
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeToast();
    }
  });

  const closeToast = () => {
    overlay.style.animation = 'fadeOut 0.3s ease-in';
    toast.style.animation = 'scaleOut 0.3s ease-in';
    setTimeout(() => overlay.remove(), 300);
  };

  // Auto close after 3 seconds
  setTimeout(closeToast, 3000);
};

export const toast = {
  success: (message) => showToast(message, 'success'),
  error: (message) => showToast(message, 'error'),
  info: (message) => showToast(message, 'info'),
  warning: (message) => showToast(message, 'warning'),
};

// Add animations to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
    @keyframes scaleIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    @keyframes scaleOut {
      from {
        transform: scale(1);
        opacity: 1;
      }
      to {
        transform: scale(0.8);
        opacity: 0;
      }
    }
    .toast-icon {
      width: 36px;
      height: 36px;
    }
  `;
  document.head.appendChild(style);
}
