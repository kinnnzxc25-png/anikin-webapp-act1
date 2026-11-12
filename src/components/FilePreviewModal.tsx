import React from 'react';
import { StoredFile } from '../types';
import { api } from '../services/api';
import { formatBytes, formatDateTime } from '../utils/formatters';
import {
  X,
  Download,
  Calendar,
  User,
  HardDrive,
  FileText,
  File,
  ExternalLink,
} from 'lucide-react';

interface FilePreviewModalProps {
  file: StoredFile | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (file: StoredFile) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !file) return null;

  const isImage = file.category === 'image' || file.mimeType.startsWith('image/');
  const previewUrl = api.getFilePreviewUrl(file.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {file.originalName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              File Details & Preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-50/50">
          {isImage ? (
            <div className="max-h-80 w-full flex items-center justify-center rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80 p-2">
              <img
                src={previewUrl}
                alt={file.originalName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="max-h-72 object-contain rounded-lg shadow-xs"
              />
            </div>
          ) : (
            <div className="py-10 px-8 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs max-w-md w-full">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">
                {file.originalName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {file.mimeType}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => onDownload(file)}
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File ({formatBytes(file.size)})</span>
                </button>
              </div>
            </div>
          )}

          {/* Metadata Breakdown */}
          <div className="w-full mt-6 bg-white rounded-xl border border-slate-200/80 p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-3">
              File Properties
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">File Size</span>
                <span className="font-mono tabular-nums text-slate-800 font-medium">
                  {formatBytes(file.size)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Upload Date</span>
                <span className="font-mono tabular-nums text-slate-800 font-medium">
                  {formatDateTime(file.uploadDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Uploaded By</span>
                <span className="text-slate-800 font-medium">
                  {file.uploaderName} ({file.uploadedBy})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="text-slate-800 font-medium capitalize">
                  {file.category}
                </span>
              </div>
            </div>

            {file.notes && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-slate-400 block text-[11px]">Notes</span>
                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {file.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-white flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Encrypted with 256-bit vault protection
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1.5 px-3 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onDownload(file)}
              className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
