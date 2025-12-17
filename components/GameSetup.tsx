import React, { useState, useEffect } from 'react';
import { GameSettings } from '../types';
import { Users, Timer, Sparkles, User } from 'lucide-react';

interface GameSetupProps {
  onStart: (settings: GameSettings) => void;
}

const THEMES = [
  "Standard (Everyday Life)",
  "Sci-Fi & Space",
  "Fantasy & Medieval",
  "Historical Events",
  "Movie Sets",
  "Horror & Spooky"
];

export const GameSetup: React.FC<GameSetupProps> = ({ onStart }) => {
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [duration, setDuration] = useState(5);
  const [customTheme, setCustomTheme] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  // Sync playerNames array length with playerCount
  useEffect(() => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      if (playerCount > prev.length) {
        // Add new defaults
        for (let i = prev.length; i < playerCount; i++) {
          newNames.push(`Player ${i + 1}`);
        }
      } else {
        // Trim
        newNames.length = playerCount;
      }
      return newNames;
    });
  }, [playerCount]);

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...playerNames];
    newNames[index] = value;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    onStart({
      playerCount,
      playerNames,
      roundDurationMinutes: duration,
      theme: customTheme.trim() ? customTheme : selectedTheme,
    });
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-6 space-y-6 animate-fade-in overflow-y-auto custom-scrollbar">
      <div className="text-center space-y-2 shrink-0">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-purple-600">
          IMPOSTER AI
        </h1>
        <p className="text-slate-400">Identify the spy before time runs out.</p>
      </div>

      {/* Player Count */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm shrink-0 space-y-6">
        <div>
            <div className="flex items-center justify-between mb-4">
            <label className="flex items-center text-lg font-medium text-slate-200">
                <Users className="w-5 h-5 mr-2 text-indigo-400" />
                Players
            </label>
            <span className="text-2xl font-bold text-indigo-400">{playerCount}</span>
            </div>
            <input
            type="range"
            min="3"
            max="12"
            value={playerCount}
            onChange={(e) => setPlayerCount(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-colors"
            />
        </div>
        
        {/* Name Inputs Grid */}
        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {playerNames.map((name, index) => (
            <div key={index} className="flex items-center bg-slate-900/50 rounded-lg border border-slate-700/50 px-3 py-2 focus-within:border-indigo-500/50 transition-colors">
              <User className="w-4 h-4 text-slate-500 mr-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="bg-transparent border-none text-slate-200 placeholder-slate-600 text-sm w-full focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between mb-4">
          <label className="flex items-center text-lg font-medium text-slate-200">
            <Timer className="w-5 h-5 mr-2 text-emerald-400" />
            Minutes
          </label>
          <span className="text-2xl font-bold text-emerald-400">{duration}</span>
        </div>
        <input
          type="range"
          min="3"
          max="15"
          step="1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-colors"
        />
      </div>

      {/* Theme Selection */}
      <div className="space-y-3 shrink-0">
        <label className="flex items-center text-lg font-medium text-slate-200">
          <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
          Location Theme
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme}
              onClick={() => { setSelectedTheme(theme); setCustomTheme(''); }}
              className={`p-3 text-sm rounded-xl transition-all border ${
                selectedTheme === theme && !customTheme
                  ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750'
              }`}
            >
              {theme.split('(')[0].trim()}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Or type a custom theme..."
          value={customTheme}
          onChange={(e) => setCustomTheme(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />
      </div>

      <button
        onClick={handleStart}
        className="w-full py-4 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl text-white font-bold text-lg shadow-lg shadow-purple-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 mb-6"
      >
        GENERATE GAME
      </button>
    </div>
  );
};