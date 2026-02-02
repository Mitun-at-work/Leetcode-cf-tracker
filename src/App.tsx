import { lazy, Suspense, useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import ProblemForm from './components/ProblemForm';
import ProblemTabs from './components/ProblemTabs';
import { Home, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Flame, Zap, BookMarked, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Settings as SettingsComponent } from './components/Settings';
import { Badge } from '@/components/ui/badge';
import { useProblems } from './hooks/useProblems';
import { useNotifications } from './hooks/useNotifications';
import { useProblemForm } from './hooks/useProblemForm';
import { useAchievements } from './hooks/useAchievements';
import { getRandomQuote } from './lib/communismQuotes';
import type { Problem } from './types';
import { useMemo } from 'react';

// Lazy load heavy components
const Analytics = lazy(() => import('./components/Analytics'));
const AchievementsGrid = lazy(() => import('./components/Achievements').then(m => ({ default: m.AchievementsGrid })));

// Loading fallback component
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { theme, setTheme } = useTheme();
  const [quoteKey, setQuoteKey] = useState(0);
  const currentQuote = getRandomQuote();

  // Update quote on component mount
  useEffect(() => {
    // Force a new quote on mount
  }, []);

  // Custom hooks for state management
  const {
    problems,
    potdProblems,
    activeProblems,
    reviewProblems,
    reviewPotdProblems,
    dueReviewCount,
    addProblem,
    updateProblem,
    deleteProblem,
    markProblemReviewed,
  } = useProblems();

  // Achievements hook
  const { achievements, unlockedCount, getAchievementProgress } = useAchievements(problems);

  // Filter problems in master sheet
  const masterSheetProblems = useMemo(() => 
    problems.filter(p => p.inMasterSheet),
    [problems]
  );

  const { isFormOpen, problemToEdit, openForm, setIsFormOpen } = useProblemForm();

  const getXpForProblem = (problem: Problem) => {
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
  };

  const totalXp = problems.reduce((sum, p) => sum + getXpForProblem(p), 0);
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


  // Notifications
  useNotifications(problems, potdProblems, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4">
            <div className="relative flex items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">LC</span>
                </div>
                <h1 className="text-xl font-semibold">Problem Tracker</h1>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 text-base font-semibold">
                <span className={getLevelColor(totalXp)}>{currentLevelName}</span>
                <span className="text-muted-foreground"> → </span>
                <span className={`${getLevelColor(totalXp + 3000)} animate-pulse drop-shadow`}>{nextLevelName}</span>
              </div>

              <div className="ml-auto flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-red-500">
                  <Zap className="h-5 w-5" />
                  <span className="text-sm font-semibold">{dailyGoalAchievedCount}</span>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex flex-col items-start text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <span className="flex items-center space-x-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <span className="font-medium text-foreground">{totalXp} XP</span>
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">XP Ranges</div>
                      <ul className="space-y-1 text-sm">
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
                  </PopoverContent>
                </Popover>
                <SettingsComponent onSettingsSave={() => {}}>
                  <Button variant="ghost" size="icon">
                    <SettingsIcon className="h-6 w-6" />
                  </Button>
                </SettingsComponent>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
          problemToEdit={problemToEdit}
        />

        <main className="container py-8">
          <Tabs defaultValue="dashboard" className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between pb-4 gap-4">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground italic max-w-2xl line-clamp-2" key={quoteKey}>
                "{currentQuote}"
              </h1>
              <TabsList>
                <TabsTrigger value="dashboard">
                  <Home className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="problems">
                  <List className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Problems</span>
                </TabsTrigger>
                <TabsTrigger value="mastersheet">
                  <BookMarked className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Master Sheet</span>
                  {masterSheetProblems.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {masterSheetProblems.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="review">
                  <Star className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Review</span>
                  {dueReviewCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {dueReviewCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="achievements">
                  <Trophy className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Achievements</span>
                  {achievements.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unlockedCount}/{achievements.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="analytics">
                  <BarChart3 className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard">
              <Dashboard
                problems={activeProblems}
              />
            </TabsContent>

            <TabsContent value="problems">
              <div className="flex justify-end pb-4">
                <Button onClick={() => openForm()}>
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>Add Problem</span>
                  </div>
                </Button>
              </div>
              <ProblemTabs
                problems={activeProblems}
                onUpdateProblem={updateProblem}
                onDeleteProblem={deleteProblem}
                onProblemReviewed={markProblemReviewed}
                onEditProblem={openForm}
              />
            </TabsContent>

            <TabsContent value="mastersheet">
              <ProblemTabs
                problems={masterSheetProblems}
                onUpdateProblem={updateProblem}
                onDeleteProblem={deleteProblem}
                onProblemReviewed={markProblemReviewed}
                onEditProblem={openForm}
              />
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
