import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import Toast from './components/Toast';
import { INITIAL_NOTES } from './utils/initialNotes';
import { generateId, downloadFile } from './utils/helpers';

const STORAGE_KEY = 'quicknotes_data_v1';
const THEME_KEY = 'quicknotes_theme';

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  // Apply theme to html root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Notes state
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse notes from storage:', e);
    }
    return INITIAL_NOTES;
  });

  // Active note selection
  const [activeNoteId, setActiveNoteId] = useState(() => {
    return notes[0]?.id || null;
  });

  // Sidebar controls & filters
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'pinned', 'starred', 'tag:xyz'
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'created', 'alphabetical'

  // Toast feedback
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Save notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
      addToast('Storage quota exceeded or error saving', 'error');
    }
  }, [notes, addToast]);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach((note) => {
      (note.tags || []).forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet);
  }, [notes]);

  // Create new note
  const handleCreateNote = useCallback(() => {
    const newNote = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      color: 'default',
      isPinned: false,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    addToast('Created new note', 'info');
  }, [addToast]);

  // Update note
  const handleUpdateNote = useCallback((updatedNote) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
    );
  }, []);

  // Delete note
  const handleDeleteNote = useCallback((idToDelete) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== idToDelete);
      if (activeNoteId === idToDelete) {
        setActiveNoteId(filtered[0]?.id || null);
      }
      return filtered;
    });
    addToast('Note deleted', 'info');
  }, [activeNoteId, addToast]);

  // Duplicate note
  const handleDuplicateNote = useCallback((noteToCopy) => {
    const duplicated = {
      ...noteToCopy,
      id: generateId(),
      title: `${noteToCopy.title || 'Untitled'} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes((prev) => [duplicated, ...prev]);
    setActiveNoteId(duplicated.id);
    addToast('Note duplicated', 'info');
  }, [addToast]);

  // Export all notes as JSON
  const handleExportAll = () => {
    const data = JSON.stringify(notes, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(data, `quicknotes-backup-${dateStr}.json`, 'application/json');
    addToast('Downloaded all notes backup', 'info');
  };

  // Import notes from JSON
  const handleImportAll = (importedData) => {
    if (!Array.isArray(importedData)) {
      addToast('Invalid backup file: must be a JSON array', 'error');
      return;
    }
    setNotes(importedData);
    if (importedData.length > 0) {
      setActiveNoteId(importedData[0].id);
    }
    addToast(`Successfully imported ${importedData.length} notes!`, 'info');
  };

  // Keyboard shortcuts (Cmd/Ctrl + N, Cmd/Ctrl + S)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNote();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        addToast('All changes saved', 'info');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCreateNote, addToast]);

  // Filter & Sort notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Search filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchTitle = (note.title || '').toLowerCase().includes(q);
          const matchContent = (note.content || '').toLowerCase().includes(q);
          const matchTags = (note.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchTags) return false;
        }

        // Category filter
        if (selectedCategory === 'pinned') return note.isPinned;
        if (selectedCategory === 'starred') return note.isFavorite;
        if (selectedCategory.startsWith('tag:')) {
          const tag = selectedCategory.replace('tag:', '');
          return (note.tags || []).includes(tag);
        }

        return true;
      })
      .sort((a, b) => {
        // Pinned notes stick to top
        if (a.isPinned !== b.isPinned) {
          return a.isPinned ? -1 : 1;
        }

        if (sortBy === 'updated') {
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        }
        if (sortBy === 'created') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy === 'alphabetical') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [notes, searchTerm, selectedCategory, sortBy]);

  // Find active note object
  const activeNote = notes.find((n) => n.id === activeNoteId) || filteredNotes[0] || null;

  return (
    <div className="app-container">
      <Sidebar
        notes={filteredNotes}
        activeNoteId={activeNote?.id}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isSidebarCollapsed}
        allTags={allTags}
        onExportAll={handleExportAll}
        onImportAll={handleImportAll}
      />

      <NoteEditor
        note={activeNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        onDuplicateNote={handleDuplicateNote}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        addToast={addToast}
      />

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
