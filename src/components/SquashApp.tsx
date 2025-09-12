import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PlayerManager from './PlayerManager';
import MatchManager from './MatchManager';
import MatchHistory from './MatchHistory';

// Types
export interface Player {
  id: number;
  name: string;
  createdAt: string;
}

export interface Match {
  id: number;
  createdAt: string;
  playerOne: Player;
  playerTwo: Player;
  playerOneScore: number;
  playerTwoScore: number;
  winner: Player;
  durationInSeconds: number;
}

// Helper to get date string in YYYY-MM-DD format
const toDateString = (date: Date) => date.toISOString().split('T')[0];

const SquashApp = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [playersRes, matchesRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches'),
      ]);
      if (!playersRes.ok || !matchesRes.ok) {
        throw new Error('Nie udało się załadować danych.');
      }
      const playersData = await playersRes.json();
      const matchesData = await matchesRes.json();
      setPlayers(playersData);
      setAllMatches(matchesData);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddPlayer = async (name: string) => {
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Nie udało się dodać gracza.');
      }
      fetchData();
    } catch (err: any) {
      throw err;
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Czy na pewno chcesz usunąć całą historię meczów? Tej operacji nie można cofnąć.')) {
      return;
    }
    try {
        await fetch('/api/matches', { method: 'DELETE' });
        fetchData();
    } catch (err: any) {
        setError('Nie udało się wyczyścić historii.');
    }
  };

  // Group matches by date for efficient lookup
  const groupedMatches = useMemo(() => {
    return allMatches.reduce((acc, match) => {
      const date = toDateString(new Date(match.createdAt));
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(match);
      return acc;
    }, {} as Record<string, Match[]>);
  }, [allMatches]);

  // Get a sorted list of dates that have matches
  const sortedMatchDates = useMemo(() => Object.keys(groupedMatches).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [groupedMatches]);

  const [dateIndex, setDateIndex] = useState(0);

  // Effect to reset index to today or the latest day when matches change
  useEffect(() => {
    const todayStr = toDateString(new Date());
    const todayIndex = sortedMatchDates.findIndex(d => d === todayStr);
    setDateIndex(todayIndex !== -1 ? todayIndex : 0);
  }, [sortedMatchDates]);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? dateIndex + 1 : dateIndex - 1;
    if (newIndex >= 0 && newIndex < sortedMatchDates.length) {
      setDateIndex(newIndex);
    }
  };

  const selectedDateStr = sortedMatchDates[dateIndex];
  const matchesForSelectedDay = groupedMatches[selectedDateStr] || [];

  if (loading) {
    return <div className="text-center p-10">Ładowanie aplikacji...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-12">
      <PlayerManager players={players} onAddPlayer={handleAddPlayer} />
      <MatchManager players={players} onMatchFinish={fetchData} />
      <MatchHistory
        matches={matchesForSelectedDay}
        onClearHistory={handleClearHistory}
        selectedDate={selectedDateStr}
        onDateChange={handleDateChange}
        canGoPrev={dateIndex < sortedMatchDates.length - 1}
        canGoNext={dateIndex > 0}
      />
    </div>
  );
};

export default SquashApp;
