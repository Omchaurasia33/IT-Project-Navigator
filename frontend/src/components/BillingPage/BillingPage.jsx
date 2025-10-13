import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

const BillingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const reason = searchParams.get('reason');

  const handleUpgrade = async (duration, planName) => {
    setLoadingPlan(planName);
    if (!window.confirm(`Are you sure you want to purchase the ${planName} plan?`)) {
      setLoadingPlan(null);
      return;
    }
    try {
      const res = await apiFetch('/billing/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      // Update user context with new tenant info
      setUser({ ...user, tenant: data.tenant });

      alert('Upgrade successful! You now have full access.');
      navigate('/dashboard');
    } catch (err) {
      alert(`Upgrade failed: ${err.message}`);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ padding: '2rem', color:"#333" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Plan</h1>
        {reason === 'inactive' && (
          <p style={{ fontSize: '1.1rem', color: '#dc2626', background: '#fee2e2', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            Your trial has expired or your plan is inactive. Please choose a plan to continue.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Pricing Card 1 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Monthly</h2>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>₹300 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ 30 days</span></p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
              <li>✅ All features included</li>
              <li>✅ Unlimited tasks</li>
              <li>✅ Email support</li>
            </ul>
            <button 
              onClick={() => handleUpgrade(30, 'Monthly')} 
              disabled={loadingPlan === 'Monthly'}
              style={{ width: '100%', padding: '0.75rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {loadingPlan === 'Monthly' ? 'Processing...' : 'Choose Monthly'}
            </button>
          </div>

          {/* Pricing Card 2 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Pro</h2>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>₹500 <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/ 60 days</span></p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left' }}>
              <li>✅ All features included</li>
              <li>✅ Unlimited tasks</li>
              <li>✅ Priority email support</li>
            </ul>
            <button 
              onClick={() => handleUpgrade(60, 'Pro')} 
              disabled={loadingPlan === 'Pro'}
              style={{ width: '100%', padding: '0.75rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {loadingPlan === 'Pro' ? 'Processing...' : 'Choose Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPage;