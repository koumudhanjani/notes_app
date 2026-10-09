import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Settings,
  KeyRound
} from 'lucide-react';
import {
  signInWithGoogle,
  logOut,
  getSavedFirebaseConfig,
  parseFirebaseConfigInput,
  saveFirebaseConfig,
  clearFirebaseConfig,
  DEFAULT_FIREBASE_CONFIG
} from '../firebase';

export default function CloudSyncModal({
  isOpen,
  onClose,
  user,
  onConfigUpdated,
  addToast
}) {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [expiredError, setExpiredError] = useState(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState('');
  const [configInput, setConfigInput] = useState(() => {
    const saved = getSavedFirebaseConfig();
    return saved?.apiKey || '';
  });
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setExpiredError(false);
    setUnauthorizedDomain('');
    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      addToast('Signed in successfully! Notes will auto-sync across devices.', 'info');
      onClose();
    } catch (err) {
      console.error('Google Sign-in error:', err);
      let msg = err.message || 'Failed to sign in with Google';
      const isExpired =
        err.code === 'auth/api-key-expired' ||
        err.code === 'auth/invalid-api-key' ||
        (typeof err.code === 'string' && err.code.includes('api-key')) ||
        msg.toLowerCase().includes('api-key-expired') ||
        msg.toLowerCase().includes('renew-the-api-key') ||
        msg.toLowerCase().includes('api key expired');

      if (isExpired) {
        setExpiredError(true);
        msg = 'Your Firebase API key is expired. Please renew it in Google Cloud Console or enter an active key.';
      } else if (err.code === 'auth/unauthorized-domain') {
        const domain = typeof window !== 'undefined' ? window.location.hostname : 'koumudhanjani.github.io';
        setUnauthorizedDomain(domain);
        msg = `Domain "${domain}" is not authorized for OAuth in Firebase.`;
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Google Sign-in provider is disabled in Firebase Console. Enable it under Authentication > Sign-in method.';
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
      setExpiredError(false);
      setShowConfigEditor(false);
      if (onConfigUpdated) onConfigUpdated();
      addToast('New API key saved! Click Sign in with Google.', 'info');
    } catch (err) {
      setErrorMessage(err.message);
      addToast(err.message, 'error');
    }
  };

  const handleClearConfig = async () => {
    await clearFirebaseConfig();
    setConfigInput(DEFAULT_FIREBASE_CONFIG.apiKey);
    setExpiredError(false);
    setErrorMessage('');
    if (onConfigUpdated) onConfigUpdated();
    addToast('Restored default configuration', 'info');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
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
          maxWidth: '480px',
          maxHeight: '92vh',
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
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card when signed in */}
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
          /* When NOT signed in: Sign in with Google is always front and center */
          <div>
            <div
              style={{
                padding: '24px 16px',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                textAlign: 'center',
                marginBottom: '16px'
              }}
            >
              <ShieldCheck size={42} color="var(--accent)" style={{ marginBottom: '10px' }} />
              <h4 style={{ marginBottom: '6px', fontSize: '1.05rem' }}>Sign in to Auto-Sync</h4>
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
                  padding: '10px 18px',
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

              {/* Expired Key Alert Callout */}
              {expiredError && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                    <AlertCircle size={16} />
                    <span>API Key Expired in Google Cloud</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Google automatically deactivated this key when it was briefly posted to GitHub. To fix this, click below to renew it:
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <a
                      href="https://console.cloud.google.com/apis/credentials?project=notes-app-73658"
                      target="_blank"
                      rel="noreferrer"
                      className="filter-pill active"
                      style={{
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px'
                      }}
                    >
                      <span>Renew in Google Cloud (Click 'Renew key')</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p style={{ margin: '0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    After clicking <strong>Renew key</strong> in Google Cloud, click <strong>Sign in with Google</strong> above!
                  </p>
                </div>
              )}

              {/* Unauthorized Domain Alert Callout */}
              {unauthorizedDomain && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px' }}>
                    <AlertCircle size={16} />
                    <span>Domain Not Authorized in Firebase</span>
                  </div>
                  <p style={{ margin: '0 0 10px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Firebase blocked Google Sign-In because <code>{unauthorizedDomain}</code> is not on your project's Authorized Domains list.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <a
                      href="https://console.firebase.google.com/project/notes-app-73658/authentication/settings"
                      target="_blank"
                      rel="noreferrer"
                      className="filter-pill active"
                      style={{
                        fontSize: '0.75rem',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px'
                      }}
                    >
                      <span>Add Domain in Firebase Console</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <p style={{ margin: '0', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    In Firebase Settings, scroll to <strong>Authorized domains</strong> &rarr; click <strong>Add domain</strong> &rarr; type <code>{unauthorizedDomain}</code>.
                  </p>
                </div>
              )}

              {/* Other error messages */}
              {errorMessage && !expiredError && !unauthorizedDomain && (
                <div
                  style={{
                    marginTop: '14px',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.78rem',
                    color: '#ef4444',
                    textAlign: 'left'
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfigEditor(!showConfigEditor)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                >
                  <KeyRound size={12} />
                  <span>{showConfigEditor ? 'Hide API Key Setting' : 'Enter a Different API Key'}</span>
                </button>
              </div>
            </div>

            {/* Optional Custom API Key Form */}
            {showConfigEditor && (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}
              >
                <h5 style={{ margin: '0 0 6px 0', fontSize: '0.85rem' }}>Custom Firebase API Key:</h5>
                <form onSubmit={handleSaveConfig}>
                  <input
                    type="text"
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      padding: '8px 10px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="AIzaSy..."
                    value={configInput}
                    onChange={(e) => setConfigInput(e.target.value)}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="filter-pill"
                      onClick={handleClearConfig}
                      style={{ fontSize: '0.75rem' }}
                    >
                      Reset Default
                    </button>
                    <button type="submit" className="filter-pill active" style={{ fontSize: '0.75rem' }}>
                      Save Key
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
