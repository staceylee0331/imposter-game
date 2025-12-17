import React, { useState } from 'react';
import { Player, GameData } from '../types';
import { Eye, EyeOff, User, MapPin, Fingerprint } from 'lucide-react';

interface RoleRevealProps {
  players: Player[];
  gameData: GameData;
  onFinished: () => void;
}

export const RoleReveal: React.FC<RoleRevealProps> = ({ players, gameData, onFinished }) => {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  const handleNext = () => {
    setIsRevealed(false);
    if (isLastPlayer) {
      onFinished();
    } else {
      setCurrentPlayerIndex(prev => prev + 1);
    }
  };

  const RevealCard = () => (
    <div 
      className="w-full max-w-xs aspect-[3/4] cursor-pointer group perspective-1000"
      onClick={() => setIsRevealed(!isRevealed)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isRevealed ? 'rotate-y-180' : ''}`}
           style={{ transformStyle: 'preserve-3d', transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        
        {/* Front of Card (Hidden) */}
        <div className="absolute w-full h-full backface-hidden bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col items-center justify-center p-8 space-y-6">
            <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-3xl font-bold text-slate-200 text-center break-words max-w-full">{currentPlayer.name}</h2>
            <p className="text-slate-500 text-center">Pass device to {currentPlayer.name}.<br/>Tap card to reveal identity.</p>
            <div className="mt-8 px-4 py-2 bg-slate-700/50 rounded-full text-sm text-slate-400 flex items-center">
                <Eye className="w-4 h-4 mr-2" /> Tap to flip
            </div>
        </div>

        {/* Back of Card (Revealed) */}
        <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 flex flex-col items-center justify-center p-8 space-y-6"
             style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            
            {currentPlayer.isImposter ? (
                 <>
                    <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                        <Fingerprint className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-500">IMPOSTER</h2>
                    <div className="p-4 bg-red-950/30 rounded-xl border border-red-500/30 w-full text-center">
                        <p className="text-red-200">You don't know the location.</p>
                        <p className="text-red-300/60 text-sm mt-2">Blend in. Figure it out.</p>
                    </div>
                 </>
            ) : (
                <>
                     <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <MapPin className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div className="text-center w-full">
                         <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Location</h3>
                         <h2 className="text-2xl font-bold text-white mb-6">{gameData.location}</h2>
                         
                         <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Your Role</h3>
                         <h2 className="text-2xl font-bold text-indigo-400">{currentPlayer.role}</h2>
                    </div>
                </>
            )}

            <div className="mt-auto pt-8">
                 <div className="px-4 py-2 bg-slate-700/50 rounded-full text-sm text-slate-400 flex items-center">
                    <EyeOff className="w-4 h-4 mr-2" /> Tap to hide
                </div>
            </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 space-y-8 animate-fade-in">
        <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-slate-300">Secret Identity</h1>
            <p className="text-slate-500">Pass the device to each player</p>
        </div>

        <RevealCard />

        <div className="w-full max-w-xs">
             <button
                onClick={handleNext}
                disabled={isRevealed} // Force them to hide card before passing
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    isRevealed
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/40'
                }`}
            >
                {isLastPlayer ? "Start Game" : "Next Player"}
            </button>
            {isRevealed && (
                <p className="text-center text-red-400 text-xs mt-3 animate-bounce">
                    Hide card before passing!
                </p>
            )}
        </div>
    </div>
  );
};
