import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import logo from '../assets/logo.svg';

export default function StockInput({ tickers, setTickers, onAnalyze }) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const ticker = inputValue.trim().toUpperCase();
    if (tickers.length < 6 && !tickers.includes(ticker)) {
      setTickers([...tickers, ticker]);
    }
    setInputValue('');
  };

  const removeTicker = (t) => {
    setTickers(tickers.filter(item => item !== t));
  };

  const isAnalyzeDisabled = tickers.length === 0 || tickers.length > 6;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-center mb-10">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 flex items-center justify-center">
            <img src={logo} alt="Gemini Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-slate-100 mb-4 tracking-tight">
          Comparador de ações
        </h1>
        <p className="text-slate-400 text-lg max-w-lg mx-auto">
          Adicione de 1 a 6 ações para uma análise fundamentalista focada em aposentadoria e renda passiva.
        </p>
      </div>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleAdd} className="relative flex items-center mb-6">
          <div className="absolute left-4 text-slate-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all uppercase placeholder:normal-case placeholder:text-slate-600"
            placeholder="Digite o ticker (ex: BBAS3)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={tickers.length >= 6}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || tickers.length >= 6}
            className="absolute right-2 px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </form>

        {tickers.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6 min-h-[40px]">
            {tickers.map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium animate-in fade-in zoom-in duration-200">
                {t}
                <button
                  type="button"
                  onClick={() => removeTicker(t)}
                  className="text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[40px] mb-6 text-sm text-slate-600 border border-dashed border-slate-800 rounded-lg">
            Nenhuma ação selecionada
          </div>
        )}

        <button
          onClick={onAnalyze}
          disabled={isAnalyzeDisabled}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Analisar Ativos ({tickers.length}/6)
        </button>
      </div>
    </div>
  );
}
