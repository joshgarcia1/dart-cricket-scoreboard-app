import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Home from '../../app/index.js';

// Mock TouchableOpacity component
const MockTouchableOpacity = ({ onPress, children }) => (
  <div onClick={onPress}>{children}</div>
);

// Mock Text component
const MockText = ({ children }) => <span>{children}</span>;

// Mock expo-router
jest.mock('expo-router', () => {
  const mockNavigate = jest.fn();
  return {
    // Mock Link component
    Link: ({ href, children, onPress }) => (
      <MockTouchableOpacity onPress={() => {
        if (onPress) onPress();
        mockNavigate(href);
      }}>
        <MockText>{children}</MockText>
      </MockTouchableOpacity>
    ),
    // Mock useNavigation hook
    useNavigation: () => ({
      setOptions: jest.fn(),
    }),
    __esModule: true,
    default: {
      mockNavigate,
    },
  };
});

// Mock react-native Image component
jest.mock('react-native/Libraries/Image/Image', () => 'Image');

describe('Home Component', () => {
  let mockNavigate;

  // Set up mockNavigate before each test
  beforeEach(() => {
    mockNavigate = jest.fn();
    jest.spyOn(require('expo-router').default, 'mockNavigate').mockImplementation(mockNavigate);
  });

  it('renders correctly with all elements', () => {
    const { getByTestId, getByText } = render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );

    // Check if dartboard image is rendered
    expect(getByTestId('dartboard-image')).toBeTruthy();
    // Check if all navigation buttons are rendered
    expect(getByText('Start Game')).toBeTruthy();
    expect(getByText('Game History')).toBeTruthy();
    expect(getByText('About')).toBeTruthy();
  });

  it('navigates to correct pages when buttons are pressed', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Home />
      </NavigationContainer>
    );
    // Test navigation to Game Setup page
    fireEvent.press(getByText('Start Game'));
    expect(mockNavigate).toHaveBeenCalledWith('/game-setup');
    
    // Test navigation to Game History page
    fireEvent.press(getByText('Game History'));
    expect(mockNavigate).toHaveBeenCalledWith('/game-history');

    // Test navigation to About page
    fireEvent.press(getByText('About'));
    expect(mockNavigate).toHaveBeenCalledWith('/about');
  });
});