import React from 'react';
import { StoredFile } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';
import {
  FileText,
  Image as ImageIcon,
  Palette,
  Archive,
  File,
  Download,
  Trash2,
  Eye,
  User,
  ArrowUpDown,
  Search,
  ExternalLink,
} from 'lucide-react';

interface FileListProps {
  files: StoredFile[];
  viewMode: 'table' | 'grid';
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onPreview: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onDelete: (file: StoredFile) => void;
  onOpenUpload: () => void;
}

export const FileList: React.FC<FileListProps> = ({
  files,
  viewMode,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  onPreview,
  onDownload,
  onDelete,
  onOpenUpload,
}) => {
  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'image', label: 'Images' },
    { id: 'design', label: 'Design & Vectors' },
    { id: 'document', label: 'Documents' },
    { id: 'archive', label: 'Archives' },
  ];

  const renderFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600" />;
      case 'design':
        return <Palette className="w-4 h-4 text-purple-600" />;
      case 'document':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-600" />;
      default:
        return <File className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Filter Controls & Sorting */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg py-1 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">Size (Largest)</option>
            <option value="size_asc">Size (Smallest)</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {files.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <File className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No files found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeCategory !== 'all'
              ? 'No files matching this category. Try switching filters or uploading a new file.'
              : 'Your portal has no uploaded files yet. Drag and drop assets or click upload to get started.'}
          </p>
          <div className="mt-4">
            <button
              onClick={onOpenUpload}
              className="py-2 px-4 bg-[#0B1528] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Upload Your First File
            </button>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">File Name</th>
                  <th className="py-3 px-4 font-semibold">Uploaded By</th>
                  <th className="py-3 px-4 font-semibold text-right">File Size</th>
                  <th className="py-3 px-4 font-semibold text-right">Upload Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Name & Type */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          {renderFileIcon(file.category)}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <div
                            onClick={() => onPreview(file)}
                            className="font-medium text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                            title={file.originalName}
                          >
                            {file.originalName}
                          </div>
                          {file.notes && (
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {file.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Uploader (Unboxed metadata with typographic dot) */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-800">
                          {file.uploaderName}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {file.uploadedBy}
                        </span>
                      </div>
                    </td>

                    {/* Size (Tabular Numerals) */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatBytes(file.size)}
                    </td>

                    {/* Upload Date */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {formatDate(file.uploadDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onPreview(file)}
                          title="Preview file"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDownload(file)}
                          title="Download file"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDelete(file)}
                          title="Delete file"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    {renderFileIcon(file.category)}
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPreview(file)}
                      title="Preview"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDownload(file)}
                      title="Download"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(file)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4
                  onClick={() => onPreview(file)}
                  className="text-xs font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer"
                  title={file.originalName}
                >
                  {file.originalName}
                </h4>

                {file.notes && (
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {file.notes}
                  </p>
                )}
              </div>

              {/* Clean metadata footer without pill badges */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                <span>{formatBytes(file.size)}</span>
                <span className="text-slate-300">·</span>
                <span>{formatDate(file.uploadDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
