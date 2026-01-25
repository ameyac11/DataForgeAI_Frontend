import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// Settings is now a dialog opened from the sidebar, redirect to app
const SettingsPage = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/app');
  }, [navigate]);

  return null;
};

export default SettingsPage;
