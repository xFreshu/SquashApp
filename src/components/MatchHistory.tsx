import React, { useState } from 'react';
import type { Match } from './SquashApp';

interface MatchHistoryProps {
  matches: Match[];
  onClearHistory: () => void;
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ matches, onClearHistory }) => {
  const [error, setError] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleClearHistory = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć całą historię meczów? Tej operacji nie można cofnąć.')) {
      return;
    }

    setIsClearing(true);
    setError('');

    try {
      const response = await fetch('/api/matches', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Nie udało się wyczyścić historii.');
      }
      onClearHistory(); // Refresh the data in the parent component
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex justify-center items-center mb-4 relative">
        <h2 className="text-2xl font-bold text-center">Historia Meczów</h2>
        {matches.length > 0 && (
          <button
            onClick={handleClearHistory}
            disabled={isClearing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-red-800 absolute right-0"
          >
            {isClearing ? 'Czyszczenie...' : 'Wyczyść historię'}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
