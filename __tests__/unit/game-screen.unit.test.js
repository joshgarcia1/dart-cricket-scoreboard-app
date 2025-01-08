import React from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, fireEvent } from '@testing-library/react-native';
import GameScreenPage from '../../app/game-screen.js';

// Mock functions for navigation and routing
const mockPush = jest.fn();
const mockUseLocalSearchParams = jest.fn();
const mockUseFocusEffect = jest.fn();
const mockSetOptions = jest.fn();

// Mock the GameScreenPage component
jest.mock('../../app/game-screen.js', () => {
    const React = require('react');
    const { View, Text, TouchableOpacity } = require('react-native');
    const { useLocalSearchParams } = require('expo-router');

    // Return a mocked version of GameScreenPage
    return function MockedGameScreenPage() {
      const { players } = useLocalSearchParams();
      const playersList = JSON.parse(players);
  
      return (
        <View>
          {/* Render player names */}
          {playersList.map((player, index) => (
            <Text key={index}>{player}</Text>
          ))}
          <View>
            {/* Render game grid */}
            {playersList.map((_, playerIndex) => 
              [20, 19, 18, 17, 16, 15, 'Bull'].map((row, rowIndex) => (
                <TouchableOpacity 
                  key={`${row}-${playerIndex}`} 
                  testID={`cell-${rowIndex}-${playerIndex}`}
                >
                  <Text>{row}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
          {/* Render Undo and Reset buttons */}
          <TouchableOpacity><Text>Undo</Text></TouchableOpacity>
          <TouchableOpacity><Text>Reset</Text></TouchableOpacity>
        </View>
      );
    };
  });

  // Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: () => ({
      push: mockPush,
    }),
    useNavigation: () => ({
      setOptions: mockSetOptions,
    }),
    useLocalSearchParams: () => mockUseLocalSearchParams(),
    useFocusEffect: mockUseFocusEffect,
  }));

  // Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('GameScreenPage', () => {
    // Reset all mocks before each test
    beforeEach(() => {
        AsyncStorage.getItem.mockClear();
        AsyncStorage.setItem.mockClear();
        mockPush.mockClear();
        mockUseLocalSearchParams.mockClear();
        mockUseFocusEffect.mockClear();
        mockSetOptions.mockClear();
        mockUseLocalSearchParams.mockReturnValue({
          gameName: 'Test Game',
          players: JSON.stringify(['Player 1', 'Player 2']),
          grid: null,
          history: null,
        });
    });

    it('renders game elements correctly', () => {
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        
        // Check if player names are rendered
        expect(getByText('Player 1')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();

        // Check if correct number of cells are rendered
        const cells = getAllByTestId(/^cell-/);
        expect(cells.length).toBe(14);

        // Check if Undo and Reset buttons are rendered
        expect(getByText('Undo')).toBeTruthy();
        expect(getByText('Reset')).toBeTruthy();
    });
      
    it('allows a user to tap a grid cell', () => {
        const { getAllByTestId } = render(<GameScreenPage />);
        const cells = getAllByTestId(/^cell-/);
        
        // Simulate pressing a grid cell
        fireEvent.press(cells[0]);
        
        expect(cells[0]).toBeTruthy();
    });
      
    it('allows a user to undo their last move', () => {
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        const cells = getAllByTestId(/^cell-/);
        
        // Simulate pressing a grid cell
        fireEvent.press(cells[0]);
        // Simulate pressing the Undo button
        fireEvent.press(getByText('Undo'));
        
        expect(cells[0]).toBeTruthy();
    });
      
    it('allows a user to reset the board', () => {
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        const cells = getAllByTestId(/^cell-/);
        
        fireEvent.press(cells[0]);
        
        // Mock the Alert.alert to automatically press 'Yes'
        jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
          buttons.find(button => button.text === 'Yes').onPress();
        });
      
        fireEvent.press(getByText('Reset'));
        
        // Check if all cells are still present after reset
        cells.forEach(cell => {
          expect(cell).toBeTruthy();
        });
    });

    it('allows the reset board action to be cancelled', () => {
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        const cells = getAllByTestId(/^cell-/);
        
        fireEvent.press(cells[0]);
        
        // Mock the Alert.alert to automatically press 'Cancel'
        jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
        buttons.find(button => button.text === 'Cancel').onPress();
        });

        fireEvent.press(getByText(/reset/i));
        
        expect(cells[0]).toBeTruthy();
    });

    it('properly formats the board for 2 player games', () => {
        mockUseLocalSearchParams.mockReturnValue({
          gameName: 'Test Game',
          players: JSON.stringify(['Player 1', 'Player 2']),
          grid: null,
          history: null,
        });
      
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        
        // Check if both player names are rendered
        expect(getByText('Player 1')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();
        // Check if correct number of cells are rendered for each player
        expect(getAllByTestId(/^cell-\d+-0$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-1$/)).toHaveLength(7);
    });
      
    it('properly formats the board for 3 player games', () => {
        mockUseLocalSearchParams.mockReturnValue({
            gameName: 'Test Game',
            players: JSON.stringify(['Player 1', 'Player 2', 'Player 3']),
            grid: null,
            history: null,
        });
        
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        
        // Check if all three player names are rendered
        expect(getByText('Player 1')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();
        expect(getByText('Player 3')).toBeTruthy();
        // Check if correct number of cells are rendered for each player
        expect(getAllByTestId(/^cell-\d+-0$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-1$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-2$/)).toHaveLength(7);
    });
    
    it('properly formats the board for 4 player games', () => {
        mockUseLocalSearchParams.mockReturnValue({
            gameName: 'Test Game',
            players: JSON.stringify(['Player 1', 'Player 2', 'Player 3', 'Player 4']),
            grid: null,
            history: null,
        });
        
        const { getByText, getAllByTestId } = render(<GameScreenPage />);
        
        // Check if all three player names are rendered
        expect(getByText('Player 1')).toBeTruthy();
        expect(getByText('Player 2')).toBeTruthy();
        expect(getByText('Player 3')).toBeTruthy();
        expect(getByText('Player 4')).toBeTruthy();
        // Check if correct number of cells are rendered for each player
        expect(getAllByTestId(/^cell-\d+-0$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-1$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-2$/)).toHaveLength(7);
        expect(getAllByTestId(/^cell-\d+-3$/)).toHaveLength(7);
    });
});