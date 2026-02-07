import { useState } from 'react';
import type { Problem, Section } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Trash2, Edit, X, ChevronDown, ChevronRight, ExternalLink, CheckCircle, Circle, Search, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface SectionProps {
  section: Section;
  problems: Problem[];
  onToggleExpansion: (sectionId: string) => void;
  onEditSection: () => void;
  onDeleteSection: (id: string) => void;
  onRemoveProblem: (sectionId: string, problemId: string) => void;
  onUpdateProblem?: (id: string, updates: Partial<Problem>) => void;
  isExpanded: boolean;
  editingSection: { id: string; name: string } | null;
  setEditingSection: (section: { id: string; name: string } | null) => void;
  level?: number;
  expandedSections: Set<string>;
}

const Section = ({
  section,
  problems,
  onToggleExpansion,
  onEditSection,
  onDeleteSection,
  onRemoveProblem,
  onUpdateProblem,
  isExpanded,
  editingSection,
  setEditingSection,
  level = 0,
  expandedSections,
}: SectionProps) => {
  const sectionProblems = problems.filter(p => section.problemIds.includes(p.id));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleExpansion(section.id)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            {editingSection?.id === section.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={editingSection!.name}
                  onChange={(e) => setEditingSection(editingSection ? { ...editingSection, name: e.target.value } : null)}
                  onKeyPress={(e) => e.key === 'Enter' && onEditSection()}
                  className="flex-1 h-8"
                />
                <Button size="sm" onClick={() => onEditSection()} className="h-8">Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingSection(null)} className="h-8">Cancel</Button>
              </div>
            ) : (
              <CardTitle className="text-lg cursor-pointer flex items-center gap-2" onClick={() => onToggleExpansion(section.id)}>
                {section.name}
              </CardTitle>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 py-1">
              {sectionProblems.length}
            </Badge>
            <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingSection({ id: section.id, name: section.name })}>
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteSection(section.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Section
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="pt-0">
          {/* Section Statistics */}
          <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{sectionProblems.length}</span>
                <span className="text-muted-foreground">problems</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">
                  {sectionProblems.filter(p => p.status === 'learned').length}
                </span>
                <span className="text-muted-foreground">learned</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <div className="w-24">
                <Progress
                  value={sectionProblems.length > 0 ? (sectionProblems.filter(p => p.status === 'learned').length / sectionProblems.length) * 100 : 0}
                  className="h-2"
                />
              </div>
              <span className="text-sm font-medium">
                {Math.round(sectionProblems.length > 0 ? (sectionProblems.filter(p => p.status === 'learned').length / sectionProblems.length) * 100 : 0)}%
              </span>
            </div>
          </div>

          {/* Show problems */}
          {sectionProblems.length === 0 ? (
            <div className="text-center py-8">
              <Circle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No problems in this section yet.</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add problems to start tracking your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sectionProblems.map((problem) => (
                <div key={problem.id} className="group relative p-4 border rounded-lg bg-card hover:bg-muted/30 hover:border-muted-foreground/20 transition-all duration-200 shadow-sm hover:shadow-md">
                  <div className="flex items-start gap-4">
                    {/* Status Checkbox */}
                    <div className="flex-shrink-0 mt-1">
                      <Checkbox
                        checked={problem.status === 'learned'}
                        onCheckedChange={(checked) => {
                          if (onUpdateProblem) {
                            const newStatus = checked ? 'learned' : 'active';
                            onUpdateProblem(problem.id, { status: newStatus });
                          }
                        }}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        title={`Mark as ${problem.status === 'learned' ? 'active' : 'learned'}`}
                      />
                    </div>

                    {/* Problem Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold hover:underline text-foreground block truncate text-base leading-tight"
                          >
                            {problem.title}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <ExternalLink className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-xs text-muted-foreground">
                              {PLATFORM_LABELS[problem.platform]}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveProblem(section.id, problem.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0"
                          title="Remove from subsection"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Tags and Difficulty */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs px-2 py-1 font-medium ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </Badge>
                        {problem.topics && problem.topics.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {problem.topics.slice(0, 4).map((topic: string) => (
                              <Badge key={topic} variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                {topic}
                              </Badge>
                            ))}
                            {problem.topics.length > 4 && (
                              <Badge variant="outline" className="text-xs px-2 py-1 bg-muted/50">
                                +{problem.topics.length - 4}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Additional Info */}
                      {problem.dateSolved && problem.dateSolved !== '' && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Solved on {new Date(problem.dateSolved).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface MasterSheetProps {
  sections: Section[];
  problems: Problem[];
  onAddSection: (name: string) => void;
  onUpdateSection: (id: string, name: string) => void;
  onDeleteSection: (id: string) => void;
  onRemoveProblemFromSection: (sectionId: string, problemId: string) => void;
  onUpdateProblem?: (id: string, updates: Partial<Problem>) => void;
}

const PLATFORM_LABELS: Record<Problem['platform'], string> = {
  leetcode: 'LeetCode',
  codeforces: 'CodeForces',
  atcoder: 'AtCoder',
  algozenith: 'AlgoZenith',
  cses: 'CSES',
  hackerrank: 'HackerRank',
};

const getDifficultyColor = (difficulty: string) => {
  if (difficulty === 'Easy') return 'bg-green-600 text-white border-green-600 hover:bg-green-700';
  if (difficulty === 'Medium') return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600';
  if (difficulty === 'Hard') return 'bg-red-600 text-white border-red-600 hover:bg-red-700';
  
  const numericDifficulty = Number(difficulty);
  if (!Number.isNaN(numericDifficulty)) {
    if (numericDifficulty < 1200) return 'bg-green-600 text-white border-green-600 hover:bg-green-700';
    if (numericDifficulty < 1600) return 'bg-orange-500 text-white border-orange-500 hover:bg-orange-600';
    return 'bg-red-600 text-white border-red-600 hover:bg-red-700';
  }

  return 'bg-foreground text-background border-foreground';
};

const MasterSheet = ({
  sections,
  problems,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onRemoveProblemFromSection,
  onUpdateProblem,
}: MasterSheetProps) => {
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<{ id: string; name: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddSection = () => {
    if (newSectionName.trim()) {
      onAddSection(newSectionName.trim());
      setNewSectionName('');
      toast.success('Section added successfully!');
    }
  };

  const handleUpdateSection = () => {
    if (editingSection && editingSection.name.trim()) {
      onUpdateSection(editingSection.id, editingSection.name.trim());
      setEditingSection(null);
      toast.success('Section updated successfully!');
    }
  };

  const handleDeleteSection = (id: string) => {
    onDeleteSection(id);
    toast.success('Section deleted successfully!');
  };

  const handleRemoveProblem = (sectionId: string, problemId: string) => {
    onRemoveProblemFromSection(sectionId, problemId);
    toast.success('Problem removed from section!');
  };

  const toggleSectionExpansion = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  // Filter sections based on search query
  const filteredSections = sections.filter(section => {
    if (!searchQuery.trim()) return true;

    const sectionProblems = problems.filter(p => section.problemIds.includes(p.id));
    const query = searchQuery.toLowerCase();

    // Search in section name
    if (section.name.toLowerCase().includes(query)) return true;

    // Search in problem titles, platforms, or topics
    return sectionProblems.some(problem =>
      problem.title.toLowerCase().includes(query) ||
      problem.platform.toLowerCase().includes(query) ||
      (problem.topics && problem.topics.some((topic: string) => topic.toLowerCase().includes(query)))
    );
  });

  // Calculate overall statistics
  const totalProblems = sections.reduce((acc, section) => acc + problems.filter(p => section.problemIds.includes(p.id)).length, 0);
  const solvedProblems = sections.reduce((acc, section) => {
    const sectionProblems = problems.filter(p => section.problemIds.includes(p.id));
    return acc + sectionProblems.filter(p => p.status === 'learned').length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalProblems}</p>
                <p className="text-sm text-muted-foreground">Total Problems</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{solvedProblems}</p>
                <p className="text-sm text-muted-foreground">Solved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Circle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{totalProblems - solvedProblems}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Search */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Search Problems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, platform, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Add Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Add New Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter section name..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
              />
              <Button onClick={handleAddSection} disabled={!newSectionName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections */}
      {filteredSections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <Search className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    No sections or problems match "{searchQuery}"
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear search
                  </Button>
                </>
              ) : (
                <>
                  <Plus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No sections yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first section to start organizing your coding problems
                  </p>
                  <Button onClick={() => {
                    const input = document.querySelector('input[placeholder="Enter section name..."]') as HTMLInputElement;
                    input?.focus();
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Section
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSections.map((section) => {
            const isExpanded = expandedSections.has(section.id);

            return (
              <Section
                key={section.id}
                section={section}
                problems={problems}
                onToggleExpansion={toggleSectionExpansion}
                onEditSection={handleUpdateSection}
                onDeleteSection={handleDeleteSection}
                onRemoveProblem={handleRemoveProblem}
                onUpdateProblem={onUpdateProblem}
                isExpanded={isExpanded}
                editingSection={editingSection}
                setEditingSection={setEditingSection}
                expandedSections={expandedSections}
              />
            );
          })}
        </div>
      )}

    </div>
  );
};

export default MasterSheet;