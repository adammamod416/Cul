import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'action' | 'accent' | 'danger' | 'ghost';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'default', className = '', disabled = false }) => {
  const baseStyles = "h-14 sm:h-16 rounded-2xl text-xl sm:text-2xl font-semibold transition-all duration-200 active:scale-95 flex items-center justify-center shadow-lg select-none";
  
  const variants = {
    default: "bg-slate-700 hover:bg-slate-600 text-white shadow-slate-900/20",
    action: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30",
    accent: "bg-accent hover:bg-amber-400 text-white shadow-amber-900/30",
    danger: "bg-red-500 hover:bg-red-400 text-white shadow-red-900/30",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {label}
    </button>
  );
};

export default Button;