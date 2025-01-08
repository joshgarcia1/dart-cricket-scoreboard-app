import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import GameScreenPage from '../../app/game-screen.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the push function for navigation
const mockPush = jest.fn();

// Mock the expo-router module
jest.mock('expo-router', () => ({
  // Mock useRouter hook
  useRouter: () => ({
    push: mockPush,
  }),
  // Mock useLocalSearchParams hook with test data
  useLocalSearchParams: () => ({
    gameName: 'Test Game',
    players: JSON.stringify(['Player 1', 'Player 2']),
    // Create a 7x3 grid with all cells initialized to 0 taps
    grid: JSON.stringify([
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
      [{ taps: 0 }, { taps: 0 }, { taps: 0 }],
    ]),
    history: JSON.stringify([]),
  }),
  // Mock useNavigation hook
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
  // Mock useFocusEffect hook
  useFocusEffect: jest.fn((callback) => callback()),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('GameScreenPage Integration Tests', () => {
  test('declares winner and navigates to winner popup page when player completes all cells', async () => {
    // Render the GameScreenPage component within a NavigationContainer
    const { getByTestId } = render(
      <NavigationContainer>
        <GameScreenPage />
      </NavigationContainer>
    );

    // Simulate tapping each cell in the first column three times
    for (let i = 0; i < 7; i++) {
      const cell = getByTestId(`cell-${i}-0`);
      fireEvent.press(cell);
      fireEvent.press(cell);
      fireEvent.press(cell);
    }

    // Wait for and assert the navigation to the winner popup
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/winner-popup',
        params: {
          playerName: 'Player 1',
          date: expect.any(String),
        }
      });
    });
  });
});