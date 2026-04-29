import React from 'react';

const AuthLogo = ({ className = "mx-auto mb-6" }) => {
  return (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path d="M18.5 4.5L5 30H15.5L25 12L18.5 4.5Z" fill="currentColor"/>
      <path d="M28.5 18L22 30H36L28.5 18Z" fill="currentColor"/>
    </svg>
  );
};

export default AuthLogo;
