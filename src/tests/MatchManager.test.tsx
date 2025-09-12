import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MatchManager from '../components/MatchManager';
import type { Player } from '../components/SquashApp';

// Mock data for tests
const mockPlayers: Player[] = [
  { id: 1, name: 'Tester 1', createdAt: new Date().toISOString() },
  { id: 2, name: 'Tester 2', createdAt: new Date().toISOString() },
  { id: 3, name: 'Tester 3', createdAt: new Date().toISOString() },
];

// Mock the fetch API
global.fetch = vi.fn();

describe('Component: MatchManager', () => {
  let onMatchFinishMock: () => void;

  beforeEach(() => {
    onMatchFinishMock = vi.fn();
    // Reset mocks before each test
    (fetch as ReturnType<typeof vi.fn>).mockClear();
  });

  it('should render the setup screen correctly', () => {
    render(<MatchManager players={mockPlayers} onMatchFinish={onMatchFinishMock} />);
    expect(screen.getByText('Nowy Mecz')).toBeInTheDocument();
    expect(screen.getByText('Wybierz Gracza 1')).toBeInTheDocument();
    expect(screen.getByText('Wybierz Gracza 2')).toBeInTheDocument();
  });

  it('should start a match and show the scoreboard', () => {
    render(<MatchManager players={mockPlayers} onMatchFinish={onMatchFinishMock} />);

    // Select players
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '2' } });

    // Start match
    fireEvent.click(screen.getByText('Rozpocznij Mecz'));

    // Check for scoreboard elements - expect two "0" scores
    expect(screen.getByText('Tester 1')).toBeInTheDocument();
    expect(screen.getByText('Tester 2')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2); // Initial scores
  });

  it('should increment score when a point button is clicked', () => {
    render(<MatchManager players={mockPlayers} onMatchFinish={onMatchFinishMock} />);

    // Start a match
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '2' } });
    fireEvent.click(screen.getByText('Rozpocznij Mecz'));

    // Click the point button for player 1
    const pointButtons = screen.getAllByText('+1 Punkt');
    fireEvent.click(pointButtons[0]);

    // The score should now be 1
    const scores = screen.getAllByText('1');
    expect(scores.length).toBeGreaterThan(0);
  });

  it('should finish the match and call onMatchFinish when a player wins', async () => {
    // Mock a successful fetch response
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true });

    render(<MatchManager players={mockPlayers} onMatchFinish={onMatchFinishMock} />);

    // Start a match
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: '1' } });
    fireEvent.change(screen.getAllByRole('combobox')[1], { target: { value: '2' } });
    fireEvent.click(screen.getByText('Rozpocznij Mecz'));

    // Simulate a game where player 1 wins 11-0
    const player1PointButton = screen.getAllByText('+1 Punkt')[0];
    for (let i = 0; i < 11; i++) {
      fireEvent.click(player1PointButton);
    }

    // Check for the end-of-match message
    expect(screen.getByText(/Koniec Meczu! Wygrał Tester 1!/)).toBeInTheDocument();

    // Click the save button
    const saveButton = screen.getByText('Zapisz i zakończ');
    await act(async () => {
        fireEvent.click(saveButton);
    });

    // Check that fetch was called to save the match
    expect(fetch).toHaveBeenCalledWith('/api/matches', expect.any(Object));
    // Check that the parent callback was triggered to refresh the UI
    expect(onMatchFinishMock).toHaveBeenCalled();
  });
});
