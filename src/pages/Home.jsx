import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // If user is logged in, redirect based on role
    if (user.role === 'manager') {
      navigate('/manager');
    } else if (user.role === 'worker') {
      navigate('/worker');
    } else {
      // If role is unknown, default to login
      navigate('/login');
    }
  }, [user, navigate]);

  // This component doesn't render anything, it just redirects
  return null;
}

export default Home; 