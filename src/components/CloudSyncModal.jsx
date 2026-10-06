import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  LogIn,
  LogOut,
  Settings,
  UploadCloud,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  signInWithGoogle,
  logOut
} from '../firebase';

export default function CloudSyncModal({
  isOpen,
  onClose,
  user,
  isFirebaseConfigured,
  onConfigUpdated,
  onSyncLocalToCloud,
  addToast
}) {
  const [configJson, setConfigJson] = useState(() => {
    const existing = getSavedFirebaseConfig();
    return existing ? JSON.stringify(existing, null, 2) : '';
  });
  const [showConfigEditor, setShowConfigEditor] = useState(!isFirebaseConfigured);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    try {
      // Allow user to paste standard firebaseConfig object or plain JSON
      let cleaned = configJson.trim();
      if (cleaned.startsWith('const firebaseConfig =')) {
        cleaned = cleaned.replace(/const firebaseConfig =/, '').replace(/;$/, '').trim();
      }
      // If keys aren't quoted, format to standard JSON
      const parsed = JSON.parse(
        cleaned.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":').replace(/'/g, '"')
      );

      if (!parsed.apiKey || !parsed.projectId) {
        addToast('Config must include at least apiKey and projectId', 'error');
        return;
      }

      saveFirebaseConfig(parsed);
      onConfigUpdated();
      setShowConfigEditor(false);
      addToast('Firebase configuration saved successfully!', 'info');
    } catch (err) {
      addToast('Invalid configuration format. Please enter valid JSON.', 'error');
    }
  };

  const handleClearConfig = () => {
    if (window.confirm('Are you sure you want to remove your Firebase configuration?')) {
      clearFirebaseConfig();
      setConfigJson('');
      onConfigUpdated();
      addToast('Firebase configuration removed', 'info');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      addToast('Signed in successfully!', 'info');
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
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
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
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Cloud Sync & Account</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Access and edit your notes across phone, tablet, and laptop
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

        {/* User Status Card */}
        {user ? (
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  style={{ width: '44px', height: '44px', borderRadius: '50%' }}
                />
              ) : (
                <div
                  style={{
                    width: '44px',
                    height: '44px',
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
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{user.displayName || 'Signed In'}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                <CheckCircle2 size={12} /> Synced
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="filter-pill"
                onClick={onSyncLocalToCloud}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                <UploadCloud size={14} />
                <span>Upload Local Notes to Cloud</span>
              </button>
              <button
                type="button"
                className="filter-pill"
                onClick={handleSignOut}
                style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              marginBottom: '16px',
              textAlign: 'center'
            }}
          >
            {isFirebaseConfigured ? (
              <>
                <ShieldCheck size={36} color="var(--accent)" style={{ marginBottom: '8px' }} />
                <h4 style={{ marginBottom: '6px' }}>Sign in to sync your notes</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Sign in with your Google account to automatically synchronize notes in real time across all your browsers and devices.
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
                    maxWidth: '260px'
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
              </>
            ) : (
              <div>
                <AlertCircle size={32} color="#f59e0b" style={{ marginBottom: '8px' }} />
                <h4>Firebase Setup Required</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  To enable cross-device cloud sync, paste your free Google Firebase config below.
                </p>
                <button
                  type="button"
                  className="filter-pill"
                  onClick={() => setShowConfigEditor(true)}
                  style={{ margin: '0 auto' }}
                >
                  <Settings size={14} />
                  <span>Configure Firebase</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Firebase Config Accordion */}
        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)'
            }}
            onClick={() => setShowConfigEditor(!showConfigEditor)}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Settings size={14} />
              Firebase Cloud Configuration
            </span>
            <span>{showConfigEditor ? 'Hide ▲' : 'Show ▼'}</span>
          </div>

          {showConfigEditor && (
            <form onSubmit={handleSaveConfig} style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Paste the <code>firebaseConfig</code> object from your Firebase Console (Project Settings &gt; General &gt; Your apps):
              </p>
              <textarea
                style={{
                  width: '100%',
                  height: '110px',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  padding: '8px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-app.firebaseapp.com",\n  "projectId": "my-app",\n  "storageBucket": "my-app.appspot.com",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
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
                  <span>Open Firebase Console</span>
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
                    Save Config
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
