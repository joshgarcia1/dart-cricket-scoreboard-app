import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import WinnerPopupPage from '../../app/winner-popup.js';

// Create a mock function for the navigation reset
const mockReset = jest.fn();

// Mock the expo-router module
jest.mock('expo-router', () => ({
  // Mock useLocalSearchParams to return test data
  useLocalSearchParams: () => ({
    playerName: 'Test Player',
    date: '2023-05-20',
  }),
  // Mock useNavigation to return mock functions
  useNavigation: () => ({
    setOptions: jest.fn(),
    reset: mockReset,
  }),
}));

// Mock the Image component from react-native
jest.mock('react-native/Libraries/Image/Image', () => 'Image');

describe('WinnerPopupPage', () => {
  // Clear mock function before each test
  beforeEach(() => {
    mockReset.mockClear();
  });

  it('renders correctly', () => {
    const { getByText } = render(<WinnerPopupPage />);
    
    // Check if all expected text elements are present
    expect(getByText('WINNER!')).toBeTruthy();
    expect(getByText('Player: Test Player')).toBeTruthy();
    expect(getByText('Date: 2023-05-20')).toBeTruthy();
    expect(getByText('Main Menu')).toBeTruthy();
    expect(getByText('New Game')).toBeTruthy();
  });

  it('navigates to home screen when Main Menu button is pressed', () => {
    const { getByText } = render(<WinnerPopupPage />);
    const mainMenuButton = getByText('Main Menu');
    
    // Simulate button press
    fireEvent.press(mainMenuButton);

    // Check if navigation reset was called with correct parameters
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'index' }],
    });
  });

  it('navigates to game setup screen when New Game button is pressed', () => {
    const { getByText } = render(<WinnerPopupPage />);
    const newGameButton = getByText('New Game');
    
    // Simulate button press
    fireEvent.press(newGameButton);

    // Check if navigation reset was called with correct parameters
    expect(mockReset).toHaveBeenCalledWith({
      index: 0,
      routes: [{ name: 'game-setup' }],
    });
  });
});