import React, { useState, useEffect, useCallback } from 'react';
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
}

const SquashApp = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      // setLoading(true); // Don't show main loading indicator on refresh
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
      setMatches(matchesData);
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
      fetchData(); // Refresh all data
    } catch (err: any) {
      // The component will display this error
      throw err;
    }
  };

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
      <MatchHistory matches={matches} onClearHistory={fetchData} />
    </div>
  );
};

export default SquashApp;