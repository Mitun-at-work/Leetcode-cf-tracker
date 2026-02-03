const REVIEW_INTERVALS_KEY = 'leetcode-cf-tracker-review-intervals';
const DAILY_GOAL_KEY = 'leetcode-cf-tracker-daily-goal';

export const saveReviewIntervals = (intervals: number[]) => {
  try {
    localStorage.setItem(REVIEW_INTERVALS_KEY, JSON.stringify(intervals));
  } catch (error) {
    // Silent fail
  }
};

export const getReviewIntervals = (): number[] => {
  try {
    const data = localStorage.getItem(REVIEW_INTERVALS_KEY);
    if (data) {
      const intervals = JSON.parse(data);
      if (Array.isArray(intervals) && intervals.every(i => typeof i === 'number')) {
        return intervals;
      }
    }
  } catch (error) {
  }
  // Return default intervals if nothing is stored or if there's an error
  return [2, 5, 7];
};

export const saveDailyGoal = (goal: number) => {
  try {
    localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(goal));
  } catch (error) {
    console.error('Error saving daily goal:', error);
  }
};

export const getDailyGoal = (): number => {
  try {
    const data = localStorage.getItem(DAILY_GOAL_KEY);
    if (data) {
      const goal = JSON.parse(data);
      if (typeof goal === 'number' && goal > 0) {
        return goal;
      }
    }
  } catch (error) {
    console.error('Error loading daily goal:', error);
  }

  return 4;
};
