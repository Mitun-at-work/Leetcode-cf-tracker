import { useState, useEffect, useCallback } from 'react';
import { Tldraw, Editor } from 'tldraw';
import 'tldraw/tldraw.css';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const DrawingBoardPage = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleReset = useCallback(() => {
    if (editor) {
      editor.deleteShapes(Array.from(editor.getCurrentPageShapeIds()));
      // Clear saved data
      localStorage.removeItem('tldraw-leetcode-drawing-board');
      toast.success('Drawing board reset successfully!');
    }
  }, [editor]);

  const handleMount = useCallback((editor: Editor) => {
    setEditor(editor);
    
    // Set the default tool to pencil and hide other tools
    editor.setCurrentTool('draw');
    
    // Ensure persistence is working
    setIsLoaded(true);
    
    // Load saved data if exists
    const savedData = localStorage.getItem('tldraw-leetcode-drawing-board');
    if (savedData) {
      try {
        const snapshot = JSON.parse(savedData);
        editor.loadSnapshot(snapshot);
        console.log('Drawing board data loaded from localStorage');
      } catch (error) {
        console.error('Failed to load drawing board data:', error);
      }
    }
    
    // Set up auto-save on changes
    let saveTimeout: NodeJS.Timeout;
    const unsubscribe = editor.store.listen(() => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        const snapshot = editor.getSnapshot();
        localStorage.setItem('tldraw-leetcode-drawing-board', JSON.stringify(snapshot));
        // Only log occasionally to reduce console noise
        if (Math.random() < 0.1) { // Log ~10% of saves
          console.log('Drawing board auto-saved');
        }
      }, 1000); // Save after 1 second of inactivity
    });
    
    // Return cleanup function
    return () => {
      clearTimeout(saveTimeout);
      unsubscribe();
    };
  }, []); // Remove editor dependency to prevent remounting

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Persistence is handled automatically by Tldraw with persistenceKey
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Drawing Board</h1>
          <p className="text-muted-foreground">Visual planning and problem-solving workspace</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              if (editor) {
                const snapshot = editor.getSnapshot();
                localStorage.setItem('tldraw-leetcode-drawing-board', JSON.stringify(snapshot));
                toast.success('Drawing saved successfully!');
              }
            }} 
            variant="outline" 
            className="gap-2"
            disabled={!isLoaded}
          >
            💾 Save
          </Button>
          <Button onClick={handleReset} variant="outline" className="gap-2" disabled={!isLoaded}>
            <RotateCcw className="h-4 w-4" />
            Reset Board
          </Button>
        </div>
      </div>

      {/* Tldraw Whiteboard */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg" style={{ height: 'calc(100vh - 150px)' }}>
        <style>
          {`
            /* Hide all toolbar buttons except the draw tool */
            .tlui-toolbar__tools > button:not([data-tool="draw"]) {
              display: none !important;
            }
            /* Hide toolbar separators */
            .tlui-toolbar__tools > .tlui-toolbar__separator {
              display: none !important;
            }
            /* Hide the bottom toolbar */
            .tlui-toolbar__bottom {
              display: none !important;
            }
            /* Hide overflow menu */
            .tlui-toolbar__overflow {
              display: none !important;
            }
          `}
        </style>
        <Tldraw 
          onMount={handleMount}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <strong>Tips:</strong> Use the pencil tool to draw freely. Your work is automatically saved every second, or click "Save" to save immediately. Changes are preserved between sessions.
      </div>
    </div>
  );
};

export default DrawingBoardPage;