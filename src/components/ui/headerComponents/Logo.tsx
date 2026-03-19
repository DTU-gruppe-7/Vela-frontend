import React from 'react';
import velaLogo from '../../../assets/vela-logo.svg';

const Logo: React.FC = () => (
  <div className="flex items-center">
    <img src={velaLogo} alt="Vela Logo" className="h-16 w-16" />
    {/* Removed text as logo contains 'Vela' */}
  </div>
);

export default Logo;