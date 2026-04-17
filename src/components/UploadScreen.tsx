import React, { useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface UploadScreenProps {
  onUpload: (file: File) => void;
}

export function UploadScreen({ onUpload }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        onUpload(file);
      }
    }
  }, [onUpload]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center justify-center h-full gap-6 w-full max-w-2xl px-6">
        <div className="font-bold text-[24px] tracking-[-0.05em] mb-2 leading-none">
          AI<span className="text-[#3B82F6]">EDIT</span>
        </div>
        
        <motion.div
           animate={{ scale: isDragging ? 1.02 : 1 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}
           className={`w-[480px] max-w-full h-[320px] rounded-[24px] border-2 border-dashed flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer relative overflow-hidden
            ${isDragging ? 'border-[#3B82F6] bg-[#1a1a1a]' : 'border-[#262626] hover:border-[#3B82F6] bg-[#141414] hover:bg-[#1a1a1a]'}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            aria-label="Upload an image"
          />
          
          <div className="flex flex-col items-center pointer-events-none p-6 text-center">
            <div className="text-[40px] mb-4 opacity-50 text-[#A1A1AA] leading-none">＋</div>
            <p className="text-[14px] text-[#A1A1AA] m-0">Drag and drop or click to upload</p>
            <p className="mt-2 text-[12px] opacity-50 text-[#A1A1AA] m-0">Supports PNG, JPG, WebP</p>
          </div>
        </motion.div>
        
        <div className="text-[13px] text-[#A1A1AA]">Securely processed in your browser</div>
      </div>
    </div>
  );
}
