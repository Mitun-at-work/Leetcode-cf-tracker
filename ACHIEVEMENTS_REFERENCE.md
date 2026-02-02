# Achievement Unlock Conditions & Progress Thresholds

## Quick Reference Table

| Achievement ID        | Name                  | Icon | Rarity    | Condition                            | Progress Threshold     |
| --------------------- | --------------------- | ---- | --------- | ------------------------------------ | ---------------------- |
| first_problem         | First Steps           | 🚀   | Common    | totalProblems ≥ 1                    | 1 problem              |
| ten_problems          | Rookie's Start        | 🔟   | Common    | totalProblems ≥ 10                   | 10 problems            |
| fifty_problems        | Mid-Runner            | 🏃   | Rare      | totalProblems ≥ 50                   | 50 problems            |
| hundred_problems      | Century Club          | 💯   | Rare      | totalProblems ≥ 100                  | 100 problems           |
| five_hundred_problems | Half K Member         | 🎯   | Epic      | totalProblems ≥ 500                  | 500 problems           |
| three_day_streak      | Three-Day Burner      | 🔥   | Common    | currentStreak ≥ 3                    | 3 days                 |
| seven_day_streak      | Weekly Warrior        | 🌊   | Rare      | currentStreak ≥ 7                    | 7 days                 |
| thirty_day_streak     | Month Master          | 📅   | Epic      | currentStreak ≥ 30                   | 30 days                |
| longest_streak        | Legendary Performer   | 👑   | Legendary | longestStreak ≥ 50                   | 50 days                |
| easy_master           | Easy Peasy            | ✅   | Rare      | difficultyCounts['Easy'] ≥ 25        | 25 Easy problems       |
| medium_master         | Medium Mentor         | 🟡   | Epic      | difficultyCounts['Medium'] ≥ 25      | 25 Medium problems     |
| hard_master           | Hard Hitter           | 🔴   | Epic      | difficultyCounts['Hard'] ≥ 25        | 25 Hard problems       |
| leetcode_fan          | LeetCode Fan          | 💡   | Common    | platformCounts['leetcode'] ≥ 50      | 50 LeetCode problems   |
| codeforces_enthusiast | CodeForces Enthusiast | 🟦   | Rare      | platformCounts['codeforces'] ≥ 30    | 30 CodeForces problems |
| platform_master       | Platform Master       | 🌍   | Epic      | 3+ platforms with ≥50 problems total | Multi-platform         |
| topic_expert          | Topic Expert          | 📚   | Rare      | Any topic with ≥20 problems          | 20 in one topic        |
| polymath              | Polymath              | 🧠   | Rare      | 5+ topics with ≥20 problems each     | 5+ topics              |
| level_five            | Rising Star           | ⭐   | Common    | level ≥ 5 (500+ XP)                  | Level 5                |
| level_ten             | Elite Coder           | 🌟   | Rare      | level ≥ 10 (1000+ XP)                | Level 10               |
| level_twenty          | Grand Master          | ✨   | Epic      | level ≥ 20 (2000+ XP)                | Level 20               |
| curator               | Curator's Touch       | 📌   | Rare      | mastersheetCount ≥ 50                | 50 in Master Sheet     |
| reviewer              | Devoted Reviewer      | 👁️   | Rare      | reviewCount ≥ 50                     | 50 reviews             |
| mastered              | Mastered              | 🎓   | Rare      | learnedCount ≥ 30                    | 30 learned             |
| first_thousand_xp     | First Thousand        | ⚡   | Common    | xp ≥ 1000                            | 1000 XP                |
| ten_thousand_xp       | Mega Achiever         | 💪   | Legendary | xp ≥ 10000                           | 10000 XP               |

## Achievement Rarity Distribution

### By Rarity Count:

- **Common (7):** 28% - Easy to achieve, frequent unlock
- **Rare (9):** 37% - Moderate difficulty, well-balanced
- **Epic (7):** 28% - Challenging, feels rewarding
- **Legendary (1):** 4% - Ultimate achievement

### Unlock Difficulty Progression:

1. **Immediate** (First solve): First Steps
2. **Very Easy** (1-2 sessions): Rookie's Start, Three-Day Burner, Rising Star, First Thousand
3. **Easy** (1-2 weeks): Weekly Warrior, Medium Mentor, LeetCode Fan
4. **Medium** (1-2 months): Century Club, Month Master, Level 10, Curator
5. **Hard** (2-4 months): Mid-Runner, Hard Hitter, Hard Hitter
6. **Very Hard** (6+ months): Half K Member, Legendary Performer, Grand Master, Mega Achiever

