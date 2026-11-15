import React, { useState, useRef } from 'react';
import { api } from '../services/api';
import { ClientPortal, StoredFile } from '../types';
import { formatBytes } from '../utils/formatters';
import {
  UploadCloud,
  File,
  X,
  AlertCircle,
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

    const droppedList = e.dataTransfer.files;
    if (droppedList && droppedList.length > 0) {
      addFiles(Array.from(droppedList));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      addFiles(Array.from(fileList));
    }
  };

  const addFiles = (newFiles: File[]) => {
    setError(null);
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
      }, 300);
    } catch (err: any) {
      clearInterval(timer);
      setUploading(false);
      setError(err.message || 'File upload failed. Please try again.');
    }
  };

  return (
    <div className="bg-[#0A1120] rounded-2xl border border-[#D4AF37]/25 shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            Upload to Member Vault
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Files are encrypted and stored inside your isolated member vault.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[0.99]'
            : 'border-slate-700 hover:border-[#D4AF37]/50 bg-[#060911]/60'
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
          <div className="w-12 h-12 rounded-2xl bg-[#0A1120] border border-[#D4AF37]/30 text-[#E7C860] flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="text-xs font-semibold text-white">
            Click to upload or drag & drop files here
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Supports PDF, AI, PSD, PNG, SVG, ZIP, Docs up to 100MB per file
          </div>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold text-white">
              Selected files ({selectedFiles.length})
            </span>
            <span className="font-mono tabular-nums text-[#E7C860]">
              Total: {formatBytes(totalSize)}
            </span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {selectedFiles.map((f, i) => (
              <div
                key={`${f.name}-${i}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#060911] border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <File className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="font-medium text-white truncate">
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
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Assign to Drop Portal <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <select
                value={portalId}
                onChange={(e) => setPortalId(e.target.value)}
                disabled={uploading}
                className="w-full text-xs py-2 px-2.5 bg-[#060911] border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">General Member Vault</option>
                {portals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Upload Note <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={uploading}
                placeholder="e.g. Chapter charter & briefing PDF"
                className="w-full text-xs py-2 px-2.5 bg-[#060911] border border-slate-800 text-slate-100 rounded-xl focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {uploading && (
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                  Uploading to Member Vault...
                </span>
                <span className="font-mono tabular-nums text-[#E7C860]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                disabled={uploading}
                className="py-2 px-3 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="py-2 px-4 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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
