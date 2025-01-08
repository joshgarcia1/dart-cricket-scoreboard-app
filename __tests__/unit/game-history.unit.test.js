import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import GameHistoryPage from '../../app/game-history.js';

// Mock the expo-router module
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

// Mock the AsyncStorage module
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock the Alert.alert method to automatically trigger the 'Delete' action
jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
  buttons.find(button => button.text === 'Delete').onPress();
});

describe('GameHistoryPage', () => {
  // Mock data for in-progress and completed games
  const mockInProgressGames = [
    { gameName: 'Game 1', players: ['Player 1', 'Player 2'], date: '2023-05-01', time: '14:00' },
  ];
  const mockCompletedGames = [
    { gameName: 'Game 2', players: ['Player 3', 'Player 4'], date: '2023-05-02', time: '15:00', winner: 'Player 3' },
  ];

  // Set up mock implementation for AsyncStorage.getItem before each test
  beforeEach(() => {
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'inProgressGames') return Promise.resolve(JSON.stringify(mockInProgressGames));
      if (key === 'completedGames') return Promise.resolve(JSON.stringify(mockCompletedGames));
      return Promise.resolve(null);
    });
  });

  it('displays in-progress and completed games', async () => {
    const { getByText } = render(<GameHistoryPage />);

    // Check for game information
    await waitFor(() => {
      expect(getByText('Game 1')).toBeTruthy();
      expect(getByText('Players: Player 1, Player 2')).toBeTruthy();
      expect(getByText('Game 2')).toBeTruthy();
      expect(getByText('Players: Player 3, Player 4')).toBeTruthy();
      expect(getByText('Winner: Player 3')).toBeTruthy();
    });
  });

  it('deletes a game from the in-progress section', async () => {
    const { getByText, queryByText, getAllByText } = render(<GameHistoryPage />);

    await waitFor(() => {
      expect(getByText('Game 1')).toBeTruthy();
    });

    const deleteButtons = getAllByText('Delete');
    fireEvent.press(deleteButtons[0]);

    // Check if the Alert.alert was called with correct parameters
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Game',
        'Are you sure you want to delete this game?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Delete' }),
          expect.objectContaining({ text: 'Cancel' })
        ])
      );
    });

    // Check if the game was removed from the UI
    await waitFor(() => {
      expect(queryByText('Game 1')).toBeNull();
    });

    // Check if AsyncStorage.setItem was called to update the in-progress games
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('inProgressGames', '[]');
  });

  it('deletes a game from the completed section', async () => {
    const { getByText, queryByText, getAllByText } = render(<GameHistoryPage />);

    await waitFor(() => {
      expect(getByText('Game 2')).toBeTruthy();
    });

    const deleteButtons = getAllByText('Delete');
    fireEvent.press(deleteButtons[1]);

    // Check if the Alert.alert was called with correct parameters
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Delete Game',
        'Are you sure you want to delete this game?',
        expect.arrayContaining([
          expect.objectContaining({ text: 'Delete' }),
          expect.objectContaining({ text: 'Cancel' })
        ])
      );
    });

    // Check if the game was removed from the UI
    await waitFor(() => {
      expect(queryByText('Game 2')).toBeNull();
    });

    // Check if AsyncStorage.setItem was called to update the completed games
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('completedGames', '[]');
  });
});