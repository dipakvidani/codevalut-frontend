import React from 'react';

const Logo = ({ className = '', size = 'default' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Shield base */}
        <path
          d="M50 5L15 20V45C15 65.5 30.5 84.5 50 95C69.5 84.5 85 65.5 85 45V20L50 5Z"
          fill="#4F46E5"
          stroke="#312E81"
          strokeWidth="2"
        />
        
        {/* Code brackets */}
        <path
          d="M35 35L45 50L35 65M65 35L55 50L65 65"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Lock */}
        <rect
          x="40"
          y="40"
          width="20"
          height="15"
          rx="2"
          fill="white"
        />
        <path
          d="M45 40V35C45 32.2386 47.2386 30 50 30C52.7614 30 55 32.2386 55 35V40"
          stroke="white"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};

export default Logo; 