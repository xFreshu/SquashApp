import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PlayerManager from '../components/PlayerManager';
import type { Player } from '../components/SquashApp';

// Mock data for tests
const mockPlayers: Player[] = [
  { id: 1, name: 'Player A', createdAt: new Date().toISOString() },
  { id: 2, name: 'Player B', createdAt: new Date().toISOString() },
];

describe('Component: PlayerManager', () => {
  it('should render the list of players passed as props', () => {
    render(<PlayerManager players={mockPlayers} onAddPlayer={async () => {}} />);

    // Check if player names are in the document
    expect(screen.getByText('Player A')).toBeInTheDocument();
    expect(screen.getByText('Player B')).toBeInTheDocument();
  });

  it('should show a message when no players are provided', () => {
    render(<PlayerManager players={[]} onAddPlayer={async () => {}} />);

    expect(screen.getByText('Brak dodanych graczy. Dodaj pierwszego!')).toBeInTheDocument();
  });

  it('should call the onAddPlayer function with the new player name when the form is submitted', async () => {
    const handleAddPlayerMock = vi.fn();
    render(<PlayerManager players={[]} onAddPlayer={handleAddPlayerMock} />);

    const input = screen.getByPlaceholderText('Wpisz imię nowego gracza');
    const button = screen.getByText('Dodaj Gracza');

    // Simulate user typing a name
    fireEvent.change(input, { target: { value: 'New Player' } });
    
    // Simulate form submission and wait for state updates
    await act(async () => {
      fireEvent.click(button);
    });

    // Check if the mock function was called with the correct value
    expect(handleAddPlayerMock).toHaveBeenCalledWith('New Player');
  });

  it('should not call onAddPlayer if the input is empty', () => {
    const handleAddPlayerMock = vi.fn();
    render(<PlayerManager players={[]} onAddPlayer={handleAddPlayerMock} />);

    const button = screen.getByText('Dodaj Gracza');
    fireEvent.click(button);

    // Expect the function not to have been called
    expect(handleAddPlayerMock).not.toHaveBeenCalled();
    // Expect an error message to be shown
    expect(screen.getByText('Nazwa gracza nie może być pusta.')).toBeInTheDocument();
  });
});
