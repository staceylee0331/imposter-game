import React, { useState } from 'react';
import { Player } from '../types';
import { Fingerprint, CheckCircle2, User, Eye, ArrowRight } from 'lucide-react';

interface VotingSessionProps {
  players: Player[];
  onVotingComplete: (votes: Record<number, number>) => void;
}

export const VotingSession: React.FC<VotingSessionProps> = ({ players, onVotingComplete }) => {
  const [voterIndex, setVoterIndex] = useState(0);
  const [isPassing, setIsPassing] = useState(true); // True = "Pass device screen", False = "Voting screen"
  const [votes, setVotes] = useState<Record<number, number>>({});
  const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);

  const currentVoter = players[voterIndex];
  const isLastVoter = voterIndex === players.length - 1;

  const handleStartVoting = () => {
    setIsPassing(false);
  };

  const handleConfirmVote = () => {
    if (selectedSuspectId === null) return;

    // Record vote
    const newVotes = { ...votes };
    newVotes[selectedSuspectId] = (newVotes[selectedSuspectId] || 0) + 1;
    setVotes(newVotes);

    if (isLastVoter) {
      onVotingComplete(newVotes);
    } else {
      // Prepare for next player
      setVoterIndex(prev => prev + 1);
      setSelectedSuspectId(null);
      setIsPassing(true);
    }
  };

  if (isPassing) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto border-2 border-slate-700">
             <User className="w-10 h-10 text-slate-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-200">Voting Phase</h1>
            <p className="text-slate-500 mt-2">Pass the device to</p>
            <h2 className="text-3xl font-bold text-indigo-400 mt-1">{currentVoter.name}</h2>
          </div>
        </div>

        <button
          onClick={handleStartVoting}
          className="w-full max-w-xs py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-900/40 transition-all flex items-center justify-center"
        >
           <Eye className="w-5 h-5 mr-2" />
           I am {currentVoter.name}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-6 animate-fade-in overflow-hidden">
      <div className="text-center space-y-2 mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-white">Who is the Imposter?</h1>
        <p className="text-slate-400 text-sm">Select the player you suspect most.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {players.map((player) => {
          // Optional: Prevent voting for yourself? Standard Spyfall allows it, but usually people vote others.
          // For now, let's allow it but highlight 'You'
          const isMe = player.id === currentVoter.id;
          const isSelected = selectedSuspectId === player.id;
          
          return (
            <button
              key={player.id}
              onClick={() => setSelectedSuspectId(player.id)}
              disabled={isMe} // Disable self-voting for clarity
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-900/40 transform scale-[1.02]'
                  : isMe 
                    ? 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${isSelected ? 'bg-white/20' : 'bg-slate-700'}`}>
                  <User className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <div className="text-left">
                     <span className={`text-lg font-medium block ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                        {player.name}
                    </span>
                    {isMe && <span className="text-xs text-slate-500">(That's you)</span>}
                </div>
              </div>
              
              {isSelected && (
                <div className="animate-fade-in">
                  <Fingerprint className="w-6 h-6 text-indigo-200" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800 shrink-0">
        <button
          onClick={handleConfirmVote}
          disabled={selectedSuspectId === null}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center ${
            selectedSuspectId !== null
              ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-pink-900/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
            {isLastVoter ? (
                <>
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Confirm & Reveal Results
                </>
            ) : (
                <>
                    <ArrowRight className="w-5 h-5 mr-2" /> Confirm & Next Player
                </>
            )}
        </button>
      </div>
    </div>
  );
};
