import { useState } from 'react';
import type { Problem, Section } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Trash2, Edit, X, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableSectionProps {
  section: Section;
  problems: Problem[];
  onToggleExpansion: (sectionId: string) => void;
  onEditSection: () => void;
  onDeleteSection: (id: string) => void;
  onRemoveProblem: (sectionId: string, problemId: string) => void;
  isExpanded: boolean;
  editingSection: { id: string; name: string } | null;
  setEditingSection: (section: { id: string; name: string } | null) => void;
}

const SortableSection = ({
  section,
  problems,
  onToggleExpansion,
  onEditSection,
  onDeleteSection,
  onRemoveProblem,
  isExpanded,
  editingSection,
  setEditingSection,
}: SortableSectionProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const sectionProblems = problems.filter(p => section.problemIds.includes(p.id));

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              {...attributes}
              {...listeners}
              className="cursor-grab h-6 w-6 p-0"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
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
          {sectionProblems.length === 0 ? (
            <p className="text-muted-foreground text-sm">No problems in this section yet.</p>
          ) : (
            <div className="space-y-2">
              {sectionProblems.map((problem) => (
                <div key={problem.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline text-sm"
                    >
                      {problem.title}
                    </a>
                    <Badge variant="outline" className="text-xs">{PLATFORM_LABELS[problem.platform]}</Badge>
                    <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveProblem(section.id, problem.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
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
  onReorderSections: (sections: Section[]) => void;
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
  onReorderSections,
  onRemoveProblemFromSection,
  onUpdateProblem,
}: MasterSheetProps) => {
  const [newSectionName, setNewSectionName] = useState('');
  const [editingSection, setEditingSection] = useState<{ id: string; name: string } | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((section) => section.id === active.id);
      const newIndex = sections.findIndex((section) => section.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSections = arrayMove(sections, oldIndex, newIndex);
        onReorderSections(reorderedSections);
      }
    }
  };

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
    if (sectionId.startsWith('topic-')) {
      // For automatic topic sections, remove from master sheet
      if (onUpdateProblem) {
        onUpdateProblem(problemId, { inMasterSheet: false });
        toast.success('Problem removed from master sheet!');
      }
    } else {
      onRemoveProblemFromSection(sectionId, problemId);
      toast.success('Problem removed from section!');
    }
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

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Section</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Section name"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
            />
            <Button onClick={handleAddSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">No sections created yet. Add a section to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {sections.map((section) => {
                const isExpanded = expandedSections.has(section.id);
                
                return (
                  <SortableSection
                    key={section.id}
                    section={section}
                    problems={problems}
                    onToggleExpansion={toggleSectionExpansion}
                    onEditSection={handleUpdateSection}
                    onDeleteSection={handleDeleteSection}
                    onRemoveProblem={handleRemoveProblem}
                    isExpanded={isExpanded}
                    editingSection={editingSection}
                    setEditingSection={setEditingSection}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default MasterSheet;