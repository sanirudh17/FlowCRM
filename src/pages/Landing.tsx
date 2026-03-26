import React, { useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/', { replace: true });
    }
  }, [session, navigate]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0, background: '#FFFFFF' }}>
      <iframe src="/landing/index.html" style={{ width: '100%', height: '100%', border: 'none' }} title="FlowCRM Landing"></iframe>
    </div>
  );
}
