import { useState, useEffect, useCallback } from 'react';

/**
 * Toast hook return type
 */
export interface UseToastReturn {
  showFeedback: (text: string, sentiment?: 'good' | 'bad') => void;
  currentGoodToast: string | null;
  currentBadToast: string | null;
}

/**
 * Hook to manage toast notification queues
 * Provides separate queues for positive (blue) and negative (red) feedback
 */
export const useToast = (): UseToastReturn => {
  const [goodToastQueue, setGoodToastQueue] = useState<string[]>([]);
  const [badToastQueue, setBadToastQueue] = useState<string[]>([]);
  const [currentGoodToast, setCurrentGoodToast] = useState<string | null>(null);
  const [currentBadToast, setCurrentBadToast] = useState<string | null>(null);

  /**
   * Show feedback message
   * @param text - Message to display
   * @param sentiment - 'good' for blue (player benefits), 'bad' for red (player suffers)
   */
  const showFeedback = useCallback((text: string, sentiment: 'good' | 'bad' = 'good') => {
    if (sentiment === 'good') {
      setGoodToastQueue(prev => [...prev, text]);
    } else {
      setBadToastQueue(prev => [...prev, text]);
    }
  }, []);

  // Process good toast queue (blue - player benefits)
  useEffect(() => {
    if (goodToastQueue.length > 0 && currentGoodToast === null) {
      const [next, ...rest] = goodToastQueue;
      setCurrentGoodToast(next);
      setGoodToastQueue(rest);
      setTimeout(() => setCurrentGoodToast(null), 1200);
    }
  }, [goodToastQueue, currentGoodToast]);

  // Process bad toast queue (red - player suffers)
  useEffect(() => {
    if (badToastQueue.length > 0 && currentBadToast === null) {
      const [next, ...rest] = badToastQueue;
      setCurrentBadToast(next);
      setBadToastQueue(rest);
      setTimeout(() => setCurrentBadToast(null), 1200);
    }
  }, [badToastQueue, currentBadToast]);

  return {
    showFeedback,
    currentGoodToast,
    currentBadToast,
  };
};
