export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 86400 * 7) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

export function getWordAndCharCount(text = '') {
  const trimmed = text.trim();
  const chars = text.length;
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { chars, words, readingTimeMinutes };
}

export function downloadFile(content, fileName, contentType = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const NOTE_COLORS = [
  { id: 'default', label: 'Default', bg: 'var(--card-bg)', border: 'var(--border-color)', dot: '#94a3b8' },
  { id: 'indigo', label: 'Indigo', bg: 'rgba(99, 102, 241, 0.08)', border: 'rgba(99, 102, 241, 0.3)', dot: '#6366f1' },
  { id: 'emerald', label: 'Emerald', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', dot: '#10b981' },
  { id: 'amber', label: 'Amber', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.3)', dot: '#f59e0b' },
  { id: 'rose', label: 'Rose', bg: 'rgba(244, 63, 94, 0.08)', border: 'rgba(244, 63, 94, 0.3)', dot: '#f43f5e' },
  { id: 'purple', label: 'Purple', bg: 'rgba(168, 85, 247, 0.08)', border: 'rgba(168, 85, 247, 0.3)', dot: '#a855f7' },
  { id: 'sky', label: 'Sky', bg: 'rgba(14, 165, 233, 0.08)', border: 'rgba(14, 165, 233, 0.3)', dot: '#0ea5e9' }
];
