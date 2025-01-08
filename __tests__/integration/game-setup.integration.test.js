import React from 'react';
import { act, waitFor } from '@testing-library/react-native';
import { render, fireEvent } from '@testing-library/react-native';
import GameSetupPage from '../../app/game-setup.js';

// Mock navigation functions
const mockPush = jest.fn();
const mockReset = jest.fn();

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useNavigation: () => ({
    reset: mockReset,
    setOptions: jest.fn(),
  }),
  Link: ({ children }) => children,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

describe('GameSetup Component', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('navigates to GameScreen with correct data when "Start Game" is pressed', async () => {
    // Render the GameSetupPage component
    const { getByDisplayValue, getByText, queryByText } = render(<GameSetupPage />);
    
    // Wait for the loading state to disappear
    await waitFor(() => {
      const loadingText = queryByText('Loading...');
      if (loadingText) {
        throw new Error('Still loading');
      }
    }, { timeout: 5000 }).catch(() => {
      console.warn('Loading state did not disappear within 5 seconds');
    });
    
    // Simulate user input
    await act(async () => {
      fireEvent.changeText(getByDisplayValue('New Game'), 'Epic Dart Game');
      fireEvent.changeText(getByDisplayValue('Player 1'), 'Alice');
      fireEvent.changeText(getByDisplayValue('Player 2'), 'Bob');
    });
    
    // Simulate pressing the Start Game button
    await act(async () => {
      fireEvent.press(getByText('Start Game'));
    });
    
    // Assert that navigation occurred with correct parameters
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/game-screen',
      params: expect.objectContaining({
        gameName: 'Epic Dart Game',
        players: JSON.stringify(['Alice', 'Bob']),
        grid: expect.any(String),
        history: JSON.stringify([]),
      }),
    });
  });

  test('navigates back to Home when "Back to Main Menu" is pressed', async () => {
    // Render the GameSetupPage component
    const { getByText, queryByText } = render(<GameSetupPage />);

    // Wait for the loading state to disappear
    await waitFor(() => {
      const loadingText = queryByText('Loading...');
      if (loadingText) {
        throw new Error('Still loading');
      }
    }, { timeout: 5000 }).catch(() => {
      console.warn('Loading state did not disappear within 5 seconds');
    });

    // Simulate pressing the Back to Main Menu button
    await act(async () => {
      fireEvent.press(getByText('Back to Main Menu'));
    });

    // Assert that navigation reset occurred correctly
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'index' }],
    });
  });
});