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

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-transparent border border-border-light dark:border-border-dark rounded-md shadow-sm placeholder-placeholder-light dark:placeholder-placeholder-dark focus:outline-none focus:ring-primary focus:border-primary text-text-light dark:text-text-dark sm:text-sm";
  const buttonClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50";

  return (
    <div className="bg-background-light dark:bg-background-dark flex items-center justify-center min-h-screen" style={{color:'#333'}}>
      <div className="w-full max-w-md p-8 space-y-6 bg-form-bg-light dark:bg-form-bg-dark rounded-lg shadow-lg">
        {!otpSent ? (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Create your account</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Start your 3-day free trial. No credit card required.</p>
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <form className="space-y-6" onSubmit={onSignupSubmit}>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-text-light dark:text-text-dark">Name</label>
                <input id="name" name="name" type="text" required className={inputClasses} value={form.name} onChange={onChange} />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-text-light dark:text-text-dark">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required className={inputClasses} value={form.email} onChange={onChange} />
              </div>
              <div>
                <label htmlFor="password"className="text-sm font-medium text-text-light dark:text-text-dark">Password</label>
                <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClasses} value={form.password} onChange={onChange} />
              </div>
              <div>
                <label htmlFor="tenantName" className="text-sm font-medium text-text-light dark:text-text-dark">Company Name</label>
                <input id="tenantName" name="tenantName" type="text" required placeholder="Your Company Inc" className={inputClasses} value={form.tenantName} onChange={onChange} />
              </div>
              <div>
                <button type="submit" disabled={loading} className={buttonClasses}>
                  {loading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-form-bg-light dark:bg-form-bg-dark text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            <div>
              <a href="http://localhost:3000/auth/google" className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <img className="w-5 h-5 mr-2" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" />
                Google
              </a>
            </div>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-opacity-80">
                Login
              </Link>
            </p>
          </>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Verify your email</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                An OTP has been sent to <strong>{form.email}</strong>. Please enter it below.
              </p>
            </div>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <form className="space-y-6" onSubmit={onVerifyOtpSubmit}>
              <div>
                <label htmlFor="otp" className="text-sm font-medium text-text-light dark:text-text-dark">One-Time Password (OTP)</label>
                <input id="otp" name="otp" type="text" required className={inputClasses} value={otp} onChange={onOtpChange} />
              </div>
              <div>
                <button type="submit" disabled={loading} className={buttonClasses}>
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Didn't receive the code?{' '}
              <button type="button" onClick={onResendOtp} disabled={loading} className="font-medium text-primary hover:text-opacity-80 bg-transparent border-none p-0 disabled:opacity-50 disabled:cursor-not-allowed">
                Resend OTP
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}