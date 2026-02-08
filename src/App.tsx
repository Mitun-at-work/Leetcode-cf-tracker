import { lazy, Suspense, useMemo, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import ProblemForm from './components/ProblemForm';
import { Home, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Flame, Zap, BookMarked, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { useProblems } from './hooks/useProblems';
import { useProblemForm } from './hooks/useProblemForm';
import { useAchievements } from './hooks/useAchievements';
import type { Problem } from './types';

// Lazy load heavy components
const Analytics = lazy(() => import('./components/Analytics'));
const AchievementsGrid = lazy(() => import('./components/Achievements').then(m => ({ default: m.AchievementsGrid })));
const ProblemTabs = lazy(() => import('./components/ProblemTabs'));
const ToSolveProblemList = lazy(() => import('./components/ToSolveProblemList'));
const SettingsComponent = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));

// Loading fallback component
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-12">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
    </div>
  </div>
);

function App() {
  const { theme, setTheme } = useTheme();

  // Custom hooks for state management
  const {
    problems,
    potdProblems,
    toSolveProblems,
    activeProblems,
    reviewProblems,
    reviewPotdProblems,
    dueReviewCount,
    addProblem,
    updateProblem,
    deleteProblem,
    markProblemReviewed,
    addToSolveProblem,
    updateToSolveProblem,
    deleteToSolveProblem,
    moveToSolveProblemToSolved,
  } = useProblems();

  // Achievements hook
  const { achievements, unlockedCount, getAchievementProgress, stats } = useAchievements(problems);

  const { isFormOpen, problemToEdit, formContext, openForm, setIsFormOpen } = useProblemForm();

  const getXpForProblem = useCallback((problem: Problem) => {
    if (problem.difficulty === 'Easy') return 10;
    if (problem.difficulty === 'Medium') return 20;
    if (problem.difficulty === 'Hard') return 30;

    const numericDifficulty = Number(problem.difficulty);
    if (!Number.isNaN(numericDifficulty)) {
      if (numericDifficulty < 1200) return 10;
      if (numericDifficulty < 1600) return 20;
      return 30;
    }

    return 15;
  }, []);

  const totalXp = useMemo(() => problems.reduce((sum, p) => sum + getXpForProblem(p), 0), [problems, getXpForProblem]);
  const dailyGoal = 4;
  const dailyGoalAchievedCount = useMemo(() => {
    const counts = problems.reduce<Record<string, number>>((acc, problem) => {
      const dateKey = new Date(problem.dateSolved).toISOString().slice(0, 10);
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

    return Object.values(counts).filter((count) => count >= dailyGoal).length;
  }, [dailyGoal, problems]);

  const getLevelName = (xp: number) => {
    const tier = Math.floor(xp / 3000);
    switch (tier) {
      case 0:
        return 'Novice';
      case 1:
        return 'Rookie';
      case 2:
        return 'Adept';
      case 3:
        return 'Specialist';
      case 4:
        return 'Expert';
      case 5:
        return 'Elite';
      case 6:
        return 'Veteran';
      case 7:
        return 'Champion';
      default:
        return 'Legend';
    }
  };

  const currentLevelName = getLevelName(totalXp);
  const nextLevelName = getLevelName(totalXp + 3000);
  const level = useMemo(() => Math.floor(totalXp / 100) + 1, [totalXp]);
  const xpIntoLevel = useMemo(() => totalXp % 100, [totalXp]);
  const xpToNext = useMemo(() => 100 - xpIntoLevel, [xpIntoLevel]);

  const getLevelColor = (xp: number) => {
    const tier = Math.floor(xp / 3000);
    switch (tier) {
      case 0:
        return 'text-gray-500';
      case 1:
        return 'text-green-500';
      case 2:
        return 'text-cyan-500';
      case 3:
        return 'text-violet-500';
      case 4:
        return 'text-orange-500';
      case 5:
        return 'text-yellow-500';
      case 6:
        return 'text-pink-500';
      case 7:
        return 'text-amber-800';
      default:
        return 'text-red-500';
    }
  };


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 font-sans antialiased">
        <header className="border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold text-lg">LC</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Problem Tracker</h1>
                  <p className="text-sm text-muted-foreground">Master your coding journey</p>
                </div>
              </div>

              <div className="ml-auto flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-3 py-2 bg-red-500/10 rounded-full border border-red-500/20">
                  <Zap className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-bold text-red-500">{stats?.currentStreak || 0}</span>
                  <span className="text-xs text-muted-foreground">streak</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex flex-col items-start text-sm text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-105">
                      <div className="flex items-center space-x-2 px-3 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="font-bold text-foreground">{totalXp}</span>
                        <span className="text-xs text-muted-foreground">XP</span>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64">
                    <div className="space-y-3">
                      <div className="text-sm font-bold">XP Progression</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Current Level</span>
                          <span className="font-semibold">{currentLevelName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Next Level</span>
                          <span className="font-semibold">{nextLevelName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">XP to Next</span>
                          <span className="font-semibold">{xpToNext} XP</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-xs font-semibold text-muted-foreground mb-2">Level Tiers</div>
                        <ul className="space-y-1 text-xs">
                          <li className="flex items-center justify-between"><span className="text-gray-500">0–2999</span><span className="text-gray-500">Novice</span></li>
                          <li className="flex items-center justify-between"><span className="text-green-500">3000–5999</span><span className="text-green-500">Rookie</span></li>
                          <li className="flex items-center justify-between"><span className="text-cyan-500">6000–8999</span><span className="text-cyan-500">Adept</span></li>
                          <li className="flex items-center justify-between"><span className="text-violet-500">9000–11999</span><span className="text-violet-500">Specialist</span></li>
                          <li className="flex items-center justify-between"><span className="text-orange-500">12000–14999</span><span className="text-orange-500">Expert</span></li>
                          <li className="flex items-center justify-between"><span className="text-yellow-500">15000–17999</span><span className="text-yellow-500">Elite</span></li>
                          <li className="flex items-center justify-between"><span className="text-pink-500">18000–20999</span><span className="text-pink-500">Veteran</span></li>
                          <li className="flex items-center justify-between"><span className="text-amber-800">21000–23999</span><span className="text-amber-800">Champion</span></li>
                          <li className="flex items-center justify-between"><span className="text-red-500">24000+</span><span className="text-red-500">Legend</span></li>
                        </ul>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Suspense fallback={<ComponentLoader />}>
                  <SettingsComponent onSettingsSave={() => {}}>
                    <Button variant="ghost" size="icon" className="hover:bg-muted/50 transition-colors">
                      <SettingsIcon className="h-6 w-6" />
                    </Button>
                  </SettingsComponent>
                </Suspense>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <ProblemForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onAddProblem={addProblem}
          onUpdateProblem={updateProblem}
          onAddToSolveProblem={addToSolveProblem}
          onUpdateToSolveProblem={updateToSolveProblem}
          problemToEdit={problemToEdit}
          formContext={formContext}
        />

        <main className="container py-8 px-4">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <div className="flex items-center justify-between pb-6">
              <TabsList className="bg-card/50 backdrop-blur-sm border shadow-lg p-1 h-auto">
                <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                  <Home className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="problems" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                  <List className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Problems</span>
                </TabsTrigger>
                <TabsTrigger value="tosolve" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 relative">
                  <Target className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Pick to Solve</span>
                  {toSolveProblems.length > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>
                <TabsTrigger value="review" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200 relative">
                  <Star className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Review</span>
                  {dueReviewCount > 0 && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                  <Trophy className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Achievements</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200">
                  <BarChart3 className="h-5 w-5" />
                  <span className="hidden sm:inline font-medium">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard
                problems={problems}
              />
            </TabsContent>

            <TabsContent value="problems" className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => openForm()} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Add Problem</span>
                  </div>
                </Button>
              </div>
              <Suspense fallback={<ComponentLoader />}>
                <ProblemTabs
                  problems={activeProblems}
                  onUpdateProblem={updateProblem}
                  onDeleteProblem={deleteProblem}
                  onProblemReviewed={markProblemReviewed}
                  onEditProblem={openForm}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="tosolve" className="space-y-6">
              <div className="flex justify-end">
                <Button onClick={() => openForm(null, 'tosolve')} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-200 hover:scale-105">
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Add Problem to Solve</span>
                  </div>
                </Button>
              </div>
              <Suspense fallback={<ComponentLoader />}>
                <ToSolveProblemList
                  problems={toSolveProblems}
                  onDeleteProblem={deleteToSolveProblem}
                  onMoveToSolved={moveToSolveProblemToSolved}
                  onEditProblem={(problem) => openForm(problem, 'tosolve')}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="review">
              <ProblemTabs
                problems={[...reviewProblems, ...reviewPotdProblems]}
                isReviewList={true}
                onUpdateProblem={updateProblem}
                onDeleteProblem={deleteProblem}
                onProblemReviewed={markProblemReviewed}
                onEditProblem={openForm}
              />
            </TabsContent>

            <TabsContent value="achievements">
              <Suspense fallback={<ComponentLoader />}>
                <AchievementsGrid 
                  achievements={achievements}
                  getProgress={getAchievementProgress}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="analytics">
              <Suspense fallback={<ComponentLoader />}>
                <Analytics problems={problems} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
