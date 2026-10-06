import React, { useRef } from 'react';
import {
  FileText,
  Plus,
  Search,
  X,
  Pin,
  Star,
  Moon,
  Sun,
  Download,
  Upload,
  Layers,
  Sparkles,
  Cloud
} from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Sidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  theme,
  toggleTheme,
  isCollapsed,
  allTags,
  onExportAll,
  onImportAll,
  onOpenCloudSync,
  user,
  isFirebaseConfigured,
  onCloseSidebar
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImportAll(parsed);
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand & Theme */}
      <div className="sidebar-header">
        <div className="app-brand">
          <div className="app-brand-icon">
            <FileText size={18} />
          </div>
          <span>QuickNotes</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={onOpenCloudSync}
            title={user ? `Signed in as ${user.displayName || user.email}` : 'Cloud Sync & Settings'}
            style={{ position: 'relative' }}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{ width: '22px', height: '22px', borderRadius: '50%' }}
              />
            ) : (
              <Cloud size={17} color={user ? '#10b981' : isFirebaseConfigured ? 'var(--accent)' : 'var(--text-muted)'} />
            )}
            <span
              style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: user ? '#10b981' : isFirebaseConfigured ? '#f59e0b' : '#94a3b8'
              }}
            />
          </button>
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseSidebar}
            title="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Action Area: New Note & Search */}
      <div className="sidebar-actions">
        <button
          type="button"
          className="btn-new-note"
          onClick={() => {
            onCreateNote();
            if (onCloseSidebar && window.innerWidth <= 768) {
              onCloseSidebar();
            }
          }}
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>

        <div className="search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search title, content, tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="category-filter-list">
        <button
          type="button"
          className={`filter-pill ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <Layers size={12} />
          <span>All ({notes.length})</span>
        </button>

        <button
          type="button"
          className={`filter-pill ${selectedCategory === 'pinned' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('pinned')}
        >
          <Pin size={12} />
          <span>Pinned</span>
        </button>

        <button
          type="button"
          className={`filter-pill ${selectedCategory === 'starred' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('starred')}
        >
          <Star size={12} />
          <span>Favorites</span>
        </button>

        {allTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`filter-pill ${selectedCategory === `tag:${tag}` ? 'active' : ''}`}
            onClick={() => setSelectedCategory(`tag:${tag}`)}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* List Header & Sorting */}
      <div className="sidebar-list-header">
        <span>Notes ({notes.length})</span>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="updated">Recently Updated</option>
          <option value="created">Recently Created</option>
          <option value="alphabetical">Title (A-Z)</option>
        </select>
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-list-state">
            <Sparkles size={28} />
            <p>No notes found</p>
            <span style={{ fontSize: '0.75rem' }}>
              {searchTerm ? 'Try a different search query' : 'Click "+ New Note" to create one'}
            </span>
          </div>
        ) : (
          notes.map((note) => {
            const isActive = note.id === activeNoteId;
            const previewText = note.content
              ? note.content
                  .replace(/^[#\s\-*>`_~[\]]+/gm, '')
                  .trim()
                  .slice(0, 100)
              : 'No content';

            return (
              <div
                key={note.id}
                className={`note-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelectNote(note.id);
                  if (onCloseSidebar && window.innerWidth <= 768) {
                    onCloseSidebar();
                  }
                }}
              >
                <div className="note-item-header">
                  <span className="note-item-title">
                    {note.title.trim() || 'Untitled Note'}
                  </span>
                  <div className="note-item-badges">
                    {note.isPinned && <Pin size={13} className="pin-icon" fill="currentColor" />}
                    {note.isFavorite && <Star size={13} className="star-icon" fill="currentColor" />}
                  </div>
                </div>

                <p className="note-item-preview">{previewText}</p>

                <div className="note-item-footer">
                  <span>{formatDate(note.updatedAt || note.createdAt)}</span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="note-tags-preview">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="tag-badge">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="tag-badge">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with Backup & Restore */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <span>Backup & Restore:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="icon-btn"
            title="Export all notes (JSON)"
            onClick={onExportAll}
          >
            <Download size={14} />
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Import notes backup (JSON)"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={14} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json,application/json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </aside>
  );
}
