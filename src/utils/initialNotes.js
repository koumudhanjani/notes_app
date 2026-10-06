export const INITIAL_NOTES = [
  {
    id: 'note_welcome',
    title: '👋 Welcome to QuickNotes!',
    content: `# Welcome to QuickNotes

QuickNotes is a fast, modern, and beautiful markdown note-taking web app.

### ✨ Key Features:
- **Instant Search**: Filter by note title, content, or tags in real-time.
- **Markdown Support**: Headers, **bold**, *italic*, lists, code snippets, and checklists.
- **Organization**: Pin important notes, add custom tags, and color-code.
- **View Modes**: Switch between **Edit**, **Preview**, and **Split Screen** view.
- **Privacy & Persistence**: All notes are automatically saved locally in your browser.
- **Import / Export**: Download your notes as Markdown or JSON backup anytime.

### ⌨️ Useful Shortcuts:
- **Ctrl / Cmd + N**: New Note
- **Ctrl / Cmd + P**: Toggle Pin
- **Ctrl / Cmd + S**: Quick Save

Try editing this note or click **"+ New Note"** on the left to start writing!`,
    tags: ['Guide', 'Welcome'],
    color: 'indigo',
    isPinned: true,
    isFavorite: true,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString()
  },
  {
    id: 'note_project_ideas',
    title: '💡 App Roadmap & Future Ideas',
    content: `## 🚀 Sprint Goals & Features

Here is a list of brainstorming ideas for our upcoming release:

- [x] Responsive layout with collapsible sidebar
- [x] Dark & Light theme switcher
- [x] Real-time Markdown live preview
- [ ] Add cloud synchronization support
- [ ] Voice memo transcription
- [ ] Kanban board view for tagged notes

### 💡 Tech Stack Notes
\`\`\`javascript
// Quick snippet
const app = {
  stack: ['React 19', 'Vite', 'Lucide Icons', 'Marked'],
  performance: 'Ultra fast',
  storage: 'localStorage'
};
console.log('Built with love!');
\`\`\`

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci`,
    tags: ['Projects', 'Ideas'],
    color: 'emerald',
    isPinned: false,
    isFavorite: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'note_reading_list',
    title: '📚 Weekly Reading & Study List',
    content: `### Books to read this quarter:
1. **Designing Data-Intensive Applications** - Martin Kleppmann
2. **Clean Architecture** - Robert C. Martin
3. **Refactoring UI** - Steve Schoger & Adam Wathan

### 🎯 Key Quotes
> "Make it work, make it right, make it fast." - Kent Beck

Remember to take 30 minutes every evening for deliberate practice!`,
    tags: ['Reading', 'Personal'],
    color: 'amber',
    isPinned: false,
    isFavorite: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
