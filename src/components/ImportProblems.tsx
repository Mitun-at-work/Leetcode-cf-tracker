import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Problem } from '@/types';
import { toast } from 'sonner';

interface ImportedProblemData {
  title: string;
  url: string;
  difficulty: string;
  tags?: string[];
  source?: string;
}

interface ImportError {
  message: string;
}

interface ImportProblemsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (problems: Partial<Problem>[]) => void;
}

const ImportProblems = ({ open, onOpenChange, onImport }: ImportProblemsProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Fetch companies from backend API
  useEffect(() => {
    const fetchCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
        const response = await fetch(`${apiUrl}/companies`);

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setCompanies(result.data);
          }
        }
      } catch (_error) {
        // Fallback to empty array - user can still manually type company name
      } finally {
        setLoadingCompanies(false);
      }
    };

    if (open) {
      fetchCompanies();
    }
  }, [open]);

  const handleImport = async () => {
    if (!selectedCompany) {
      toast.error("Please select a company.");
      return;
    }

    setIsImporting(true);

    try {
      // Use the new backend API for company problems
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${apiUrl}/companies/${encodeURIComponent(selectedCompany)}/problems?limit=500`);

      if (!response.ok) {
        throw new Error(`Failed to fetch problems. Status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !result.data.problems || result.data.problems.length === 0) {
        toast.error(`Could not find any problems for ${selectedCompany}.`);
        setIsImporting(false);
        return;
      }

      const importedProblems: Partial<Problem>[] = result.data.problems.map((problem: ImportedProblemData) => {
        // Extract problem ID from URL (e.g., "two-sum" from "https://leetcode.com/problems/two-sum")
        const urlParts = problem.url.split('/');
        const problemId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || 'unknown';

        return {
          title: problem.title,
          url: problem.url,
          difficulty: problem.difficulty.toLowerCase(), // Normalize to lowercase
          companies: [selectedCompany],
          topics: problem.tags || [],
          notes: `Imported from ${problem.source} - ${result.data.sources.join(', ')}`,
          // Key fields to indicate this is NOT a solved problem
          platform: 'leetcode' as const,
          problemId: problemId,
          status: 'active' as const, // NOT solved yet
          isReview: false, // Not a review problem
          repetition: 0, // No repetitions yet
          interval: 0, // No spaced repetition interval
          nextReviewDate: null, // No review scheduled
          dateSolved: '', // Empty = not solved yet
          createdAt: new Date().toISOString() // When imported
        };
      });

      toast.success(`Successfully imported ${importedProblems.length} problems from ${result.data.sources.join(', ')}`);
      onImport(importedProblems);
      onOpenChange(false);

    } catch (error: unknown) {
      const importError = error as ImportError;
      toast.error(importError.message || 'An unknown error occurred during import.');
    }

    setIsImporting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Company Problems</DialogTitle>
          <DialogDescription>
            Import LeetCode problems tagged by a specific company. This will import the "all-time" list for the selected company.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Select onValueChange={setSelectedCompany} disabled={loadingCompanies}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCompanies ? "Loading companies..." : "Select a company"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedCompany || isImporting}>
            {isImporting ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportProblems; 