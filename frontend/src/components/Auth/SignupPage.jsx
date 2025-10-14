
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../lib/api';

export default function SignupPage() {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', tenantName: '' });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onOtpChange = (e) => setOtp(e.target.value);

  const onSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.tenantName) {
      setError('All fields are required');
      return;
    }
    const body = {
      name: form.name,
      email: form.email,
      password: form.password,
      tenantName: form.tenantName
    };
    setLoading(true);
    try {
      const res = await apiFetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Signup failed');
      setOtpSent(true);
      setError(''); // Clear previous errors
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('OTP is required');
      return;
    }
    const body = { email: form.email, otp };
    setLoading(true);
    try {
      const res = await apiFetch('/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'OTP verification failed');
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
        const res = await apiFetch('/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to resend OTP');
        // Optionally show a success message for resending
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {!otpSent ? (
        <form className="auth-card" onSubmit={onSignupSubmit}>
          <h2>Sign up</h2>
          {error && <p className="auth-error">{error}</p>}
          <label>Name<input name="name" value={form.name} onChange={onChange} required /></label>
          <label>Email<input name="email" type="email" value={form.email} onChange={onChange} required /></label>
          <label>Password<input name="password" type="password" value={form.password} onChange={onChange} required /></label>
          <label>Company Name<input name="tenantName" value={form.tenantName} onChange={onChange} placeholder="Your Company Inc" required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Sign up'}</button>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      ) : (
        <form className="auth-card" onSubmit={onVerifyOtpSubmit}>
          <h2>Verify your email</h2>
          <p>An OTP has been sent to <strong>{form.email}</strong>. Please enter it below.</p>
          {error && <p className="auth-error">{error}</p>}
          <label>OTP<input name="otp" value={otp} onChange={onOtpChange} required /></label>
          <button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify'}</button>
          <p>Didn't receive the code? <button type="button" onClick={onResendOtp} disabled={loading} className="link-button">Resend OTP</button></p>
        </form>
      )}
      <style>{`
        .auth-container{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;padding:16px}
        .auth-card{width:100%;max-width:380px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);color:#000}
        h2{margin:0 0 16px}
        label{display:flex;flex-direction:column;gap:6px;margin:8px 0}
        input{padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;color:#000}
        button{margin-top:8px;width:100%;padding:10px 12px;border-radius:8px;border:none;background:#111827;color:#fff;font-weight:600}
        .auth-error{color:#dc2626;margin:0 0 10px}
        .link-button{background:none;border:none;color:#111827;text-decoration:underline;padding:0;margin:0;cursor:pointer;}
      `}</style>
    </div>
  );
}
