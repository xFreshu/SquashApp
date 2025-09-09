import React, { useState, useEffect, useCallback } from 'react';

interface Player {
  id: number;
  name: string;
}

interface MatchManagerProps {
  players: Player[];
  onMatchFinish: () => void;
}

const MatchManager: React.FC<MatchManagerProps> = ({ players, onMatchFinish }) => {
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [error, setError] = useState('');
  
  const [matchState, setMatchState] = useState<'setup' | 'playing' | 'finished'>('setup');
  
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const player1 = players.find(p => p.id === parseInt(player1Id));
  const player2 = players.find(p => p.id === parseInt(player2Id));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartMatch = () => {
    if (!player1Id || !player2Id) {
      setError('Wybierz obu graczy.');
      return;
    }
    if (player1Id === player2Id) {
      setError('Gracze muszą być różni.');
      return;
    }
    setError('');
    setMatchState('playing');
    setIsTimerRunning(true);
  };

  const checkWinner = useCallback((s1: number, s2: number) => {
    const winCondition = (s1 >= 11 && s1 >= s2 + 2) || (s2 >= 11 && s2 >= s1 + 2);
    if (winCondition) {
      setIsTimerRunning(false);
      setMatchState('finished');
    }
  }, []);

  const handleScore = (player: 1 | 2) => {
    if (matchState !== 'playing') return;
    
    let newScore1 = score1;
    let newScore2 = score2;

    if (player === 1) {
      newScore1 = score1 + 1;
      setScore1(newScore1);
    } else {
      newScore2 = score2 + 1;
      setScore2(newScore2);
    }
    checkWinner(newScore1, newScore2);
  };

  const handleFinishMatch = async () => {
    if (!player1 || !player2) return;

    const winnerId = score1 > score2 ? player1.id : player2.id;

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerOneId: player1.id,
          playerTwoId: player2.id,
          playerOneScore: score1,
          playerTwoScore: score2,
          winnerId: winnerId,
          durationInSeconds: timer,
        }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zapisać meczu.');
      }
      
      // Reset state for a new match
      setMatchState('setup');
      setPlayer1Id('');
      setPlayer2Id('');
      setScore1(0);
      setScore2(0);
      setTimer(0);
      onMatchFinish(); // Notify parent to refresh history
      
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handlePlayer1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlayer1Id = e.target.value;
    if (newPlayer1Id === player2Id) {
      setPlayer2Id(''); // Reset player 2 if the same is selected
    }
    setPlayer1Id(newPlayer1Id);
  };

  if (matchState === 'setup') {
    return (
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Nowy Mecz</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <select value={player1Id} onChange={handlePlayer1Change} className="bg-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Wybierz Gracza 1</option>
            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)} className="bg-gray-700 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={!player1Id}>
            <option value="">Wybierz Gracza 2</option>
            {players
              .filter(p => p.id !== parseInt(player1Id))
              .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button onClick={handleStartMatch} className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-md transition duration-300 text-lg">
          Rozpocznij Mecz
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      <div className="text-center mb-4">
        <p className="text-5xl font-mono">{formatTime(timer)}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 text-center">
        {/* Player 1 */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-2xl font-bold truncate">{player1?.name}</h3>
          <p className="text-8xl font-bold my-4">{score1}</p>
          <button onClick={() => handleScore(1)} disabled={matchState === 'finished'} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md disabled:bg-gray-600">
            +1 Punkt
          </button>
        </div>
        {/* Player 2 */}
        <div className="bg-gray-700 p-6 rounded-lg">
          <h3 className="text-2xl font-bold truncate">{player2?.name}</h3>
          <p className="text-8xl font-bold my-4">{score2}</p>
          <button onClick={() => handleScore(2)} disabled={matchState === 'finished'} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md disabled:bg-gray-600">
            +1 Punkt
          </button>
        </div>
      </div>
      {matchState === 'finished' && (
        <div className="text-center mt-6">
          <p className="text-2xl font-bold text-yellow-400">Koniec Meczu! Wygrał {score1 > score2 ? player1?.name : player2?.name}!</p>
          <button onClick={handleFinishMatch} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md">
            Zapisz i zakończ
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchManager;
