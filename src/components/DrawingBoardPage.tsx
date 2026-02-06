import { useState, useCallback, useRef, useEffect } from 'react';
import { Pen, Eraser, RotateCcw, Download, Upload, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const DrawingBoardPage = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? lineWidth * 3 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, tool, color, lineWidth]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    toast.success('Canvas cleared!');
  }, []);

  const exportDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Drawing exported!');
  }, []);

  const importDrawing = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        toast.success('Drawing imported!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let resizeTimeout: NodeJS.Timeout;

    const updateCanvasSize = () => {
      const container = canvas.parentElement;
      if (container) {
        // Save current drawing before resizing
        const currentDrawing = canvas.toDataURL();

        const rect = container.getBoundingClientRect();
        const newWidth = rect.width - 40;
        const newHeight = window.innerHeight - 200;

        // Only resize if dimensions actually changed
        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;

          // Set white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Set up canvas context properties
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Restore the drawing if it wasn't just a blank canvas
          if (currentDrawing && currentDrawing !== 'data:,') {
            const img = new Image();
            img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            };
            img.src = currentDrawing;
          }
        }
      }
    };

    const debouncedUpdateCanvasSize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateCanvasSize, 100);
    };

    updateCanvasSize();
    window.addEventListener('resize', debouncedUpdateCanvasSize);
    return () => {
      window.removeEventListener('resize', debouncedUpdateCanvasSize);
      clearTimeout(resizeTimeout);
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
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pen')}
          >
            <Pen className="w-4 h-4 mr-1" />
            Pen
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4 mr-1" />
            Eraser
          </Button>
        </div>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Color and Size Controls */}
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 border rounded cursor-pointer"
          title="Stroke Color"
        />
        <select
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          className="px-2 py-1 border rounded text-sm"
          title="Line Width"
        >
          <option value={1}>1px</option>
          <option value={2}>2px</option>
          <option value={3}>3px</option>
          <option value={4}>4px</option>
          <option value={6}>6px</option>
          <option value={8}>8px</option>
          <option value={12}>12px</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Utility Controls */}
        <Button variant="outline" size="sm" onClick={clearCanvas}>
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={exportDrawing}>
          <Download className="w-4 h-4 mr-1" />
          Export
        </Button>
        <label title="Import Drawing">
          <input
            type="file"
            accept="image/*"
            onChange={importDrawing}
            className="hidden"
          />
          <Button variant="outline" size="sm" asChild>
            <span><Upload className="w-4 h-4 mr-1" />Import</span>
          </Button>
        </label>
      </div>

      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair block w-full"
          style={{ minHeight: '600px' }}
        />
      </div>

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <strong>Tips:</strong> Click and drag to draw. Use the pen for drawing and eraser for corrections.
        Export your work or import existing drawings to continue working.
      </div>
    </div>
  );
};

export default DrawingBoardPage;