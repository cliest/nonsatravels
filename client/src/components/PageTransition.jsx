import React from 'react';

// CSS-only page transition wrapper for smooth animations
const PageTransition = ({ children, className = '' }) => {
  return (
    <div className={`page-transition ${className}`}>
      {children}
      <style>{`
        .page-transition {
          animation: pageEnter 0.3s ease-out;
        }
        
        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PageTransition;
