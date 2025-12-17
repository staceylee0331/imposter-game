import React, { useEffect, useState } from 'react';
import { GameData, GameSettings } from '../types';
import { generateQuestionSuggestion } from '../services/geminiService';
import { HelpCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface GameSessionProps {
  gameData: GameData;
  settings: GameSettings;
  onEndGame: () => void;
}

export const GameSession: React.FC<GameSessionProps> = ({ gameData, settings, onEndGame }) => {
  const [timeLeft, setTimeLeft] = useState(settings.roundDurationMinutes * 60);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGetSuggestion = async () => {
    setLoadingSuggestion(true);
    const q = await generateQuestionSuggestion(gameData.location);
    setSuggestion(q);
    setLoadingSuggestion(false);
  };

  const progress = (timeLeft / (settings.roundDurationMinutes * 60)) * 100;
  const isTimeUp = timeLeft === 0;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-6 animate-fade-in relative">
        
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-8">
        <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 256 256">
                <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke="#1e293b"
                    strokeWidth="16"
                    fill="none"
                />
                <circle
                    cx="128"
                    cy="128"
                    r="110"
                    stroke={timeLeft < 60 ? "#ef4444" : "#6366f1"}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 110}
                    strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
                    className="transition-all duration-1000 ease-linear"
                />
            </svg>
            <div className="text-center z-10">
                <div className={`text-6xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-200'}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="text-slate-500 uppercase tracking-widest text-sm mt-2">
                    {isTimeUp ? "Time's Up" : "Remaining"}
                </div>
            </div>
        </div>

        {/* AI Assistance */}
        <div className="w-full space-y-4 px-2">
             {suggestion && (
                <div className="bg-amber-900/20 border border-amber-500/30 p-4 rounded-xl animate-fade-in">
                    <p className="text-amber-200 italic text-center text-sm">"{suggestion}"</p>
                </div>
            )}
            
            <button
                onClick={handleGetSuggestion}
                disabled={loadingSuggestion}
                className="w-full py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-300 flex items-center justify-center transition-all active:scale-95 text-sm"
            >
                {loadingSuggestion ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                    <HelpCircle className="w-4 h-4 mr-2 text-indigo-400" />
                )}
                {suggestion ? "Get Another Question" : "Suggest a Question"}
            </button>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-8 pt-6 border-t border-slate-800 shrink-0">
         <button
            onClick={onEndGame}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                isTimeUp 
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-900/50' 
                : 'bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 text-red-400'
            }`}
        >
            <AlertTriangle className="w-5 h-5 mr-2" />
            {isTimeUp ? "Proceed to Voting" : "End Round & Vote"}
        </button>
      </div>
    </div>
  );
};