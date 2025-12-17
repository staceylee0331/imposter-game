import React, { useState } from 'react';
import { GamePhase, Player, GameData, GameSettings } from './types';
import { GameSetup } from './components/GameSetup';
import { RoleReveal } from './components/RoleReveal';
import { GameSession } from './components/GameSession';
import { VotingSession } from './components/VotingSession';
import { generateGameScenario } from './services/geminiService';
import { Loader2, MapPin, Fingerprint, RotateCcw, Trophy, Skull, User } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SETUP);
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [voteResults, setVoteResults] = useState<Record<number, number> | null>(null);

  const startGame = async (newSettings: GameSettings) => {
    setSettings(newSettings);
    setVoteResults(null);
    setPhase(GamePhase.LOADING);

    // Calculate number of roles needed (Total players - 1 Imposter)
    const roleCount = newSettings.playerCount - 1;

    // Generate scenario
    const data = await generateGameScenario(newSettings.theme, roleCount);
    setGameData(data);

    // Select Imposter randomly
    const imposterIndex = Math.floor(Math.random() * newSettings.playerCount);
    
    // Assign roles
    const newPlayers: Player[] = [];
    // Shuffle roles
    const shuffledRoles = [...data.roles].sort(() => 0.5 - Math.random());
    let roleIdx = 0;

    for (let i = 0; i < newSettings.playerCount; i++) {
      const isImposter = i === imposterIndex;
      newPlayers.push({
        id: i + 1,
        name: newSettings.playerNames[i] || `Player ${i + 1}`,
        isImposter,
        role: isImposter ? 'Imposter' : shuffledRoles[roleIdx++],
        isRevealed: false
      });
    }

    setPlayers(newPlayers);
    setPhase(GamePhase.REVEAL);
  };

  const handleRevealFinished = () => {
    setPhase(GamePhase.PLAYING);
  };

  const handleVoteStart = () => {
    setPhase(GamePhase.VOTING);
  };

  const handleVotingComplete = (votes: Record<number, number>) => {
    setVoteResults(votes);
    setPhase(GamePhase.GAME_OVER);
  };

  const handleReset = () => {
    setPhase(GamePhase.SETUP);
    setSettings(null);
    setPlayers([]);
    setGameData(null);
    setVoteResults(null);
  };

  // Helper to determine game result
  const getGameResult = () => {
    if (!voteResults || !players.length) return { winner: 'Unknown', mostVoted: null, isTie: false };

    // Find player with max votes
    let maxVotes = -1;
    let mostVotedId: number | null = null;
    let isTie = false;

    Object.entries(voteResults).forEach(([idStr, count]) => {
        const id = parseInt(idStr);
        if (count > maxVotes) {
            maxVotes = count;
            mostVotedId = id;
            isTie = false;
        } else if (count === maxVotes) {
            isTie = true;
        }
    });

    const imposter = players.find(p => p.isImposter);
    const mostVotedPlayer = players.find(p => p.id === mostVotedId);

    // Logic: Crew wins if the imposter has the most votes (and no tie)
    const imposterCaught = mostVotedPlayer?.isImposter && !isTie;

    return {
        winner: imposterCaught ? 'Crew' : 'Imposter',
        mostVoted: mostVotedPlayer,
        isTie,
        imposter
    };
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-50 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 h-screen">
        {phase === GamePhase.SETUP && (
            <GameSetup onStart={startGame} />
        )}

        {phase === GamePhase.LOADING && (
            <div className="flex flex-col items-center justify-center h-full space-y-6 animate-fade-in">
                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-200">Concocting Deception...</h2>
                    <p className="text-slate-400 mt-2">AI is generating a unique location and roles.</p>
                </div>
            </div>
        )}

        {phase === GamePhase.REVEAL && gameData && (
            <RoleReveal 
                players={players} 
                gameData={gameData} 
                onFinished={handleRevealFinished} 
            />
        )}

        {phase === GamePhase.PLAYING && gameData && settings && (
            <GameSession 
                gameData={gameData} 
                settings={settings} 
                onEndGame={handleVoteStart} 
            />
        )}

        {phase === GamePhase.VOTING && (
            <VotingSession 
                players={players} 
                onVotingComplete={handleVotingComplete} 
            />
        )}

        {phase === GamePhase.GAME_OVER && gameData && (
            <div className="flex flex-col h-full max-w-md mx-auto p-6 animate-fade-in overflow-y-auto custom-scrollbar">
                {(() => {
                    const { winner, mostVoted, isTie, imposter } = getGameResult();
                    const isCrewWin = winner === 'Crew';

                    return (
                        <div className="flex-1 flex flex-col items-center text-center space-y-8 min-h-0 pb-20">
                            {/* Header Result */}
                            <div className="space-y-4 shrink-0 mt-4">
                                <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isCrewWin ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    {isCrewWin ? <Trophy className="w-12 h-12 text-emerald-500" /> : <Skull className="w-12 h-12 text-red-500" />}
                                </div>
                                <div>
                                    <h1 className={`text-4xl font-bold ${isCrewWin ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {isCrewWin ? 'Crew Wins!' : 'Imposter Wins!'}
                                    </h1>
                                    <p className="text-slate-400 mt-2">
                                        {isTie 
                                            ? "Vote was tied! The Imposter escapes."
                                            : isCrewWin 
                                                ? "You found the imposter!" 
                                                : "You voted for the wrong person."}
                                    </p>
                                </div>
                            </div>

                            <div className="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shrink-0">
                                {/* Voting Result Box */}
                                <div className="mb-6 pb-6 border-b border-slate-700/50">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Majority Vote</h3>
                                    {mostVoted ? (
                                        <div className="flex items-center justify-center p-3 bg-slate-900 rounded-xl border border-slate-700">
                                            <span className="text-xl font-bold text-white mr-2">{mostVoted.name}</span>
                                            <span className="text-sm px-2 py-1 bg-slate-800 rounded text-slate-400">
                                                {voteResults?.[mostVoted.id] || 0} votes
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic">No votes cast</div>
                                    )}
                                </div>

                                {/* Reveal Truth */}
                                <div className="space-y-4">
                                     <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">The Truth</h3>
                                    
                                     {/* Location Reveal */}
                                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-indigo-500/30">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg mr-4">
                                                <MapPin className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-slate-500">Location</div>
                                                <div className="font-bold text-lg text-white">{gameData.location}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Imposter Reveal */}
                                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-red-500/30">
                                        <div className="flex items-center">
                                            <div className="p-2 bg-red-500/20 rounded-lg mr-4">
                                                <Fingerprint className="w-6 h-6 text-red-500" />
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs text-slate-500">Actual Imposter</div>
                                                <div className="font-bold text-lg text-white">{imposter?.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role List for discussion */}
                            <div className="w-full text-left mt-6">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 pl-1">Player Roles & Votes</h3>
                                <div className="space-y-3">
                                    {players.map(p => {
                                        const votes = voteResults?.[p.id] || 0;
                                        const isImposter = p.isImposter;
                                        return (
                                            <div key={p.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                                                isImposter 
                                                    ? 'bg-red-500/10 border-red-500/20' 
                                                    : 'bg-slate-800/50 border-slate-700'
                                            }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-full flex-shrink-0 ${isImposter ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                                                        {isImposter ? <Fingerprint className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className={`text-lg font-bold ${isImposter ? 'text-red-100' : 'text-slate-200'}`}>{p.name}</span>
                                                            {votes > 0 && (
                                                                <span className="text-xs font-bold px-2 py-0.5 bg-slate-700 rounded-full text-slate-300 border border-slate-600 whitespace-nowrap">
                                                                    {votes} vote{votes !== 1 ? 's' : ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`text-base font-medium ${isImposter ? 'text-red-400' : 'text-indigo-300'}`}>
                                                            {p.role}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="w-full pt-6 pb-6">
                                <button
                                    onClick={handleReset}
                                    className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    Play Again
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>
        )}
      </div>
    </div>
  );
};

export default App;