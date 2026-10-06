import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Star,
  Trash2,
  Download,
  Copy,
  CopyCheck,
  Columns,
  Eye,
  Edit3,
  Menu,
  Tag,
  X,
  MoreVertical,
  Files,
  Cloud,
  FileText
} from 'lucide-react';
import { marked } from 'marked';
import MarkdownToolbar from './MarkdownToolbar';
import { getWordAndCharCount, NOTE_COLORS, downloadFile } from '../utils/helpers';

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true
});

export default function NoteEditor({
  note,
  onUpdateNote,
  onDeleteNote,
  onDuplicateNote,
  toggleSidebar,
  isSidebarCollapsed,
  addToast,
  user,
  syncStatus
}) {
  const [viewMode, setViewMode] = useState('split'); // 'edit', 'preview', 'split'
  const [newTagInput, setNewTagInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!note) {
    return (
      <main className="main-content">
        <div className="no-note-selected">
          <div className="no-note-icon">
            <Edit3 size={32} />
          </div>
          <h2>No Note Selected</h2>
          <p>Select a note from the sidebar or create a new note to start writing.</p>
        </div>
      </main>
    );
  }

  const { words, chars, readingTimeMinutes } = getWordAndCharCount(note.content);

  const handleTitleChange = (e) => {
    onUpdateNote({ ...note, title: e.target.value, updatedAt: new Date().toISOString() });
  };

  const handleContentChange = (e) => {
    onUpdateNote({ ...note, content: e.target.value, updatedAt: new Date().toISOString() });
  };

  const handleTogglePin = () => {
    const updated = !note.isPinned;
    onUpdateNote({ ...note, isPinned: updated, updatedAt: new Date().toISOString() });
    addToast(updated ? 'Pinned note' : 'Unpinned note', 'info');
  };

  const handleToggleFavorite = () => {
    const updated = !note.isFavorite;
    onUpdateNote({ ...note, isFavorite: updated, updatedAt: new Date().toISOString() });
    addToast(updated ? 'Added to favorites' : 'Removed from favorites', 'info');
  };

  const handleColorChange = (colorId) => {
    onUpdateNote({ ...note, color: colorId, updatedAt: new Date().toISOString() });
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    const tag = newTagInput.trim().replace(/^#/, '');
    if (tag && !(note.tags || []).includes(tag)) {
      const updatedTags = [...(note.tags || []), tag];
      onUpdateNote({ ...note, tags: updatedTags, updatedAt: new Date().toISOString() });
      setNewTagInput('');
      addToast(`Added tag #${tag}`, 'info');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = (note.tags || []).filter((t) => t !== tagToRemove);
    onUpdateNote({ ...note, tags: updatedTags, updatedAt: new Date().toISOString() });
  };

  const handleInsertMarkdown = (prefix, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = note.content || '';
    const selectedText = text.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    onUpdateNote({ ...note, content: newContent, updatedAt: new Date().toISOString() });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const handleCopyContent = () => {
    const textToCopy = `# ${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      addToast('Copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportMarkdown = () => {
    const titleSlug = (note.title || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_');
    const content = `# ${note.title}\n\n${note.content}`;
    downloadFile(content, `${titleSlug}.md`, 'text/markdown');
    addToast('Exported as Markdown', 'info');
    setShowMoreMenu(false);
  };

  const handleExportPDF = async () => {
    try {
      addToast('Preparing PDF download...', 'info');
      setShowMoreMenu(false);

      const titleSlug = (note.title || 'untitled').replace(/[^a-zA-Z0-9_-]/g, '_');
      const dateStr = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      const tagsStr = (note.tags || []).length > 0 ? ` • #${note.tags.join(' #')}` : '';

      const container = document.createElement('div');
      container.style.padding = '30px';
      container.style.color = '#111827';
      container.style.backgroundColor = '#ffffff';
      container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      container.innerHTML = `
        <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 18px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0 0 6px 0; color: #111827;">${note.title || 'Untitled Note'}</h1>
          <div style="font-size: 12px; color: #6b7280;">Saved on ${dateStr}${tagsStr}</div>
        </div>
        <div class="markdown-body" style="font-size: 14px; line-height: 1.6; color: #1f2937;">
          ${marked.parse(note.content || '')}
        </div>
      `;

      document.body.appendChild(container);

      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${titleSlug}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(container).save();
      document.body.removeChild(container);
      addToast('PDF downloaded successfully!', 'info');
    } catch (err) {
      console.error('PDF generation error:', err);
      window.print();
    }
  };

  const currentColorObj = NOTE_COLORS.find((c) => c.id === note.color) || NOTE_COLORS[0];
  const markdownHtml = marked.parse(note.content || '');

  return (
    <main
      className="main-content"
      style={{
        '--note-bg': currentColorObj.id !== 'default' ? currentColorObj.bg : undefined
      }}
    >
      {/* Top action toolbar */}
      <div className="editor-topbar">
        <div className="editor-topbar-row">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={toggleSidebar}
              title={isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
            >
              <Menu size={16} />
            </button>
            <div className="save-status">
              {user ? (
                <>
                  <Cloud size={13} color="#10b981" />
                  <span>{syncStatus === 'syncing' ? 'Saving...' : 'Cloud Synced'}</span>
                </>
              ) : (
                <span>Saved locally</span>
              )}
            </div>
          </div>

          {/* Desktop View Mode Toggle */}
          <div className="view-mode-tabs desktop-view-tabs">
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
              title="Edit mode"
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              title="Side-by-side split view"
            >
              <Columns size={13} />
              <span>Split</span>
            </button>
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              title="Rendered preview"
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>

          {/* Right Action Icons (Pin, Star, Copy, More - Always visible on mobile & desktop!) */}
          <div className="topbar-actions" ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              className={`icon-btn ${note.isPinned ? 'active' : ''}`}
              onClick={handleTogglePin}
              title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
            >
              <Pin size={16} fill={note.isPinned ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              className={`icon-btn ${note.isFavorite ? 'active' : ''}`}
              onClick={handleToggleFavorite}
              title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={16} fill={note.isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={handleCopyContent}
              title="Copy note text"
            >
              {copied ? <CopyCheck size={16} color="#10b981" /> : <Copy size={16} />}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown menu */}
            {showMoreMenu && (
              <div className="dropdown-menu">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleExportPDF}
                >
                  <FileText size={14} />
                  <span>Download as PDF (.pdf)</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={handleExportMarkdown}
                >
                  <Download size={14} />
                  <span>Export as Markdown (.md)</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    onDuplicateNote(note);
                    setShowMoreMenu(false);
                  }}
                >
                  <Files size={14} />
                  <span>Duplicate Note</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item danger"
                  onClick={() => {
                    onDeleteNote(note.id);
                    setShowMoreMenu(false);
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Mode Tabs Row */}
        <div className="mobile-view-tabs">
          <div className="view-mode-tabs" style={{ width: '100%', justifyContent: 'center' }}>
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'edit' ? 'active' : ''}`}
              onClick={() => setViewMode('edit')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Edit3 size={13} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => setViewMode('split')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Columns size={13} />
              <span>Split</span>
            </button>
            <button
              type="button"
              className={`view-mode-tab ${viewMode === 'preview' ? 'active' : ''}`}
              onClick={() => setViewMode('preview')}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Eye size={13} />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Note Meta Bar: Tags & Color picker */}
      <div className="note-meta-bar">
        <div className="tag-list-container">
          <Tag size={14} color="var(--text-muted)" />
          {(note.tags || []).map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
              <button
                type="button"
                className="tag-remove-btn"
                onClick={() => handleRemoveTag(tag)}
                title="Remove tag"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <form onSubmit={handleAddTag} className="tag-input-form">
            <input
              type="text"
              className="tag-input"
              placeholder="+ add tag"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
            />
          </form>
        </div>

        {/* Color Palette Picker */}
        <div className="color-palette" title="Note Accent Color">
          {NOTE_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`color-dot-btn ${(note.color || 'default') === c.id ? 'active' : ''}`}
              style={{ backgroundColor: c.dot }}
              onClick={() => handleColorChange(c.id)}
              title={c.label}
            />
          ))}
        </div>
      </div>

      {/* Editor Content Workspace */}
      <div className="editor-workspace">
        <input
          type="text"
          className="note-title-input"
          placeholder="Note title..."
          value={note.title}
          onChange={handleTitleChange}
        />

        {/* Markdown toolbar when editor is visible */}
        {viewMode !== 'preview' && (
          <MarkdownToolbar onInsert={handleInsertMarkdown} />
        )}

        <div className="editor-panes-container">
          {/* Edit Pane */}
          {viewMode !== 'preview' && (
            <div className="editor-pane">
              <textarea
                ref={textareaRef}
                className="note-textarea"
                placeholder="Write your note in Markdown here..."
                value={note.content}
                onChange={handleContentChange}
              />
            </div>
          )}

          {/* Markdown Preview Pane */}
          {viewMode !== 'edit' && (
            <div className={`preview-pane ${viewMode === 'preview' ? 'full' : ''}`}>
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: markdownHtml }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer statistics */}
      <footer className="editor-footer">
        <div>
          <span>
            {words} {words === 1 ? 'word' : 'words'} • {chars} characters
          </span>
          <span style={{ marginLeft: '12px' }}>
            ~{readingTimeMinutes} min read
          </span>
        </div>
        <div>
          <span>
            Created {new Date(note.createdAt).toLocaleDateString()}
          </span>
        </div>
      </footer>
    </main>
  );
}
