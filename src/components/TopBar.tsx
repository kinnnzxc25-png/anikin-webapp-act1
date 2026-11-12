import React from 'react';
import { Search, Plus, LayoutGrid, List, Sparkles } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
  onUploadClick: () => void;
  showViewToggle?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onUploadClick,
  showViewToggle = true,
}) => {
  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-10 shrink-0">
      {/* Zone 1: Contextual Title */}
      <div className="min-w-0">
        <h1 className="text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Zone 2: Search Affordance */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files by name, client, or notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Actions & View Toggles */}
      <div className="flex items-center gap-3 shrink-0">
        {showViewToggle && (
          <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/60">
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Files</span>
        </button>
      </div>
    </header>
  );
};
