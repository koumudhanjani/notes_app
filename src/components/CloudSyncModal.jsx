import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Settings,
  ExternalLink,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import {
  signInWithGoogle,
  logOut,
  getSavedFirebaseConfig,
  parseFirebaseConfigInput,
  saveFirebaseConfig,
  clearFirebaseConfig,
  DEFAULT_PROJECT_CONFIG
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
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [configInput, setConfigInput] = useState(() => {
    const existing = getSavedFirebaseConfig();
    return existing ? JSON.stringify(existing, null, 2) : '';
  });
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    if (!isFirebaseConfigured) {
      addToast('Please connect your Firebase configuration first.', 'info');
      return;
    }
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      addToast('Signed in successfully! Notes will auto-sync across devices.', 'info');
      onClose();
    } catch (err) {
      console.error('Google Sign-in error:', err);
      let msg = err.message || 'Failed to sign in with Google';
      if (
        err.code === 'auth/invalid-api-key' ||
        err.code === 'auth/api-key-not-valid' ||
        msg.includes('API key expired') ||
        msg.includes('api-key-not-valid')
      ) {
        msg = 'Your Firebase API key is expired or invalid. Please renew or create a key in the Firebase Console.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'your domain';
        msg = `Domain not authorized (${domain}). Add it to Firebase Console > Authentication > Settings > Authorized domains.`;
      } else if (err.code === 'auth/popup-closed-by-user') {
        msg = 'Sign-in window was closed.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
      }
      setErrorMessage(msg);
      addToast(msg, 'error');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      addToast('Signed out of cloud sync', 'info');
    } catch (err) {
      addToast('Error signing out: ' + err.message, 'error');
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const parsed = parseFirebaseConfigInput(configInput);
      await saveFirebaseConfig(parsed);
      if (onConfigUpdated) onConfigUpdated();
      addToast('Firebase settings connected successfully!', 'info');
      setShowConfigEditor(false);
    } catch (err) {
      setErrorMessage(err.message);
      addToast('Configuration error: ' + err.message, 'error');
    }
  };

  const handleClearConfig = async () => {
    await clearFirebaseConfig();
    setConfigInput('');
    setErrorMessage('');
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
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
          maxWidth: '470px',
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
                width: '38px',
                height: '38px',
                borderRadius: '10px',
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
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Cloud Sync Account</h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Multi-device real-time note synchronization
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            style={{ padding: '6px' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Callout if any */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              fontSize: '0.8rem',
              color: '#ef4444'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Main Content Area */}
        {user ? (
          /* User signed in */
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
        ) : isFirebaseConfigured ? (
          /* Firebase configured, ready for Google sign in */
          <div
            style={{
              padding: '24px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              textAlign: 'center'
            }}
          >
            <ShieldCheck size={40} color="var(--accent)" style={{ marginBottom: '10px' }} />
            <h4 style={{ marginBottom: '6px', fontSize: '1rem' }}>Sign in to Auto-Sync</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '18px', maxWidth: '340px', margin: '0 auto 18px', lineHeight: 1.5 }}>
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
                padding: '10px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontWeight: 600
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
        ) : (
          /* Firebase setup required */
          <div
            style={{
              padding: '20px 16px',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <KeyRound size={34} color="var(--accent)" style={{ marginBottom: '6px' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>Connect Cloud Storage</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                Enter your Firebase API key or configuration to enable Google sign-in and cloud synchronization across your devices:
              </p>
            </div>

            <form onSubmit={handleSaveConfig}>
              <textarea
                style={{
                  width: '100%',
                  height: '90px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  padding: '10px',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                placeholder="Paste Firebase API Key (AIzaSy...) or configuration snippet here"
                value={configInput}
                onChange={(e) => setConfigInput(e.target.value)}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <a
                  href={`https://console.firebase.google.com/project/${DEFAULT_PROJECT_CONFIG.projectId}/overview`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: '0.76rem',
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

                <button type="submit" className="filter-pill active" style={{ padding: '6px 14px' }}>
                  Connect &amp; Save
                </button>
              </div>

              <div
                style={{
                  marginTop: '12px',
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.73rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.4
                }}
              >
                🔒 <strong>Stored privately in your browser:</strong> Saved only in your device's private browser memory (localStorage) and never uploaded to Git.
              </div>
            </form>
          </div>
        )}

        {/* Firebase Config Accordion (for modifying or clearing when configured) */}
        {isFirebaseConfigured && (
          <div style={{ marginTop: '14px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: 'var(--text-muted)',
                padding: '4px 2px'
              }}
              onClick={() => setShowConfigEditor(!showConfigEditor)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Settings size={13} />
                Firebase Settings (Project: {DEFAULT_PROJECT_CONFIG.projectId})
              </span>
              <span>{showConfigEditor ? '▲ Hide' : '▼ Manage'}</span>
            </div>

            {showConfigEditor && (
              <form onSubmit={handleSaveConfig} style={{ marginTop: '8px' }}>
                <textarea
                  style={{
                    width: '100%',
                    height: '90px',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    padding: '8px',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Paste new Firebase API Key (AIzaSy...) or configuration snippet"
                  value={configInput}
                  onChange={(e) => setConfigInput(e.target.value)}
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '8px'
                  }}
                >
                  <button
                    type="button"
                    className="filter-pill"
                    onClick={handleClearConfig}
                    style={{ color: 'var(--danger)', fontSize: '0.75rem' }}
                  >
                    Clear Config
                  </button>
                  <button type="submit" className="filter-pill active" style={{ fontSize: '0.75rem' }}>
                    Update Config
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
