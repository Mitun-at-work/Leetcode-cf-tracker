import Dashboard from './components/Dashboard';
import ProblemForm from './components/ProblemForm';
import Analytics from './components/Analytics';
import ProblemTabs from './components/ProblemTabs';
import { Home, Plus, List, BarChart3, Moon, Sun, Star, Settings as SettingsIcon} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme, ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { Settings as SettingsComponent } from './components/Settings';
import { Badge } from '@/components/ui/badge';
import { useProblems } from './hooks/useProblems';
// import { useContests } from './hooks/useContests';
import { useNotifications } from './hooks/useNotifications';
import { useProblemForm } from './hooks/useProblemForm';

function App() {
  const { theme, setTheme } = useTheme();

  // Custom hooks for state management
  const {
    problems,
    potdProblems,
    activeProblems,
    reviewProblems,
    learnedProblems,
    reviewPotdProblems,
    dueReviewCount,
    addProblem,
    updateProblem,
    deleteProblem,
    markProblemReviewed,
    addPotdProblem,
    importProblems,
  } = useProblems();

  const { isFormOpen, problemToEdit, openForm, setIsFormOpen } = useProblemForm();

  // Notifications
  useNotifications(problems, potdProblems, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <header className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">LC</span>
                </div>
                <h1 className="text-xl font-semibold">Problem Tracker</h1>
              </div>

              <div className="flex items-center space-x-4">
                <SettingsComponent onSettingsSave={() => {}}>
                  <Button variant="ghost" size="icon">
                    <SettingsIcon className="h-6 w-6" />
                  </Button>
                </SettingsComponent>

                <span className="text-sm text-muted-foreground">
                  {problems.length} problem{problems.length !== 1 ? 's' : ''} tracked
                </span>

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
            <div className="flex items-center justify-between pb-4">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                LEETCODE + CF TRACKER
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
                <TabsTrigger value="review">
                  <Star className="h-5 w-5 sm:mr-2" />
                  <span className="hidden sm:inline">Review</span>
                  {dueReviewCount > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {dueReviewCount}
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
                onUpdateProblem={updateProblem}
                onAddPotd={addPotdProblem}
                onImportProblems={importProblems}
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

            <TabsContent value="review">
              <ProblemTabs
                problems={[...reviewProblems, ...reviewPotdProblems]}
                isPotdList={false}
                isReviewList={true}
                onUpdateProblem={updateProblem}
                onDeleteProblem={deleteProblem}
                onProblemReviewed={markProblemReviewed}
                onEditProblem={openForm}
              />
            </TabsContent>

           

            <TabsContent value="analytics">
              <Analytics problems={problems} />
            </TabsContent>
          </Tabs>
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
