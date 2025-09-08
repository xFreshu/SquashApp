import React, { useState } from 'react';
import type { Player } from './SquashApp'; // Import type from the main app

interface PlayerManagerProps {
  players: Player[];
  onAddPlayer: (name: string) => Promise<void>;
}

const PlayerManager: React.FC<PlayerManagerProps> = ({ players, onAddPlayer }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) {
      setError('Nazwa gracza nie może być pusta.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    try {
      await onAddPlayer(newPlayerName);
      setNewPlayerName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Zarządzaj Graczami</h2>
      
      <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          placeholder="Wpisz imię nowego gracza"
          className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button 
          type="submit"
          disabled={isSubmitting}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500"
        >
          {isSubmitting ? 'Dodawanie...' : 'Dodaj Gracza'}
        </button>
      </form>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Lista Graczy</h3>
        {players.length > 0 ? (
          <ul className="space-y-2">
            {players.map((player) => (
              <li key={player.id} className="bg-gray-700 px-4 py-2 rounded-md flex justify-between items-center">
                <span>{player.name}</span>
                <span className="text-xs text-gray-400">
                  Dołączył: {new Date(player.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-400">Brak dodanych graczy. Dodaj pierwszego!</p>
        )}
      </div>
    </div>
  );
};

export default PlayerManager;
