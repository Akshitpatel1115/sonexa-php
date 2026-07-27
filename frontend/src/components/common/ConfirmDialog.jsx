import React from 'react';
import { createPortal } from 'react-dom';
import { FiAlertTriangle } from 'react-icons/fi';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-md rounded-3xl glass-panel border border-white/5 p-6 sm:p-7 shadow-2xl shadow-black/80 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
            <FiAlertTriangle className="text-2xl" />
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
        </div>
        
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-8">
          {message}
        </p>
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="rounded-2xl px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white glass-card border border-white/5 hover:border-white/5 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            className="rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-95 px-6 py-2.5 text-xs font-bold text-white transition-all shadow-lg shadow-rose-600/30 border border-white/5 cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDialog;
