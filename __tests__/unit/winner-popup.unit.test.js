import React from 'react';
import { render } from '@testing-library/react-native';
import WinnerPopupPage from '../../app/winner-popup.js';

// Mock the expo-router module
jest.mock('expo-router', () => ({
  // Mock useLocalSearchParams as a function that can be customized in tests
  useLocalSearchParams: jest.fn(),
  // Mock useNavigation to return an object with mocked methods
  useNavigation: () => ({
    setOptions: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('WinnerPopupPage', () => {
  it('displays the correct player name and date', () => {
    // Get the mocked useLocalSearchParams function
    const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
    // Set up mock return values for useLocalSearchParams
    mockUseLocalSearchParams.mockReturnValue({
      playerName: 'Test Player',
      date: '2023-07-01',
    });

    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage />);
    // Assert that the player name is correctly displayed
    expect(getByText('Player: Test Player')).toBeTruthy();
    // Assert that the date is correctly displayed
    expect(getByText('Date: 2023-07-01')).toBeTruthy();
  });

  it('displays the "WINNER!" text', () => {
    // Render the WinnerPopupPage component
    const { getByText } = render(<WinnerPopupPage />);
    // Assert that the "WINNER!" text is present in the rendered component
    expect(getByText('WINNER!')).toBeTruthy();
  });
});