import React from 'react';
import { useNavigate } from 'react-router-dom';
import velaLogo from '../../../assets/vela-logo.svg';

const Logo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200"
      aria-label="Go to home"
    >
      <img src={velaLogo} alt="Vela Logo" className="h-16 w-16" />
      {/* Removed text as logo contains 'Vela' */}
    </button>
  );
};

export default Logo;