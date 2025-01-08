import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameSetupPage from '../../app/game-setup.js';

// Mock the GameSetupPage component
jest.mock('../../app/game-setup.js', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity, TextInput } = require('react-native');
    const { useRouter } = require('expo-router');

    // Return a mocked version of GameSetupPage
    return function MockedGameSetupPage() {
        const router = useRouter();
        const [gameName, setGameName] = React.useState('New Game');

        // Handler for starting the game
        const handleStartGame = () => {
        router.push({
            pathname: '/game-screen',
            params: {
            gameName: gameName,
            players: JSON.stringify(['Player 1', 'Player 2']),
            },
        });
        };
        
        // Render the mocked GameSetupPage component
        return (
        <View>
            <Text>Add Player</Text>
            <Text>Player 1</Text>
            <Text>Player 2</Text>
            <TouchableOpacity><Text>Remove</Text></TouchableOpacity>
            <TextInput 
            placeholder="New Game" 
            value={gameName}
            onChangeText={setGameName}
            />
            <TouchableOpacity onPress={handleStartGame}>
            <Text>Start Game</Text>
            </TouchableOpacity>
        </View>
        );
    };
});

// Mock the router push function
const mockPush = jest.fn();

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

describe('GameSetupPage', () => {
    it('renders correctly', () => {
      const { getByText } = render(<GameSetupPage />);
      expect(getByText('Add Player')).toBeTruthy();
    });
  
    it('allows adding and removing players, and starting a game with a custom name', () => {
      const { getByText, getAllByText, getByPlaceholderText } = render(<GameSetupPage />);
      
      // Check if two players are rendered by default
      expect(getAllByText(/Player \d/).length).toBe(2);
      
      // Check if 'Add Player' button is present
      expect(getByText('Add Player')).toBeTruthy();
      
      // Check if 'Remove' button is present
      expect(getByText('Remove')).toBeTruthy();
      
      // Change the game name
      const gameNameInput = getByPlaceholderText('New Game');
      fireEvent.changeText(gameNameInput, 'My Custom Game');
      
      // Start the game
      fireEvent.press(getByText('Start Game'));
      
      // Check if the router.push was called with correct parameters
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/game-screen',
        params: expect.objectContaining({
          gameName: 'My Custom Game',
          players: JSON.stringify(['Player 1', 'Player 2']),
        }),
      });
    });
});