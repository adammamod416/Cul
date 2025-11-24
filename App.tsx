import React, { useState, useEffect, useRef } from 'react';
import { CalculatorMode, HistoryItem } from './types';
import Button from './components/Button';
import HistoryPanel from './components/HistoryPanel';
import { solveMathWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<CalculatorMode>(CalculatorMode.STANDARD);
  const [input, setInput] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{ answer: string; explanation: string } | null>(null);

  const keyMap = useRef<Record<string, string>>({
    'Enter': '=',
    'Escape': 'C',
    'Backspace': 'DEL',
    '/': '÷',
    '*': '×',
    '-': '-',
    '+': '+',
    '.': '.',
    '(': '(',
    ')': ')',
  });

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === CalculatorMode.AI_SOLVER) return;

      const key = e.key;
      if (/[0-9]/.test(key)) {
        handlePress(key);
      } else if (keyMap.current[key]) {
        handlePress(keyMap.current[key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, input]); // Added input to deps to ensure latest state is accessed if needed, though handlePress uses setter functional updates mostly

  const addToHistory = (expression: string, calcResult: string, type: 'standard' | 'ai') => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      expression,
      result: calcResult,
      type,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  };

  const safeCalculate = (expression: string): string => {
    try {
      // sanitize
      const sanitized = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^0-9+\-*/().]/g, '');

      if (!sanitized) return '';
      // eslint-disable-next-line no-new-func
      const func = new Function(`return ${sanitized}`);
      const res = func();
      
      if (!isFinite(res) || isNaN(res)) return 'خطأ';
      
      // Format number to avoid long decimals
      return String(Math.round(res * 100000000) / 100000000);
    } catch (e) {
      return 'خطأ';
    }
  };

  const handlePress = (val: string) => {
    if (val === 'C') {
      setInput('');
      setResult('');
    } else if (val === 'DEL') {
      setInput(prev => prev.slice(0, -1));
    } else if (val === '=') {
      if (!input) return;
      const res = safeCalculate(input);
      setResult(res);
      addToHistory(input, res, 'standard');
      // Optional: reset input to result for chain calculations
      // setInput(res); 
    } else if (val === '√') {
       try {
         const currentVal = parseFloat(safeCalculate(input) || input);
         const res = String(Math.sqrt(currentVal));
         setResult(res);
         addToHistory(`√(${input || '0'})`, res, 'standard');
         setInput(res);
       } catch {
         setResult('خطأ');
       }
    } else {
      // Prevent multiple operators in a row
      const isOperator = ['+', '-', '×', '÷', '.'].includes(val);
      if (isOperator && input.length > 0) {
          const lastChar = input.slice(-1);
          if (['+', '-', '×', '÷', '.'].includes(lastChar)) {
             setInput(prev => prev.slice(0, -1) + val);
             return;
          }
      }
      setInput(prev => prev + val);
    }
  };

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiResponse(null);

    const res = await solveMathWithGemini(aiPrompt);
    
    setAiLoading(false);
    setAiResponse(res);
    addToHistory(aiPrompt, res.answer, 'ai');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onClear={() => setHistory([])}
        onSelect={(item) => {
          if (item.type === 'standard') {
            setInput(item.expression);
            setResult(item.result);
            setMode(CalculatorMode.STANDARD);
          } else {
            setAiPrompt(item.expression);
            setAiResponse({ answer: item.result, explanation: "تم استردادها من السجل" });
            setMode(CalculatorMode.AI_SOLVER);
          }
          setIsHistoryOpen(false);
        }}
      />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-auto sm:min-h-[700px]">
        
        {/* Header / Tabs */}
        <div className="flex p-2 bg-slate-800/50 border-b border-slate-700/50">
          <button 
            onClick={() => setMode(CalculatorMode.STANDARD)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${mode === CalculatorMode.STANDARD ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            قياسية
          </button>
          <button 
            onClick={() => setMode(CalculatorMode.AI_SOLVER)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${mode === CalculatorMode.AI_SOLVER ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <span>ذكية (Gemini)</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M12 2a1 1 0 0 1 .993.883L13 3v1.164A9.957 9.957 0 0 1 19.836 11H21a1 1 0 0 1 .993.883L22 12a1 1 0 0 1-.883.993L21 13h-1.164a9.954 9.954 0 0 1-6.836 6.836V21a1 1 0 0 1-.883.993L12 22a1 1 0 0 1-.993-.883L11 21v-1.164a9.957 9.957 0 0 1-6.836-6.836H3a1 1 0 0 1-.993-.883L2 12a1 1 0 0 1 .883-.993L3 11h1.164a9.954 9.954 0 0 1 6.836-6.836V3a1 1 0 0 1 .883-.993L12 2zM12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" fillRule="evenodd"/>
            </svg>
          </button>
          <button 
            onClick={() => setIsHistoryOpen(true)}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative">
          
          {mode === CalculatorMode.STANDARD ? (
            <>
              {/* Display */}
              <div className="flex-1 p-6 flex flex-col justify-end items-end space-y-2 bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="text-slate-400 text-lg sm:text-xl font-mono h-8 overflow-hidden w-full text-left" dir="ltr">
                   {/* Showing previous input or expression logic if we wanted detailed steps */}
                   {result && input !== result ? input : ''}
                </div>
                <div className={`text-white font-mono font-bold w-full text-left break-all transition-all duration-300 ${input.length > 12 ? 'text-4xl' : 'text-5xl sm:text-6xl'}`} dir="ltr">
                  {input || '0'}
                </div>
                {result && (
                   <div className="text-accent text-3xl sm:text-4xl font-mono font-bold w-full text-left mt-2" dir="ltr">
                     = {result}
                   </div>
                )}
              </div>

              {/* Keypad */}
              <div className="p-4 grid grid-cols-4 gap-3 bg-slate-800/30">
                <Button label="C" onClick={() => handlePress('C')} variant="danger" />
                <Button label="√" onClick={() => handlePress('√')} variant="action" />
                <Button label="%" onClick={() => handlePress('%')} variant="action" />
                <Button label="÷" onClick={() => handlePress('÷')} variant="accent" />

                <Button label="7" onClick={() => handlePress('7')} />
                <Button label="8" onClick={() => handlePress('8')} />
                <Button label="9" onClick={() => handlePress('9')} />
                <Button label="×" onClick={() => handlePress('×')} variant="accent" />

                <Button label="4" onClick={() => handlePress('4')} />
                <Button label="5" onClick={() => handlePress('5')} />
                <Button label="6" onClick={() => handlePress('6')} />
                <Button label="-" onClick={() => handlePress('-')} variant="accent" />

                <Button label="1" onClick={() => handlePress('1')} />
                <Button label="2" onClick={() => handlePress('2')} />
                <Button label="3" onClick={() => handlePress('3')} />
                <Button label="+" onClick={() => handlePress('+')} variant="accent" />

                <Button label="0" onClick={() => handlePress('0')} className="col-span-2" />
                <Button label="." onClick={() => handlePress('.')} />
                <Button label="=" onClick={() => handlePress('=')} variant="action" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              <div className="mb-6 text-center">
                 <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">مساعد الرياضيات الذكي</h2>
                 <p className="text-slate-400 text-sm">اكتب أي مسألة رياضية معقدة وسأقوم بحلها وشرحها.</p>
              </div>

              <form onSubmit={handleAiSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="مثال: احسب مساحة مثلث قاعدته 5 وارتفاعه 10..."
                    className="w-full h-32 bg-slate-800 text-white p-4 rounded-2xl border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none placeholder-slate-500"
                    dir="auto"
                  />
                  {aiPrompt && (
                    <button 
                       type="button" 
                       onClick={() => setAiPrompt('')}
                       className="absolute top-2 left-2 text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {aiLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                      حل المسألة
                    </>
                  )}
                </button>
              </form>

              {aiResponse && (
                <div className="mt-6 animate-fade-in">
                  <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">النتيجة النهائية</div>
                    <div className="text-3xl font-bold text-accent mb-4" dir="auto">{aiResponse.answer}</div>
                    
                    <div className="w-full h-px bg-slate-700/50 mb-4"></div>
                    
                    <div className="text-xs text-slate-400 mb-2">طريقة الحل</div>
                    <div className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap" dir="auto">
                      {aiResponse.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;