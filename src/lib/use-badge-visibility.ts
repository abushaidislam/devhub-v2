import { useState, useEffect } from 'react';

const EXPIRATION_TIME = 3 * 24 * 60 * 60 * 1000; // 3 days in ms
const STORAGE_KEY = 'sidebar_new_tools_status';

export function useBadgeVisibility(toolId: string, isInitiallyNew: boolean, isActive: boolean) {
  // Start with false to avoid hydration mismatch if initially New but expired in localStorage,
  // or start with isInitiallyNew and handle hydration.
  // Actually, standard way to avoid hydration errors is to start with isInitiallyNew
  // and fix it in useEffect. Let's do that.
  const [isVisible, setIsVisible] = useState(isInitiallyNew);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitiallyNew) {
      setIsVisible(false);
      return;
    }

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      const statuses = storedData ? JSON.parse(storedData) : {};

      const firstOpenedAt = statuses[toolId];

      if (firstOpenedAt) {
        const hasExpired = Date.now() - firstOpenedAt > EXPIRATION_TIME;
        if (hasExpired) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else if (isActive) {
        statuses[toolId] = Date.now();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
        setIsVisible(true);
      } else {
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Error reading badge visibility from localStorage', error);
      setIsVisible(isInitiallyNew);
    }
  }, [toolId, isInitiallyNew, isActive]);

  return isMounted ? isVisible : isInitiallyNew;
}
