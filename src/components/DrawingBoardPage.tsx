import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';

const DrawingBoardPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Drawing Board</h1>
        <p className="text-muted-foreground">Visual planning and problem-solving workspace</p>
      </div>

      {/* Tldraw Whiteboard */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg" style={{ height: 'calc(100vh - 150px)' }}>
        <Tldraw persistenceKey="leetcode-drawing-board" />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <strong>Tips:</strong> Use the toolbar to draw shapes, add text, and create diagrams. Your work is automatically saved locally.
      </div>
    </div>
  );
};

export default DrawingBoardPage;