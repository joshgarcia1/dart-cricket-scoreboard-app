import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GameHistoryPage from '../../app/game-history';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock the router and navigation
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

describe('GameHistoryPage', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resumes an in-progress game when the resume button is pressed', async () => {
    // Mock data for an in-progress game
    const mockInProgressGames = [
      {
        gameName: 'Test Game',
        players: ['Player 1', 'Player 2'],
        date: '2023-05-20',
        time: '14:30',
        grid: [/* mock grid data */],
        history: [/* mock history data */],
      },
    ];

    // Mock AsyncStorage.getItem to return our mock data
    AsyncStorage.getItem.mockImplementation((key) => {
      if (key === 'inProgressGames') {
        return Promise.resolve(JSON.stringify(mockInProgressGames));
      }
      return Promise.resolve(null);
    });

    // Render the GameHistoryPage component
    const { getByText, findByText } = render(<GameHistoryPage />);

    // Find and press the 'Resume' button
    const resumeButton = await findByText('Resume');

    fireEvent.press(resumeButton);

    // Check if the router.push was called with the correct parameters
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/game-screen',
      params: {
        gameName: 'Test Game',
        players: JSON.stringify(['Player 1', 'Player 2']),
        grid: JSON.stringify([/* mock grid data */]),
        history: JSON.stringify([/* mock history data */]),
      },
    });

    // Verify that the game details are displayed correctly
    expect(getByText('Test Game')).toBeTruthy();
    expect(getByText('Players: Player 1, Player 2')).toBeTruthy();
    expect(getByText('2023-05-20 14:30')).toBeTruthy();
  });
});