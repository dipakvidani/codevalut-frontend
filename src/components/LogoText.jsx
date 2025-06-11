import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const LogoText = ({ className = '', size = 'default' }) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        CodeVault
      </span>
    </Link>
  );
};

export default LogoText; 