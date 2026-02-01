import { useEffect } from 'react';
import type { Problem, Contest } from '../types';

export const useNotifications = (
  problems: Problem[],
  potdProblems: Problem[],
  contests: Contest[]
) => {
  useEffect(() => {
    const enableNotifications = localStorage.getItem('enableNotifications') === 'true';

    if (enableNotifications && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }

    if (!enableNotifications) return;

    const checkReminders = () => {
      // Check due reviews
      const dueReviews = [...problems, ...potdProblems].filter(
        p => p.nextReviewDate && new Date(p.nextReviewDate) <= new Date()
      );

      if (dueReviews.length > 0) {
        new Notification(`You have ${dueReviews.length} problems due for review!`);
      }

      // Check upcoming contests (within 1 hour)
      const upcoming = contests.filter(c => {
        const start = new Date(c.startTime);
        const now = new Date();
        const timeDiff = start.getTime() - now.getTime();
        return c.status === 'scheduled' && start > now && timeDiff <= 3600000;
      });

      if (upcoming.length > 0) {
        new Notification(`Upcoming contest: ${upcoming[0].name} starts soon!`);
      }
    };

    checkReminders(); // Initial check
    const interval = setInterval(checkReminders, 3600000); // Every hour

    return () => clearInterval(interval);
  }, [problems, potdProblems, contests]);
};
