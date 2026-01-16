
import React from 'react';

interface ButtonProps {
  label: string | React.ReactNode;
  subLabel?: string;
  subLabelColor?: 'blue' | 'red';
  onClick: () => void;
  className?: string;
  type?: 'num' | 'op' | 'func' | 'action' | 'shift' | 'util';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  subLabel, 
  subLabelColor = 'blue', 
  onClick, 
  className = '', 
  type = 'num' 
}) => {
  const baseStyles = "relative flex flex-col items-center justify-center transition-all duration-75 active:translate-y-0.5 active:shadow-none select-none touch-none";
  
  const typeStyles = {
    num: "bg-[#e5e7eb] text-[#111] hover:bg-white rounded-full h-11 w-full font-bold text-lg shadow-[0_4px_0_#9ca3af] border-t border-white/40",
    op: "bg-[#2d2d2d] text-white hover:bg-[#3d3d3d] rounded-full h-11 w-full font-bold shadow-[0_4px_0_#111] border-t border-white/5",
    func: "bg-[#2d2d2d] text-white hover:bg-[#3d3d3d] rounded-xl h-9 w-full text-[9px] font-bold shadow-[0_3px_0_#111] border-t border-white/5",
    action: "bg-[#f3f4f6] text-[#111] hover:bg-white rounded-full h-11 w-full font-black text-xs shadow-[0_4px_0_#9ca3af]",
    shift: "bg-[#1d4ed8] text-white hover:bg-blue-600 rounded-full h-11 w-full font-bold shadow-[0_4px_0_#1e3a8a] border-t border-white/20",
    util: "bg-[#141414] text-[#888] hover:text-white rounded-lg h-8 w-full text-[9px] border border-white/10 shadow-md"
  };

  const labelColorClass = subLabelColor === 'blue' ? 'text-blue-400' : 'text-red-400';

  return (
    <div className="flex flex-col items-center w-full group">
      <div className="h-3 flex items-end mb-0.5">
        {subLabel && (
          <span className={`text-[7px] ${labelColorClass} font-black uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity`}>
            {subLabel}
          </span>
        )}
      </div>
      <button 
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }} 
        className={`${baseStyles} ${typeStyles[type]} ${className}`}
      >
        <span className="drop-shadow-sm">{label}</span>
      </button>
    </div>
  );
};

export default Button;
