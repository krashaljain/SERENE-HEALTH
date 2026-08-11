import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, File, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppContext } from '@/context/AppContext';
import { useNavigate } from 'react-router';

export function UploadModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { uploadRecord, isUploading, isGuest, signup, login } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    await uploadRecord(file);
    setFile(null);
    onClose();
  };

  if (isGuest) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center bg-pastel-lavender/10">
                <h2 className="text-xl font-bold">Guest Mode</h2>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-pastel-blue/20 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-8 h-8 text-pastel-blue" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">Create an account</h3>
                  <p className="text-text-secondary">Create an account to securely store your medical records and access AI-powered health insights.</p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => { signup(); onClose(); }} className="w-full gap-2 py-6">
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </Button>
                  <Button variant="secondary" onClick={() => { login(); onClose(); }} className="w-full gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                  <Button variant="ghost" onClick={onClose} className="w-full mt-2">
                    Continue Browsing
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-xl font-bold">Add Medical Record</h2>
              <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Dropzone */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all text-center flex flex-col items-center justify-center gap-4 ${
                  isDragging ? 'border-pastel-lavender bg-pastel-lavender/10' : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
                } ${file ? 'border-pastel-mint bg-pastel-mint/10' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />

                {file ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-pastel-mint/30 flex items-center justify-center">
                      <File className="w-8 h-8 text-status-normal-text" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{file.name}</p>
                      <p className="text-sm text-text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-pastel-bg flex items-center justify-center cursor-pointer">
                      <UploadCloud className="w-8 h-8 text-text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">Drag and drop your file here</p>
                      <p className="text-sm text-text-secondary mt-1">or click to browse files</p>
                    </div>
                    <div className="text-xs text-text-secondary flex gap-2 items-center bg-white/50 px-3 py-1.5 rounded-full border border-black/5">
                      <AlertCircle className="w-3 h-3" /> Supported: PDF, JPG, PNG
                    </div>
                  </>
                )}
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-pastel-lavender via-pastel-blue to-pastel-mint text-text-primary hover:opacity-90 transition-opacity border border-black/5 shadow-sm py-4"
                disabled={!file || isUploading}
                onClick={handleUpload}
              >
                {isUploading ? "Processing with AI..." : "Upload & Analyze Record"}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
