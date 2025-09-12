import React from 'react';
import type { Match } from './SquashApp';

interface MatchHistoryProps {
  matches: Match[];
  onClearHistory: () => void;
  selectedDate: string | undefined;
  onDateChange: (direction: 'prev' | 'next') => void;
  canGoPrev: boolean;
  canGoNext: boolean;
}

// Helper to format the date string for the header
const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Brak Meczów";
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const date = new Date(dateStr);
    // Adjust for timezone offset to compare dates correctly
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    
    if (date.toDateString() === today.toDateString()) return "Dzisiaj";
    if (date.toDateString() === yesterday.toDateString()) return "Wczoraj";
    
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Helper to format seconds into MM:SS
const formatDuration = (seconds: number) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const MatchHistory: React.FC<MatchHistoryProps> = ({
  matches,
  onClearHistory,
  selectedDate,
  onDateChange,
  canGoPrev,
  canGoNext,
}) => {

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Historia Meczów</h2>
        {matches.length > 0 && (
          <button
            onClick={onClearHistory}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-red-800"
          >
            Wyczyść Całą Historię
          </button>
        )}
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => onDateChange('next')} disabled={!canGoNext} className="px-4 py-2 bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">&larr; Nowsze</button>
        <h3 className="text-xl font-semibold text-center text-teal-400 w-64">{formatDate(selectedDate)}</h3>
        <button onClick={() => onDateChange('prev')} disabled={!canGoPrev} className="px-4 py-2 bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Starsze &rarr;</button>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-gray-700 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <span className={`font-bold ${match.winner.id === match.playerOne.id ? 'text-yellow-400' : ''}`}>
                  {match.playerOne?.name || 'Brak gracza'}
                </span>
                <span className="mx-2 text-gray-400">vs</span>
                <span className={`font-bold ${match.winner.id === match.playerTwo.id ? 'text-yellow-400' : ''}`}>
                  {match.playerTwo?.name || 'Brak gracza'}
                </span>
              </div>
              <div className="font-mono text-2xl font-bold text-white">
                {match.playerOneScore} - {match.playerTwoScore}
              </div>
              <div className="text-sm text-gray-400 text-center sm:text-right">
                <div>{new Date(match.createdAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}</div>
                <div className="text-xs">{formatDuration(match.durationInSeconds)}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-8">Brak meczy w wybranym dniu.</p>
      )}
    </div>
  );
};

export default MatchHistory;