import React from 'react';
import type { Match } from './SquashApp'; // Import type from the main app

interface MatchHistoryProps {
  matches: Match[];
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches }) => {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Historia Meczów</h2>
      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center">
              <div className="flex-1 mb-2 sm:mb-0">
                <span 
                  className={`font-bold ${match.winner.id === match.playerOne.id ? 'text-yellow-400' : ''}`}
                >
                  {match.playerOne.name}
                </span>
                <span className="mx-2">vs</span>
                <span 
                  className={`font-bold ${match.winner.id === match.playerTwo.id ? 'text-yellow-400' : ''}`}
                >
                  {match.playerTwo.name}
                </span>
              </div>
              <div className="font-mono text-lg mx-4">
                {match.playerOneScore} - {match.playerTwoScore}
              </div>
              <div className="text-xs text-gray-400">
                {new Date(match.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">Brak rozegranych meczów.</p>
      )}
    </div>
  );
};

export default MatchHistory;
