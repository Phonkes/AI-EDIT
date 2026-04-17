import { useState } from 'react';
import { UploadScreen } from './components/UploadScreen';
import { EditorScreen } from './components/EditorScreen';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setImageSrc(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#3B82F6]/30 font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {!imageSrc ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <UploadScreen onUpload={handleUpload} />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <EditorScreen initialImage={imageSrc} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
