// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
// import { Badge } from './ui/badge';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { 
//   Building2, 
//   Search, 
//   ExternalLink, 
//   CheckCircle, 
//   Trash2,
//   Filter,
//   Target,
//   Clock
// } from 'lucide-react';
// import { toast } from 'sonner';
// import type { Problem } from '../types';

// interface CompanyProblemsViewProps {
//   companyProblems: Problem[];
//   onMarkAsSolved: (problem: Problem) => void;
//   onRemoveProblem: (problemId: string) => void;
// }

// const CompanyProblemsView: React.FC<CompanyProblemsViewProps> = ({
//   companyProblems,
//   onMarkAsSolved,
//   onRemoveProblem
// }) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCompany, setSelectedCompany] = useState<string>('all');
//   const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

//   // Get unique companies from the problems
//   const companies = Array.from(new Set(companyProblems.flatMap(p => p.companies))).sort();

//   // Filter problems based on search and filters
//   const filteredProblems = companyProblems.filter(problem => {
//     const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          problem.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    
//     const matchesCompany = selectedCompany === 'all' || 
//                           problem.companies.includes(selectedCompany);
    
//     const matchesDifficulty = selectedDifficulty === 'all' || 
//                              problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

//     return matchesSearch && matchesCompany && matchesDifficulty;
//   });

//   const getDifficultyColor = (difficulty: string) => {
//     switch (difficulty.toLowerCase()) {
//       case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
//       case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
//       case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
//       default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
//     }
//   };

//   const handleMarkAsSolved = (problem: Problem) => {
//     onMarkAsSolved(problem);
//     toast.success(`Marked "${problem.title}" as solved! It will now appear in your Problems tab.`);
//   };

//   const handleRemoveProblem = (problemId: string, title: string) => {
//     onRemoveProblem(problemId);
//     toast.success(`Removed "${title}" from company problems.`);
//   };

//   const difficultyStats = filteredProblems.reduce((acc, problem) => {
//     const diff = problem.difficulty.toLowerCase();
//     acc[diff] = (acc[diff] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold tracking-tight">Company Problems</h2>
//           <p className="text-muted-foreground">
//             Problems imported from companies that you haven't solved yet
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Badge variant="outline" className="flex items-center gap-1">
//             <Building2 className="h-3 w-3" />
//             {filteredProblems.length} problems
//           </Badge>
//           <Badge variant="outline" className="flex items-center gap-1">
//             <Target className="h-3 w-3" />
//             {companies.length} companies
//           </Badge>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid gap-4 md:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total</CardTitle>
//             <Clock className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{filteredProblems.length}</div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Easy</CardTitle>
//             <div className="h-4 w-4 rounded bg-green-500"></div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-green-600">{difficultyStats.easy || 0}</div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Medium</CardTitle>
//             <div className="h-4 w-4 rounded bg-yellow-500"></div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-yellow-600">{difficultyStats.medium || 0}</div>
//           </CardContent>
//         </Card>
        
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Hard</CardTitle>
//             <div className="h-4 w-4 rounded bg-red-500"></div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold text-red-600">{difficultyStats.hard || 0}</div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Filter className="h-4 w-4" />
//             Filters
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-3">
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Search</label>
//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search problems or topics..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-8"
//                 />
//               </div>
//             </div>
            
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Company</label>
//               <Select value={selectedCompany} onValueChange={setSelectedCompany}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Companies</SelectItem>
//                   {companies.map(company => (
//                     <SelectItem key={company} value={company}>{company}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
            
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Difficulty</label>
//               <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Difficulties</SelectItem>
//                   <SelectItem value="easy">Easy</SelectItem>
//                   <SelectItem value="medium">Medium</SelectItem>
//                   <SelectItem value="hard">Hard</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Problems List */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Problems ({filteredProblems.length})</CardTitle>
//         </CardHeader>
//         <CardContent>
//           {filteredProblems.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
//               <p>No company problems found.</p>
//               <p className="text-sm">Import some problems from the Dashboard to get started!</p>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {filteredProblems.map((problem) => (
//                 <div key={problem.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <a 
//                         href={problem.url} 
//                         target="_blank" 
//                         rel="noopener noreferrer"
//                         className="font-medium hover:underline flex items-center gap-1"
//                       >
//                         {problem.title}
//                         <ExternalLink className="h-3 w-3" />
//                       </a>
//                       <Badge className={getDifficultyColor(problem.difficulty)}>
//                         {problem.difficulty}
//                       </Badge>
//                     </div>
                    
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <div className="flex gap-1">
//                         {problem.companies.map(company => (
//                           <Badge key={company} variant="outline" className="text-xs">
//                             {company}
//                           </Badge>
//                         ))}
//                       </div>
//                       {problem.topics.length > 0 && (
//                         <div className="flex gap-1">
//                           {problem.topics.slice(0, 3).map(topic => (
//                             <Badge key={topic} variant="secondary" className="text-xs">
//                               {topic}
//                             </Badge>
//                           ))}
//                           {problem.topics.length > 3 && (
//                             <Badge variant="secondary" className="text-xs">
//                               +{problem.topics.length - 3}
//                             </Badge>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <Button
//                       size="sm"
//                       onClick={() => handleMarkAsSolved(problem)}
//                       className="flex items-center gap-1"
//                     >
//                       <CheckCircle className="h-3 w-3" />
//                       Mark as Solved
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => handleRemoveProblem(problem.id, problem.title)}
//                       className="flex items-center gap-1"
//                     >
//                       <Trash2 className="h-3 w-3" />
//                       Remove
//                     </Button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default CompanyProblemsView;
