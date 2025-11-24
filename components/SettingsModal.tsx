import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
  currentKey: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentKey }) => {
  const [key, setKey] = useState(currentKey);

  // Reset local state when modal opens or prop changes
  useEffect(() => {
    setKey(currentKey);
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center backdrop-blur-sm bg-black/60 p-4" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 left-4 text-slate-500 hover:text-white"
        >
            ✕
        </button>

        <div className="text-center mb-6">
            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-white">إعدادات مفتاح API</h2>
            <p className="text-slate-400 text-sm mt-1">للاستخدام المجاني للذكاء الاصطناعي</p>
        </div>
        
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-medium mb-2">Google Gemini API Key</label>
          <input 
            type="password" 
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="أدخل مفتاح API..."
            className="w-full bg-slate-800 text-white p-3 rounded-xl border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-left placeholder:text-right"
            dir="ltr"
          />
          <div className="mt-3 text-xs text-slate-500 leading-relaxed">
            مفتاحك يُحفظ محلياً في متصفحك فقط. يمكنك الحصول على مفتاح مجاني من{' '}
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">
              Google AI Studio
            </a>.
          </div>
        </div>

        <button 
          onClick={() => { onSave(key.trim()); onClose(); }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95"
        >
          حفظ المفتاح
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;