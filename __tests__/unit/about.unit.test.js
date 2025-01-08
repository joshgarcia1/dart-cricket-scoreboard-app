import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AboutPage from '../../app/about.js';

// Mock the expo-router module
jest.mock('expo-router', () => ({
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

// Mock the Linking module from react-native
jest.mock('react-native/Libraries/Linking/Linking', () => ({
  openURL: jest.fn(() => Promise.resolve()),
}));

// Mock the Alert module from react-native
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock the Share module from react-native
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
}));

// Mock the Platform module from react-native
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

describe('AboutPage', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    // Check if the component renders correctly
    const { getByText } = render(<AboutPage />);
    expect(getByText('Contact Support')).toBeTruthy();
    expect(getByText('Rate')).toBeTruthy();
    expect(getByText('Share')).toBeTruthy();
  });

  it('opens email client when Contact Support is pressed', async () => {
    const { getByText } = render(<AboutPage />);
    // Check if pressing 'Contact Support' opens the email client
    await fireEvent.press(getByText('Contact Support'));

    const Linking = require('react-native/Libraries/Linking/Linking');
    // Checks if support email is loaded
    expect(Linking.openURL).toHaveBeenCalledWith(
      'mailto:jgdevelopmentsupport@protonmail.com?subject=Support%20Request&body=Please%20describe%20your%20issue%20or%20feedback%20here.'
    );
  });

  it('opens App Store for rating when Rate is pressed on iOS', async () => {
    const { getByText } = render(<AboutPage />);
    // Check if pressing 'Rate' opens the App Store on iOS
    await fireEvent.press(getByText('Rate'));

    const Linking = require('react-native/Libraries/Linking/Linking');

    // Checks if Expo Go app store page is loaded
    expect(Linking.openURL).toHaveBeenCalledWith(
      'https://apps.apple.com/us/app/expo-go/id982107779'
    );
  });

  it('opens share dialog when Share is pressed', async () => {
    const { getByText } = render(<AboutPage />);
    // Check if pressing 'Share' opens the share dialog
    await fireEvent.press(getByText('Share'));

    const Share = require('react-native/Libraries/Share/Share');
    // Checks for share prompt and default message
    expect(Share.share).toHaveBeenCalledWith({
      message: 'Dart Cricket Scoreboard: Check out this interactive dart cricket scoreboard mobile app! Download it here: http://example.com/DartCricketScoreboard',
    });
  });
});