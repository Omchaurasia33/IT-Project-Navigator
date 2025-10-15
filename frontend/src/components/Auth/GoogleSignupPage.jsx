import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../lib/api';

export default function GoogleSignupPage() {
  const { setToken, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    tenantName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Consistent styling classes from SignupPage
  const inputClasses = "mt-1 block w-full px-3 py-2 bg-transparent border border-border-light dark:border-border-dark rounded-md shadow-sm placeholder-placeholder-light dark:placeholder-placeholder-dark focus:outline-none focus:ring-primary focus:border-primary text-text-light dark:text-text-dark sm:text-sm";
  const buttonClasses = "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50";
  const readOnlyInputClasses = `${inputClasses} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`;
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const name = params.get('name') || '';
    const email = params.get('email') || '';

    if (!name || !email) {
      setError("Could not retrieve user details from Google. Please try signing up again.");
      // Redirect back to signup page after a delay
      setTimeout(() => navigate('/signup'), 4000);
    }

    setForm(prevForm => ({ ...prevForm, name, email }));
  }, [location.search, navigate]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.password || !form.tenantName) {
      setError('Password and Company Name are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/auth/google-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account.');
      }

      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard', { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark flex items-center justify-center min-h-screen" style={{color:'#333'}}>
      <div className="w-full max-w-md p-8 space-y-6 bg-form-bg-light dark:bg-form-bg-dark rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Complete Your Signup</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Just a few more details to get started.</p>
        </div>
        {error && <p className="text-center text-sm text-red-500">{error}</p>}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-text-light dark:text-text-dark">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              readOnly
              className={readOnlyInputClasses}
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-light dark:text-text-dark">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              readOnly
              className={readOnlyInputClasses}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-light dark:text-text-dark">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={onChange}
              className={inputClasses}
            />
          </div>
          <div>
            <label htmlFor="tenantName" className="text-sm font-medium text-text-light dark:text-text-dark">Company Name</label>
            <input
              id="tenantName"
              name="tenantName"
              type="text"
              required
              placeholder="Your Company Inc"
              value={form.tenantName}
              onChange={onChange}
              className={inputClasses}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading || !form.name || !form.email}
              className={buttonClasses}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};