import React from 'react';
import { HistoryItem } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onSelect, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-start backdrop-blur-sm bg-black/50" onClick={onClose}>
      <div 
        className="w-80 h-full bg-slate-900 border-r border-slate-700 p-4 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">سجل العمليات</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 mt-10">لا يوجد سجل حتى الآن</div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => onSelect(item)}
                className="p-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors border border-slate-700/50"
              >
                <div className="text-slate-400 text-sm mb-1 font-mono break-all" dir="ltr">{item.expression}</div>
                <div className="text-accent text-lg font-bold text-left font-mono" dir="ltr">= {item.result}</div>
                <div className="text-xs text-slate-500 text-right mt-2">
                  {new Date(item.timestamp).toLocaleTimeString('ar-EG')}
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="mt-4 py-2 w-full bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
          >
             محو السجل
          </button>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;