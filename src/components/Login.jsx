import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const switchMode = () => {
    setError('');
    setNotice('');
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);

    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Your  account is ready. Sign in to view the catalog.');
        setForm({ username: form.username, email: '', password: '' });
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const registering = mode === 'register';

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">P</div>
          <div>
            <div className="brand-name">Stockroom</div>
            <div className="brand-caption">Product workspace</div>
          </div>
        </div>

        <div className="story-content">
          <span className="story-tag">A clearer view of your business</span>
          <h1>Good things,<br />well <span>organized.</span></h1>
          <p>One simple place to keep track of your products, inventory, and everything that keeps your business moving.</p>
          <div className="story-points">
            <div className="story-point"><span className="check-mark" aria-hidden="true">✓</span> Your entire catalog, at a glance</div>
            <div className="story-point"><span className="check-mark" aria-hidden="true">✓</span> Stay on top of stock levels</div>
            <div className="story-point"><span className="check-mark" aria-hidden="true">✓</span> The right access for every account</div>
          </div>
        </div>

        <div className="story-footer">A calmer way to manage your products.</div>
      </section>

      <section className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">{registering ? 'GET STARTED' : 'WELCOME BACK'}</p>
          <h2>{registering ? 'Create your account' : 'Sign in to Stockroom'}</h2>
          <p className="auth-description">
            {registering
              ? 'Create an account to get started with your product catalog.'
              : 'Enter your details below to continue to your workspace.'}
          </p>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}

          <form className="login-form" onSubmit={submit}>
            <label>
              Username
              <input
                value={form.username}
                onChange={set('username')}
                placeholder="Enter your username"
                autoComplete="username"
                required
                autoFocus
              />
            </label>
            {registering && (
              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>
            )}
            <label>
              Password
              <input
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder={registering ? 'At least 6 characters' : 'Enter your password'}
                autoComplete={registering ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </label>
            <button className="auth-submit" disabled={busy}>
              {busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="auth-switch">
            {registering ? 'Already have an account? ' : 'New to Stockroom? '}
            <button type="button" onClick={switchMode}>{registering ? 'Sign in' : 'Create an account'}</button>
          </p>
          <div className="auth-footnote">Your product workspace, organized and ready when you are.</div>
        </div>
      </section>
    </main>
  );
}
