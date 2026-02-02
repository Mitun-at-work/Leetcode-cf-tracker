# Achievement System - Developer Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    App.tsx                          │
│  Renders Achievements tab + integrates hook         │
└──────────────┬──────────────────────────────────────┘
               │
               ├─────────────────────────────────────┐
               │                                     │
        ┌──────▼──────────┐              ┌──────────▼─────────┐
        │ useAchievements │              │ AchievementsGrid   │
        │     Hook        │              │    Component       │
        └──────┬──────────┘              └──────────────────┘
               │
        ┌──────▼──────────────┐
        │ achievements.ts     │
        │ (24 definitions)    │
        └─────────────────────┘
```

## Core Components

### 1. useAchievements Hook

**Purpose:** Manage achievement state, calculate stats, check conditions

**Location:** `src/hooks/useAchievements.ts`

**API:**

```typescript
const {
  achievements, // Achievement[] - all achievements with unlock status
  unlockedCount, // number - count of unlocked achievements
  stats, // AchievementStats - calculated from problems
  getAchievementProgress, // (id: string) => number - 0-100
} = useAchievements(problems);
```

**How It Works:**

```typescript
// 1. Initialize from localStorage
useEffect(() => {
  const saved = localStorage.getItem(ACHIEVEMENTS_KEY);
  if (saved) {
    setAchievements(JSON.parse(saved));
  }
}, []);

// 2. Calculate stats from problems
const stats = useMemo<AchievementStats>(() => {
  const totalProblems = problems.length;
  const learnedCount = problems.filter(p => p.status === 'learned').length;
  // ... more stats calculations
  return { totalProblems, learnedCount, ... };
}, [problems]);

