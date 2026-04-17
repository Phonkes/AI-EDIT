import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Wand2, 
  Eraser, 
  Download, 
  RotateCcw,
  Undo2,
  Loader2,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface EditorScreenProps {
  initialImage: string;
  onReset: () => void;
}

export function EditorScreen({ initialImage, onReset }: EditorScreenProps) {
  const [activeTool, setActiveTool] = useState<'eraser' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Canvas refs
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State for drawing
  const [isDrawing, setIsDrawing] = useState(false);

  // We could store actions in a real app, here we just keep the base image.
  // For the prototype, we reset to the initial image for "Undo/Reset".
  const [currentImageStr, setCurrentImageStr] = useState(initialImage);

  // Load image onto background canvas
  useEffect(() => {
    const bgCanvas = bgCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    const container = containerRef.current;
    
    if (!bgCanvas || !drawCanvas || !container) return;
    const ctx = bgCanvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = currentImageStr;
    img.onload = () => {
      // Calculate scale to fit container while maintaining aspect ratio
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const scale = Math.min(
        containerWidth / img.width,
        containerHeight / img.height
      );
      
      const width = img.width * scale;
      const height = img.height * scale;
      
      bgCanvas.width = width;
      bgCanvas.height = height;
      drawCanvas.width = width;
      drawCanvas.height = height;
      
      // Draw the image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
    };
  }, [currentImageStr]);

  // --- Handlers ---
  
  const handleRemoveBackground = async () => {
    setIsProcessing(true);
    // TODO: Add real API integration here
    try {
      console.log("simulating background removal...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulation finishes, typically we would update currentImageStr here
      console.log("Background removal complete.");
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eraser') return;
    setIsDrawing(true);
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    
    // Set brush styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 30; // Eraser size
    ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)'; // Translucent red to simulate masking
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'eraser') return;
    e.preventDefault(); // prevent scrolling while touching
    
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (activeTool === 'eraser') {
      setIsProcessing(true);
      // TODO: Here you would extract the mask from drawCanvas and send it along with the original image to your real AI API
      try {
        console.log("simulating object erasure...");
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Clear the mask after "erasing"
        const canvas = drawCanvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && canvas) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Simulation finishes, typically update currentImageStr with result
        console.log("Object erased.");
        setActiveTool(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDownload = () => {
    const bgCanvas = bgCanvasRef.current;
    if (!bgCanvas) return;
    const dataUrl = bgCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'edited-image.png';
    link.click();
  };

  const handleUndo = () => {
    // In a real app we'd pop from an undo stack.
    // For this prototype, undo resets to initial image.
    setCurrentImageStr(initialImage);
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setActiveTool(null);
  };

  return (
    <div className="w-full h-screen grid grid-cols-[72px_1fr] grid-rows-[64px_1fr] bg-[#0A0A0A] overflow-hidden text-white font-sans">
      {/* Top Bar */}
      <header className="col-span-2 row-start-1 border-b border-[#262626] flex items-center justify-between px-6 bg-[#0A0A0A] z-20">
        <div className="font-bold text-[24px] tracking-[-0.05em] leading-none mb-0">
          AI<span className="text-[#3B82F6]">EDIT</span>
        </div>
        <div className="text-[11px] uppercase tracking-[0.1em] text-[#A1A1AA] font-semibold">
          {isProcessing ? 'Processing...' : 'Ready'}
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={onReset} 
            disabled={isProcessing} 
            className="px-4 py-2 rounded-lg bg-transparent text-[#A1A1AA] font-medium text-[14px] border border-[#262626] hover:text-white hover:border-[#A1A1AA] transition-colors disabled:opacity-50"
          >
            Reset
          </button>
          <button 
            onClick={handleDownload} 
            disabled={isProcessing} 
            className="px-4 py-2 rounded-lg bg-[#3B82F6] text-white font-medium text-[14px] border-none hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            Download
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <aside className="col-start-1 row-start-2 border-r border-[#262626] flex flex-col items-center py-6 gap-5 bg-[#141414] z-20">
        <button
          disabled={isProcessing}
          onClick={handleRemoveBackground}
          title="Background Remover"
          className="w-11 h-11 rounded-xl border border-[#262626] bg-transparent text-[#A1A1AA] flex items-center justify-center cursor-pointer transition-all hover:bg-[#262626] hover:text-white hover:border-[#A1A1AA] disabled:opacity-50 text-lg group"
        >
          <Wand2 size={18} />
        </button>
        <button
          disabled={isProcessing}
          onClick={() => setActiveTool(activeTool === 'eraser' ? null : 'eraser')}
          title="Magic Eraser"
          className={`w-11 h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 text-lg
            ${activeTool === 'eraser' 
              ? 'bg-[#3B82F6] text-white border-[#3B82F6]' 
              : 'border-[#262626] bg-transparent text-[#A1A1AA] hover:bg-[#262626] hover:text-white hover:border-[#A1A1AA]'}`}
        >
          <Eraser size={18} />
        </button>

        <button
          onClick={handleUndo}
          disabled={isProcessing}
          title="Undo"
          className="w-11 h-11 rounded-xl border border-[#262626] bg-transparent text-[#A1A1AA] flex items-center justify-center cursor-pointer transition-all hover:bg-[#262626] hover:text-white hover:border-[#A1A1AA] mt-auto disabled:opacity-50 text-lg"
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onReset}
          disabled={isProcessing}
          title="Back"
          className="w-11 h-11 rounded-xl border border-[#262626] bg-transparent text-[#A1A1AA] flex items-center justify-center cursor-pointer transition-all hover:bg-[#262626] hover:text-white hover:border-[#A1A1AA] disabled:opacity-50 text-lg"
        >
          <X size={18} />
        </button>
      </aside>

      {/* Canvas Area */}
      <main className="col-start-2 row-start-2 relative bg-black flex items-center justify-center p-10 overflow-hidden z-10 w-full h-full">
        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-[#0A0A0A]/70 backdrop-blur-[4px] z-30 flex items-center justify-center flex-col gap-3">
            <div className="w-6 h-6 border-2 border-[#262626] border-t-[#3B82F6] rounded-full animate-spin" />
            <p className="text-[14px] text-white m-0">Processing...</p>
          </div>
        )}
        
        {/* Canvas Container */}
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center pointer-events-none z-10">
          <div className="relative pointer-events-auto shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#262626] rounded-[4px] overflow-hidden transition-[filter] duration-300">
            <canvas ref={bgCanvasRef} className="block" />
            <canvas 
              ref={drawCanvasRef}
              className={`absolute top-0 left-0 w-full h-full cursor-${activeTool === 'eraser' ? 'crosshair' : 'default'} touch-none`}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
