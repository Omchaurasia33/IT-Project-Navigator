import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { apiFetch } from '../../lib/api';

export default function LoginPage() {
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', tenantSlug: '' });
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await apiFetch('/tenants');
        const data = await res.json();
        if (res.ok) {
          setTenants(data);
        } else {
          throw new Error(data.message || 'Failed to fetch tenants');
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchTenants();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password || !form.tenantSlug) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard', { replace: true });
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
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark">Sign in to your account</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Select your organization to continue</p>
        </div>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="tenantSlug" className="text-sm font-medium text-text-light dark:text-text-dark">
              Organization
            </label>
            <select
              id="tenantSlug"
              name="tenantSlug"
              value={form.tenantSlug}
              onChange={onChange}
              required
              className={inputClasses}
            >
              <option value="" disabled>Select your Organization</option>
              {tenants.map(tenant => (
                <option key={tenant.slug} value={tenant.slug}>{tenant.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-light dark:text-text-dark">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={inputClasses}
              value={form.email}
              onChange={onChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-light dark:text-text-dark">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClasses}
              value={form.password}
              onChange={onChange}
            />
          </div>

          <div>
            <button type="submit" disabled={loading} className={buttonClasses}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:text-opacity-80">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}