## XP & Level System

### XP Calculation:

- Easy problem: +10 XP
- Medium problem: +20 XP
- Hard problem: +30 XP
- Average: ~20 XP per problem

### Level Progression:

| Level | XP Range | Achievement Available |
| ----- | -------- | --------------------- |
| 1     | 0-99     | First Steps           |
| 2     | 100-199  | Rookie's Start        |
| 3     | 200-299  | -                     |
| 4     | 300-399  | -                     |
| 5     | 400-499  | Rising Star 🌟        |
| 6     | 500-599  | -                     |
| 7     | 600-699  | -                     |
| 8     | 700-799  | -                     |
| 9     | 800-899  | -                     |
| 10    | 900+     | Elite Coder ✨        |
| 20    | 2000+    | Grand Master ✨       |

### Example Progression:

- 50 Easy problems = 500 XP → Level 5 → "Rising Star" unlocks
- 100 Mixed problems = ~2000 XP → Level 10 → "Elite Coder" unlocks
- 500 Mixed problems = ~10000 XP → Level 100 → "Mega Achiever" unlocks

## Streak System

### Definitions:

- **Current Streak:** Consecutive days solving ≥1 problem
- **Longest Streak:** Maximum consecutive days ever achieved
- **Resets:** If you don't solve on a day, streak resets to 0

### Progression Path:

```
1 day   → 3 day streak → 🔥 Three-Day Burner
        → 7 days       → 🌊 Weekly Warrior
        → 30 days      → 📅 Month Master
        → 50 days      → 👑 Legendary Performer (rarest!)
```

**Note:** This is the longest streak path. Even one day gap resets the current streak!

## Platform-Based Achievements

### LeetCode Path:

- 1st problem → Unlocks in Problems tab
- 50th LeetCode → 💡 LeetCode Fan
- Eventually contribute to 🌍 Platform Master

### CodeForces Path:

- 30th CodeForces → 🟦 CodeForces Enthusiast
- Can mix with other platforms for 🌍 Platform Master

### Multi-Platform Path:

- Need 3 different platforms
- ≥50 total problems across all platforms
- 🌍 Platform Master

## Difficulty-Based Achievements

### All Paths Require 25 Problems:

- 25 Easy → ✅ Easy Peasy
- 25 Medium → 🟡 Medium Mentor
- 25 Hard → 🔴 Hard Hitter

**Tip:** Mix difficulties for fastest progression (e.g., 15 Easy + 10 Medium gets you 25% toward all three)

## Topic-Based Achievements

### Topic Expert 📚:

- Pick any topic you like
- Solve 20 problems in that topic
- ✅ Topic Expert unlocks

**Example Topics:** Array, DP, Graphs, Strings, Greedy, Sorting, etc.

### Polymath 🧠:

- Need 5 different topics
- Each with ≥20 problems
- Total = ≥100 problems
- 🧠 Polymath unlocks

**Hardest requirement:** Most diverse learners!

## Review System Achievements

### Devoted Reviewer 👁️:

- `reviewCount ≥ 50`
- Solve and review 50 problems
- Spaced repetition matters here

### Mastered 🎓:

- Mark 30 problems with status = "learned"
- Not just reviewed, but fully mastered
- 🎓 Mastered unlocks

## Master Sheet Achievements

### Curator's Touch 📌:

- Add problems to Master Sheet
- Need 50 in Master Sheet
- Shows curation effort
- 📌 Curator's Touch unlocks

## Summary Statistics

### Total Achievements: **24**

**By Category:**

- Milestones: 5
- Streaks: 4
- Difficulty: 3
- Platforms: 3
- Topics: 2
- Levels: 3
- Special: 4

**Completion Spectrum:**

- Can get first achievement in minutes
- Can unlock all in 6-12 months of consistent practice
- Legendaries require serious dedication

### Gamification Value:

- ✅ Immediate gratification (First Steps)
- ✅ Short-term goals (Streaks)
- ✅ Long-term goals (500 problems, 50-day streak)
- ✅ Multiple paths (different platform/topic combinations)
- ✅ Social proof (high rarity achievements)

---

**Last Updated:** Implementation Release
**System Status:** ✅ Active and Functional
