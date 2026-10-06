import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Settings,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import {
  signInWithGoogle,
  logOut,
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig
} from '../firebase';

export default function CloudSyncModal({
  isOpen,
  onClose,
  user,
  isFirebaseConfigured,
  onConfigUpdated,
  addToast
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(!isFirebaseConfigured);
  const [configJson, setConfigJson] = useState(() => {
    const existing = getSavedFirebaseConfig();
    return existing ? JSON.stringify(existing, null, 2) : '';
  });

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setShowConfigEditor(true);
      addToast('Please enter your Firebase configuration below or in .env', 'info');
      return;
    }
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      addToast('Signed in successfully! Notes will auto-sync.', 'info');
      onClose();
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to sign in with Google', 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      addToast('Signed out of cloud sync', 'info');
    } catch (err) {
      addToast('Error signing out', 'error');
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      let cleaned = configJson.trim();
      if (cleaned.startsWith('const firebaseConfig =')) {
        cleaned = cleaned.replace(/^const\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      }
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const jsonLike = cleaned
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"')
          .replace(/,\s*([}\]])/g, '$1');
        parsed = JSON.parse(jsonLike);
      }
      if (!parsed || !parsed.apiKey || !parsed.projectId) {
        throw new Error('Config must include at least "apiKey" and "projectId".');
      }
      saveFirebaseConfig(parsed);
      if (onConfigUpdated) onConfigUpdated();
      addToast('Firebase settings saved locally in your browser!', 'info');
      setShowConfigEditor(false);
    } catch (err) {
      addToast('Invalid configuration: ' + err.message, 'error');
    }
  };

  const handleClearConfig = () => {
    clearFirebaseConfig();
    setConfigJson('');
    if (onConfigUpdated) onConfigUpdated();
    addToast('Firebase configuration removed from browser storage', 'info');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Cloud size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cloud Account</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Multi-device automatic synchronization
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {user ? (
          <div
            style={{
              padding: '18px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  style={{ width: '46px', height: '46px', borderRadius: '50%' }}
                />
              ) : (
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.96rem' }}>{user.displayName || 'Signed In'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '999px',
                  fontWeight: 600
                }}
              >
                <CheckCircle2 size={12} /> Auto-Sync Active
              </span>
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                backgroundColor: 'var(--bg-secondary)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              ☁️ <strong>Direct Cloud Storage:</strong> All your notes are automatically saved directly to Google Cloud Firestore in real time. Changes made on any device update everywhere instantly.
            </div>

            <button
              type="button"
              className="filter-pill"
              onClick={handleSignOut}
              style={{
                color: 'var(--danger)',
                borderColor: 'var(--danger-light)',
                alignSelf: 'flex-start',
                padding: '6px 14px'
              }}
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div
            style={{
              padding: '24px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={38} color="var(--accent)" style={{ marginBottom: '10px' }} />
            <h4 style={{ marginBottom: '6px' }}>Sign in to Auto-Sync</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px', maxWidth: '340px', margin: '0 auto 18px' }}>
              Sign in with your Google account. All notes will automatically save and sync across your phone, tablet, and laptop in real time.
            </p>
            <button
              type="button"
              className="btn-new-note"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              style={{
                backgroundColor: '#ffffff',
                color: '#1f2937',
                border: '1px solid #d1d5db',
                boxShadow: 'var(--shadow-sm)',
                margin: '0 auto',
                maxWidth: '260px',
                padding: '10px 16px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        )}

        {/* Local Firebase Config Accordion (stored only in client browser, never committed) */}
        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              padding: '6px 0'
            }}
            onClick={() => setShowConfigEditor(!showConfigEditor)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} />
              Firebase Config (Browser-only / Private)
            </span>
            <span>{showConfigEditor ? 'Hide ▲' : 'Configure ▼'}</span>
          </div>

          {showConfigEditor && (
            <form onSubmit={handleSaveConfig} style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                Optionally paste your Firebase project config object here (stored privately in your local browser only, never committed to git) or set environment variables in <code>.env.local</code>:
              </p>
              <textarea
                style={{
                  width: '100%',
                  height: '110px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  padding: '8px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder={`{\n  "apiKey": "...",\n  "authDomain": "...",\n  "projectId": "...",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
                value={configJson}
                onChange={(e) => setConfigJson(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <span>Firebase Console</span>
                  <ExternalLink size={12} />
                </a>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {isFirebaseConfigured && (
                    <button
                      type="button"
                      className="filter-pill"
                      onClick={handleClearConfig}
                      style={{ color: 'var(--danger)' }}
                    >
                      Clear
                    </button>
                  )}
                  <button type="submit" className="filter-pill active">
                    Save to Browser
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
