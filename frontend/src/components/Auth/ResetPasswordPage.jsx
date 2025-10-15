import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ otp: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const email = location.state?.email;

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/password-reset/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: form.otp, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to reset password');
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 2000);
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Reset Password</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter the OTP you received and your new password</p>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        {message && <p className="text-center text-sm text-green-500">{message}</p>}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="otp" className="text-sm font-medium text-text-light dark:text-text-dark">
              OTP
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              className={inputClasses}
              value={form.otp}
              onChange={onChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-light dark:text-text-dark">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className={inputClasses}
              value={form.password}
              onChange={onChange}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-text-light dark:text-text-dark">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className={inputClasses}
              value={form.confirmPassword}
              onChange={onChange}
            />
          </div>

          <div>
            <button type="submit" disabled={loading} className={buttonClasses}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
