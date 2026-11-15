import React from 'react';
import { StoredFile } from '../types';
import { api } from '../services/api';
import { formatBytes, formatDateTime } from '../utils/formatters';
import { X, Download, FileText } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="bg-[#0A1120] rounded-2xl shadow-2xl border border-[#D4AF37]/30 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {file.originalName}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Member Vault Preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-[#060911]">
          {isImage ? (
            <div className="max-h-80 w-full flex items-center justify-center rounded-xl overflow-hidden bg-[#0A1120] border border-slate-800 p-2">
              <img
                src={previewUrl}
                alt={file.originalName}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
                className="max-h-72 object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="py-10 px-8 text-center bg-[#0A1120] rounded-xl border border-slate-800 max-w-md w-full">
              <div className="w-14 h-14 rounded-2xl bg-[#060911] border border-[#D4AF37]/30 text-[#E7C860] flex items-center justify-center mx-auto mb-3">
                <FileText className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold text-white truncate">
                {file.originalName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                {file.mimeType}
              </div>
              <div className="mt-4">
                <button
                  onClick={() => onDownload(file)}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File ({formatBytes(file.size)})</span>
                </button>
              </div>
            </div>
          )}

          <div className="w-full mt-6 bg-[#0A1120] rounded-xl border border-slate-800 p-4">
            <h4 className="text-xs font-bold text-white mb-3">
              File Properties
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">File Size</span>
                <span className="font-mono tabular-nums text-white font-medium">
                  {formatBytes(file.size)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Upload Date</span>
                <span className="font-mono tabular-nums text-white font-medium">
                  {formatDateTime(file.uploadDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Uploaded By</span>
                <span className="text-white font-medium">
                  {file.uploaderName} ({file.uploadedBy})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="text-white font-medium capitalize">
                  {file.category}
                </span>
              </div>
            </div>

            {file.notes && (
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-slate-400 block text-[11px]">Notes</span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                  {file.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 border-t border-slate-800 bg-[#0A1120] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            BOY'S AT THE BACK · Protected Vault
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => onDownload(file)}
              className="py-1.5 px-4 bg-[#D4AF37] hover:bg-[#E7C860] text-[#060911] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
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