// 3. Check conditions on stats change
useEffect(() => {
  const updated = achievements.map(achievement => {
    const def = ACHIEVEMENTS.find(a => a.id === achievement.id);
    if (!def || achievement.unlockedAt) return achievement;

    if (def.condition(stats)) {
      // Unlock!
      toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`);
      return {
        ...achievement,
        unlockedAt: new Date().toISOString(),
      };
    }
    return achievement;
  });

  setAchievements(updated);
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(updated));
}, [stats, isLoaded]);
```

### 2. AchievementsGrid Component

**Purpose:** Display unlocked and locked achievements with progress

**Location:** `src/components/Achievements.tsx`

**Props:**

```typescript
interface AchievementsGridProps {
  achievements: Achievement[];
  getProgress: (id: string) => number;
}
```

**Features:**

- Two-section layout (Unlocked | Locked)
- Grayscale cards for locked achievements
- Green border + gradient for unlocked
- Progress bars with percentages
- Rarity badge coloring
- Sorted display (date | progress)

**Usage:**

```tsx
<AchievementsGrid
  achievements={achievements}
  getProgress={getAchievementProgress}
/>
```

### 3. Achievement Definitions

**Purpose:** Define all 24 achievements with unlock conditions

**Location:** `src/lib/achievements.ts`

**Structure:**

```typescript
const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "first_problem",
    name: "First Steps",
    description: "Solve your first problem",
    icon: "🚀",
    rarity: "common",
    condition: (stats) => stats.totalProblems >= 1,
  },
  // ... 23 more
];

const ACHIEVEMENT_RARITIES: Record<string, string> = {
  common: "#6B7280",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#EAB308",
};
```

---

## Data Structures

### Achievement (Runtime State)

```typescript
interface Achievement {
  id: string; // 'first_problem'
  name: string; // 'First Steps'
  description: string; // 'Solve your first problem'
  icon: string; // '🚀'
  unlockedAt: string | null; // ISO timestamp or null
  rarity: "common" | "rare" | "epic" | "legendary";
}
```

### AchievementDef (Definition/Template)

```typescript
interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: (stats: AchievementStats) => boolean; // The unlock logic!
}
```

### AchievementStats (Computed from Problems)

```typescript
interface AchievementStats {
  totalProblems: number;
  currentStreak: number;
  longestStreak: number;
  platformCounts: Record<string, number>; // { leetcode: 50, ... }
  difficultyCounts: Record<string, number>; // { Easy: 25, ... }
  topicCounts: Record<string, number>; // { array: 10, ... }
  mastersheetCount: number;
  reviewCount: number;
  learnedCount: number;
  xp: number;
  level: number;
}
```

---

## Adding New Achievements

### Step 1: Add to achievements.ts

```typescript
// In src/lib/achievements.ts
const ACHIEVEMENTS: AchievementDef[] = [
  // ... existing achievements
  {
    id: "my_new_achievement",
    name: "My New Achievement",
    description: "Description of what to do",
    icon: "🎉", // Any emoji
    rarity: "rare", // common, rare, epic, legendary
    condition: (stats) => {
      // Return true when achievement should unlock
      return stats.totalProblems >= 100 && stats.currentStreak >= 7;
    },
  },
];
```

### Step 2: It Just Works™

The hook automatically:

1. ✅ Adds it to initial state
2. ✅ Checks condition on each stats update
3. ✅ Shows toast when unlocked
4. ✅ Saves to localStorage
5. ✅ Displays in UI

---

## Condition Examples

### Simple Counters

```typescript
// Unlock at threshold
condition: (stats) => stats.totalProblems >= 100,

// Specific difficulty
condition: (stats) => stats.difficultyCounts['Hard'] >= 25,

// Specific platform
condition: (stats) => stats.platformCounts['codeforces'] >= 30,
```

### Compound Conditions

```typescript
// AND logic (all must be true)
condition: (stats) =>
  stats.totalProblems >= 50 &&
  stats.currentStreak >= 7 &&
  stats.xp >= 1000,

// OR logic (any can be true)
condition: (stats) =>
  stats.totalProblems >= 500 ||
  stats.xp >= 10000,
```

### Topic Conditions

```typescript
// Minimum in one topic
condition: (stats) => {
  return Object.values(stats.topicCounts).some(count => count >= 20);
},

// Polymath (5+ topics)
condition: (stats) => {
  const topicsWithMin = Object.values(stats.topicCounts).filter(count => count >= 20);
  return topicsWithMin.length >= 5;
},
```

### Multi-Platform

```typescript
// 3+ platforms
condition: (stats) => {
  const activePlatforms = Object.entries(stats.platformCounts)
    .filter(([_, count]) => count > 0)
    .length;
  return activePlatforms >= 3 && stats.totalProblems >= 50;
},
```

---

## Storage

### localStorage Key

```typescript
const ACHIEVEMENTS_KEY = "leetcode-cf-tracker-achievements";
```

### Stored Format

```json
[
  {
    "id": "first_problem",
    "name": "First Steps",
    "description": "Solve your first problem",
    "icon": "🚀",
    "unlockedAt": "2024-01-15T10:30:00Z",
    "rarity": "common"
  },
  {
    "id": "ten_problems",
    "name": "Rookie's Start",
    "description": "Solve 10 problems",
    "icon": "🔟",
    "unlockedAt": null,
    "rarity": "common"
  }
]
```

### Manual Backup/Restore

```typescript
// Export achievements
const exported = localStorage.getItem("leetcode-cf-tracker-achievements");
console.log(exported); // Copy to save

// Restore from backup
localStorage.setItem("leetcode-cf-tracker-achievements", jsonData);
// Refresh page
```

---

## Performance Optimizations

### 1. Memoized Stats

```typescript
const stats = useMemo<AchievementStats>(() => {
  // Expensive calculations
  return { ... };
}, [problems]); // Only recalculates when problems change
```

### 2. Memoized Achievements Array

```typescript
const unlockedAchievements = useMemo(
  () => achievements.filter((a) => a.unlockedAt),
  [achievements], // Only refilters when achievements change
);
```

### 3. Optimized Component

```typescript
export function AchievementsGrid({
  achievements,
  getProgress,
}: AchievementsGridProps) {
  // Uses useMemo for derived data
  // Component doesn't re-render unnecessarily
}
```

### 4. Debounced Checks

Achievement checking only runs when stats actually change (not on every render).

---

## Testing

### Test Unlock Logic

```typescript
// In browser console:
const mockStats = {
  totalProblems: 100,
  currentStreak: 7,
  longestStreak: 50,
  // ... fill in other required stats
};

const achievement = ACHIEVEMENTS.find((a) => a.id === "my_achievement");
console.log(achievement.condition(mockStats)); // true/false
```

### Test localStorage

```typescript
// Check saved achievements
JSON.parse(localStorage.getItem("leetcode-cf-tracker-achievements"));

// Clear for fresh start
localStorage.removeItem("leetcode-cf-tracker-achievements");
// Reload page
```

### Test Toast Notification

```typescript
// Manually trigger in browser console
import { toast } from "sonner";
toast.success("🎉 Achievement Unlocked: Test!", {
  description: "This is a test achievement",
});
```

---

## Integration Points

### In App.tsx

```typescript
import { useAchievements } from './hooks/useAchievements';
import { AchievementsGrid } from './components/Achievements';

function App() {
  const { problems } = useProblems();
  const { achievements, unlockedCount, getAchievementProgress } = useAchievements(problems);

  return (
    <TabsContent value="achievements">
      <AchievementsGrid
        achievements={achievements}
        getProgress={getAchievementProgress}
      />
    </TabsContent>
  );
}
```

### In useProblems Hook

```typescript
// No changes needed!
// useAchievements automatically reacts to problem changes
// via dependency: const stats = useMemo(() => {...}, [problems])
```

### In Problem Types

```typescript
// No changes needed!
// AchievementStats extracts all needed data from Problem interface
```

---

## Debugging

### Enable Verbose Logging

```typescript
// In useAchievements.ts, add after checking condition:
useEffect(() => {
  console.log('Achievement Stats:', stats);

  const updatedAchievements = achievements.map(achievement => {
    const def = ACHIEVEMENTS.find(a => a.id === achievement.id);
    if (!def || achievement.unlockedAt) return achievement;

    const shouldUnlock = def.condition(stats);
    console.log(`${achievement.id}: ${shouldUnlock ? 'UNLOCK' : 'locked'}`);

    if (shouldUnlock) { ... }
  });
}, [stats, isLoaded, achievements]);
```

### Check Progress Function

```typescript
// In browser console:
// (after accessing via useAchievements)
const achievement = achievements.find((a) => a.id === "hundred_problems");
const progress = getAchievementProgress(achievement.id);
console.log(`Progress: ${progress}%`); // 0-100
```

---

## Migration Guide (Future Reference)

If moving to a backend system:

1. **Endpoint:** `POST /api/achievements/check`
   - Send: `{ problems: Problem[] }`
   - Receive: `{ achievements: Achievement[] }`

2. **Endpoint:** `GET /api/achievements`
   - Fetch all saved achievements

3. **Endpoint:** `PUT /api/achievements/:id`
   - Update achievement unlock status

---

## Version History

**v1.0.0** (Current)

- ✅ 24 achievements fully implemented
- ✅ localStorage persistence
- ✅ Toast notifications
- ✅ Beautiful UI with rarity system
- ✅ Progress bars for locked achievements
- ✅ Automatic condition checking

---

**Last Updated:** Implementation Release
**Maintainer:** Achievement System Team
