import { lazy, Suspense } from 'react';
import Dashboard from './components/Dashboard';
import ProblemForm from './components/ProblemForm';
import ErrorBoundary from './components/ErrorBoundary';
import { Home, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon, Flame, Zap, BookMarked, Trophy, Target, Timer, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ThemeProvider } from '@/components/theme-provider';
import { useProblems } from './hooks/useProblems';
import { useProblemForm } from './hooks/useProblemForm';
import { useAchievements } from './hooks/useAchievements';

// Lazy load heavy components
const Analytics = lazy(() => import('./components/Analytics'));
const AchievementsGrid = lazy(() => import('./components/Achievements').then(m => ({ default: m.AchievementsGrid })));
const ProblemTabs = lazy(() => import('./components/ProblemTabs'));
const ToSolveProblemList = lazy(() => import('./components/ToSolveProblemList'));
const MasterSheet = lazy(() => import('./components/MasterSheet'));
const SettingsComponent = lazy(() => import('./components/Settings').then(m => ({ default: m.Settings })));
const PracticeSession = lazy(() => import('./components/PracticeSession'));
const DrawingBoardPage = lazy(() => import('./components/DrawingBoardPage'));

// Loading fallback component
const ComponentLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const { theme, setTheme } = useTheme();

  // Custom hooks for state management
  const {
    problems,
    potdProblems,
    toSolveProblems,
    sections,
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
    addSection,
    updateSection,
    deleteSection,
    addProblemToSection,
    removeProblemFromSection,
    addSubsection,
  } = useProblems();

  // Achievements hook
  const { achievements, getAchievementProgress, stats } = useAchievements(problems);

  const totalXp = stats?.xp || 0;

  const { isFormOpen, problemToEdit, formContext, openForm, setIsFormOpen } = useProblemForm();

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


  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ErrorBoundary>
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
                    <span className="text-sm font-semibold">{stats?.currentStreak || 0}</span>
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
                  <Suspense fallback={<ComponentLoader />}>
                    <SettingsComponent onSettingsSave={() => {}}>
                      <Button variant="ghost" size="icon">
                        <SettingsIcon className="h-6 w-6" />
                      </Button>
                    </SettingsComponent>
                  </Suspense>

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
            onAddToSolveProblem={addToSolveProblem}
            onUpdateToSolveProblem={updateToSolveProblem}
            problemToEdit={problemToEdit}
            formContext={formContext}
          />

          <main className="container py-8">
            <Tabs defaultValue="dashboard" className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center justify-between pb-4 gap-4">
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
                  </TabsTrigger>
                  <TabsTrigger value="tosolve">
                    <Target className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Pick to Solve</span>
                    {toSolveProblems.length > 0 && (
                      <div className="ml-2 h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="practice">
                    <Timer className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Practice</span>
                  </TabsTrigger>
                  <TabsTrigger value="drawing">
                    <Pen className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Drawing Board</span>
                  </TabsTrigger>
                  <TabsTrigger value="review">
                    <Star className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Review</span>
                    {dueReviewCount > 0 && (
                      <div className="ml-2 h-2 w-2 bg-red-500 rounded-full"></div>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="achievements">
                    <Trophy className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Achievements</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics">
                    <BarChart3 className="h-5 w-5 sm:mr-2" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="dashboard">
                <Dashboard
                  problems={problems}
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
                <Suspense fallback={<ComponentLoader />}>
                  <ProblemTabs
                    problems={activeProblems}
                    onUpdateProblem={updateProblem}
                    onDeleteProblem={deleteProblem}
                    onProblemReviewed={markProblemReviewed}
                    onEditProblem={openForm}
                    sections={sections}
                    onAddProblemToSection={addProblemToSection}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="mastersheet">
                <Suspense fallback={<ComponentLoader />}>
                  <MasterSheet
                    sections={sections}
                    problems={problems}
                    onAddSection={addSection}
                    onUpdateSection={updateSection}
                    onDeleteSection={deleteSection}
                    onRemoveProblemFromSection={removeProblemFromSection}
                    onUpdateProblem={updateProblem}
                    onAddSubsection={addSubsection}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="tosolve">
                <div className="flex justify-end pb-4">
                  <Button onClick={() => openForm(null, 'tosolve')}>
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

              <TabsContent value="practice">
                <Suspense fallback={<ComponentLoader />}>
                  <PracticeSession />
                </Suspense>
              </TabsContent>

              <TabsContent value="drawing">
                <Suspense fallback={<ComponentLoader />}>
                  <DrawingBoardPage />
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
                  sections={sections}
                  onAddProblemToSection={addProblemToSection}
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
        </div>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
