# QuickNotes 📝

A sleek, modern, and responsive React note-taking web application with live Markdown preview, category tagging, full-text search, and local persistence.

---

## ✨ Features

- **⚡ Fast & Modern**: Built with React 19 and Vite for instant load times and hot module replacement.
- **📝 Markdown Support**:
  - Headers, bold, italics, checklists (`- [ ]`), bullet lists, quotes, tables, and code snippets.
  - Formatting toolbar for one-click markdown insertion.
  - Three viewing modes: **Edit Mode**, **Preview Mode**, and **Split Screen** (side-by-side editing and live preview).
- **🔍 Real-Time Search & Filters**:
  - Filter notes instantly across titles, body content, and tags.
  - Filter by **Pinned**, **Favorites**, or specific custom tags.
  - Sort by **Recently Updated**, **Date Created**, or **Alphabetical (A-Z)**.
- **🎨 Custom Styling & Theming**:
  - Instant **Dark Mode / Light Mode** toggle.
  - Pastel note color accents (Indigo, Emerald, Amber, Rose, Purple, Sky).
- **💾 Local Persistence & Data Freedom**:
  - Automatically saves all changes to `localStorage`.
  - **Export Note**: Export any note as a `.md` (Markdown) file or copy to clipboard.
  - **Backup & Restore**: Export all notes as JSON and import backups anytime.
- **⌨️ Keyboard Shortcuts**:
  - `Ctrl` / `Cmd` + `N`: Create new note
  - `Ctrl` / `Cmd` + `S`: Trigger save
  - `Ctrl` / `Cmd` + `P`: Toggle pin on active note

---

## 🚀 How to Run the App

### 1. Start the Development Server
In your terminal, run:
```bash
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173) in your browser.

### 2. Build for Production
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```

---

## 📂 Project Structure

```
.
├── index.html              # HTML entry point with fonts & meta
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.jsx            # React root mount
│   ├── App.jsx             # Main state management & layout
│   ├── index.css           # Modern design system & dark/light styles
│   ├── components/
│   │   ├── Sidebar.jsx     # Navigation, filters, search, note list
│   │   ├── NoteEditor.jsx  # Note title, Markdown editor, preview & toolbar
│   │   ├── MarkdownToolbar.jsx # Quick markdown insertion actions
│   │   └── Toast.jsx       # Notification snackbars
│   └── utils/
│       ├── helpers.js      # Date formatting, stats calculation, exports
│       └── initialNotes.js # Preloaded welcome & example notes
```
