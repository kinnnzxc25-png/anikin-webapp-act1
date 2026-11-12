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
  ShieldCheck,
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

  // Client Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [clientName, setClientName] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const res = await api.getPublicPortal(portalCode);
      setData(res);
      setClientName(res.portal.clientName || '');
    } catch (err: any) {
      setError(err.message || 'Could not load client portal.');
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
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
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
      // refresh list
      await fetchPortalData();
    } catch (err: any) {
      alert(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading client portal...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-900">Portal Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">{error || 'This portal link is invalid or expired.'}</p>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="mt-5 py-2 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Back to Dashboard
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Navigation */}
      <header className="bg-[#0B1528] text-white py-4 px-6 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              TB
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight">TamBuys Secure Client Portal</div>
              <div className="text-[11px] text-slate-400">Portal Code: {data.portal.code}</div>
            </div>
          </div>

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Project Intro Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="text-xs font-semibold text-blue-600">
                Prepared for {data.portal.clientName}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
                {data.portal.projectName}
              </h1>
            </div>

            {/* Freelancer info */}
            <div className="flex items-center gap-3 sm:text-right">
              {data.freelancer.avatarUrl ? (
                <img
                  src={data.freelancer.avatarUrl}
                  alt={data.freelancer.name}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {data.freelancer.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-slate-900">{data.freelancer.name}</div>
                <div className="text-[11px] text-slate-500">{data.freelancer.company}</div>
              </div>
            </div>
          </div>

          {data.portal.description && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
              <strong className="block text-slate-900 font-semibold mb-1">
                Project File Instructions:
              </strong>
              {data.portal.description}
            </div>
          )}
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-1">
            Upload Project Files & Assets
          </h2>
          <p className="text-xs text-slate-500 mb-5">
            Deliver logos, brand guidelines, fonts, high-resolution photography, or copy documents.
          </p>

          {uploadSuccess && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
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
                ? 'border-blue-600 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-slate-50/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-slate-900">
              Drag and drop files here, or click to browse
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Supports vector files, archives, PDF, images up to 100MB
            </div>
          </div>

          {/* Selected Files Queue */}
          {selectedFiles.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="text-xs font-semibold text-slate-800">
                Files ready for upload ({selectedFiles.length})
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {selectedFiles.map((f, i) => (
                  <div
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <File className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{f.name}</span>
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
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Your Name / Role
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Marcus Vance"
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Optional Note for Designer
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Here are the approved brand logos"
                    className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClientUpload}
                  disabled={uploading}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
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

        {/* Existing Portal Files List */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Portal Files ({data.files.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Files currently shared and delivered for this project.
              </p>
            </div>
          </div>

          {data.files.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No files have been uploaded yet. Upload your assets above.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.files.map((file) => (
                <div
                  key={file.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <FileCheck className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {file.originalName}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
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
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shrink-0"
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
