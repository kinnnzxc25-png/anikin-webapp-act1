import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { PublicPortalData } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  UploadCloud,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  ArrowLeft,
  Send,
  Loader2,
  FileCheck,
} from 'lucide-react';

interface PublicClientPortalProps {
  portalCode: string;
  onBackToDashboard?: () => void;
}

export const PublicClientPortal: React.FC<PublicClientPortalProps> = ({
  portalCode,
  onBackToDashboard,
}) => {
  const [data, setData] = useState<PublicPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicPortal(portalCode);
      setData(res);
      setClientName(res.portal.clientName || '');
    } catch (err: any) {
      setError(err.message || 'Could not load drop portal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, [portalCode]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const fileList = e.dataTransfer.files;
    if (fileList && fileList.length > 0) {
      const droppedFiles = Array.from(fileList);
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const selected = Array.from(fileList);
      setSelectedFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClientUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    setUploadSuccess(null);
    setUploadError(null);

    try {
      const res = await api.uploadToPublicPortal(
        portalCode,
        selectedFiles,
        clientName,
        notes
      );
      setUploadSuccess(res.message);
      setSelectedFiles([]);
      setNotes('');
      await fetchPortalData();
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
          <span>Loading drop portal...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#060911] flex items-center justify-center p-4">
        <div className="bg-[#0A1120] p-8 rounded-2xl border border-slate-800 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-base font-bold text-white">Portal Not Found</h2>
          <p className="text-xs text-slate-400 mt-1">{error || 'This portal link is invalid or expired.'}</p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-5 py-2 px-4 bg-[#D4AF37] text-[#060911] rounded-xl text-xs font-bold cursor-pointer"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 pb-16">
      <header className="bg-[#0A1120] text-white py-4 px-6 border-b border-[#D4AF37]/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#060911] border border-[#D4AF37]/40 flex items-center justify-center text-[#E7C860] font-display font-bold text-base">
              B
            </div>
            <div>
              <div className="font-display text-sm font-semibold tracking-[0.14em] text-[#E7C860]">
                BOY'S AT THE BACK
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Drop Portal · {data.portal.code}
              </div>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-[#060911] border border-slate-800 hover:border-[#D4AF37]/40 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        <div className="bg-[#0A1120] rounded-2xl border border-[#D4AF37]/25 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-[#E7C860]">
                Prepared for {data.portal.clientName}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white mt-1">
                {data.portal.projectName}
              </h1>
            </div>

            <div className="flex items-center gap-3 sm:text-right">
              {data.freelancer.avatarUrl ? (
                <img
                  src={data.freelancer.avatarUrl}
                  alt={data.freelancer.name}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-[#D4AF37]/40 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#060911] border border-[#D4AF37]/30 text-[#E7C860] flex items-center justify-center font-bold text-xs shrink-0">
                  {data.freelancer.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-white">{data.freelancer.name}</div>
                <div className="text-[11px] text-slate-400">{data.freelancer.company}</div>
              </div>
            </div>
          </div>

          {data.portal.description && (
            <div className="mt-5 p-4 rounded-xl bg-[#060911] border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <strong className="block text-white font-semibold mb-1">
                Submission Instructions:
              </strong>
              {data.portal.description}
            </div>
          )}
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6 sm:p-8">
          <h2 className="text-sm font-bold text-white mb-1">
            Upload Files & Materials
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Deliver documents, decks, brand assets, or archives securely.
          </p>

          {uploadSuccess && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {uploadError && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
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
            <div className="w-12 h-12 rounded-2xl bg-[#0A1120] border border-[#D4AF37]/30 text-[#E7C860] flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-white">
              Drag and drop files here, or click to browse
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Supports PDF, vector assets, archives, and photography up to 100MB
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="text-xs font-semibold text-white">
                Files ready for upload ({selectedFiles.length})
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {selectedFiles.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#060911] border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <span className="font-medium text-white truncate">{f.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums shrink-0">
                        ({formatBytes(f.size)})
                      </span>
                    </div>
                    {!uploading && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(i);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded-md cursor-pointer"
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
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Optional Note
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Updated briefing package"
                    className="w-full text-xs py-2 px-3 bg-[#060911] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClientUpload}
                  disabled={uploading}
                  className="py-2.5 px-5 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Files...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send {selectedFiles.length} File(s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#0A1120] rounded-2xl border border-slate-800 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white">
                Portal Files ({data.files.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Files currently delivered into this folder.
              </p>
            </div>
          </div>

          {data.files.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No files have been uploaded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {data.files.map((file) => (
                <div
                  key={file.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#060911] border border-slate-800 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-[#E7C860]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {file.originalName}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono tabular-nums">{formatBytes(file.size)}</span>
                        <span>·</span>
                        <span>By {file.uploaderName}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{formatDate(file.uploadDate)}</span>
                      </div>
                    </div>
                  </div>

                  <a
                    href={api.getFileDownloadUrl(file.id)}
                    download
                    className="p-2 text-slate-400 hover:text-[#E7C860] hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                    title="Download file"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
