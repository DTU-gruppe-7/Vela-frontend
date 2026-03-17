import React from 'react';

const Logo: React.FC = () => (
  <div className="flex items-center gap-2.5">
    <img src="/src/assets/vela-logo.svg" alt="Vela Logo" className="h-8 w-8" />
    <span className="text-xl font-bold text-gray-900">Vela</span>
  </div>
);

export default Logo;
