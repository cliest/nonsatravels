import { useEffect, useState } from 'react';
import { toast } from '../utils/toast';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasShownOfflineMessage, setHasShownOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasShownOfflineMessage) {
        toast.success('Internet connection restored!');
        setHasShownOfflineMessage(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No internet connection. Please check your network settings.', {
        duration: 6000,
      });
      setHasShownOfflineMessage(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine && !hasShownOfflineMessage) {
      handleOffline();
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasShownOfflineMessage]);

  return isOnline;
};
