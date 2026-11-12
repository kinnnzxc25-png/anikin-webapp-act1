import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ClientPortal, StoredFile } from '../types';
import { formatBytes } from '../utils/formatters';
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Send,
  Loader2,
} from 'lucide-react';

interface UploadDropzoneProps {
  portals: ClientPortal[];
  selectedPortalId?: string;
  onUploadSuccess: (files: StoredFile[]) => void;
  onClose?: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  portals,
  selectedPortalId,
  onUploadSuccess,
  onClose,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [portalId, setPortalId] = useState<string>(selectedPortalId || '');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setError(null);
    // filter duplicates
    setSelectedFiles((prev) => {
      const existingNames = new Set(prev.map((f) => f.name + f.size));
      const filtered = newFiles.filter((f) => !existingNames.has(f.name + f.size));
      return [...prev, ...filtered];
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(20);

    const timer = setInterval(() => {
      setUploadProgress((p) => (p < 85 ? p + 15 : p));
    }, 150);

    try {
      const res = await api.uploadFiles(selectedFiles, portalId || undefined, notes);
      clearInterval(timer);
      setUploadProgress(100);

      setTimeout(() => {
        onUploadSuccess(res.files);
        setSelectedFiles([]);
        setNotes('');
        setUploading(false);
        if (onClose) onClose();
      }, 400);
    } catch (err: any) {
      clearInterval(timer);
      setUploading(false);
      setError(err.message || 'File upload failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Upload Client Files
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Files are encrypted and safely stored in your isolated workspace.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Drag & Drop Canvas */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 bg-slate-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="text-xs font-semibold text-slate-800">
            Click to upload or drag & drop files here
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Supports PDF, AI, PSD, PNG, SVG, ZIP, Docs up to 100MB per file
          </div>
        </div>
      </div>

      {/* Selected Files Queue */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-800">
              Selected files ({selectedFiles.length})
            </span>
            <span className="font-mono tabular-nums text-slate-500">
              Total: {formatBytes(totalSize)}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">
                    {f.name}
                  </span>
                  <span className="text-[11px] text-slate-400 shrink-0 font-mono tabular-nums">
                    {formatBytes(f.size)}
                  </span>
                </div>

                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Project & Notes Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Assign to Client Portal <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <select
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                disabled={uploading}
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">No specific portal (General Vault)</option>
                {portals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Upload Note / Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={uploading}
                placeholder="e.g. Final approved vector assets"
                className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  Uploading and encrypting files...
                </span>
                <span className="font-mono tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Submit Action */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {uploading
                  ? 'Uploading...'
                  : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}`}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
