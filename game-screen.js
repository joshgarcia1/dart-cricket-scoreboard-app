import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSearchParams, useNavigation } from 'expo-router';

/**
 * Game Screen Page Component
 * 
 * Represents the main game screen where players interact with the game grid.
 * Allows marking scores, undoing actions, resetting the board, and managing game state.
 */
export default function GameScreenPage() {
  const router = useRouter(); // Router for navigation
  const navigation = useNavigation(); // Used for customizing the navigation bar
  const { gameName = 'Game', players: playersParam, grid: gridParam, history: historyParam } = useSearchParams();

  // Safely parse parameters with fallbacks
  let players = ['Player 1', 'Player 2'];
  let grid = [];
  let history = [];
  const rows = ['20', '19', '18', '17', '16', '15', 'Bull']; // Game rows

  try {
    players = playersParam ? JSON.parse(playersParam) : ['Player 1', 'Player 2'];
    const initialGridState = rows.map(() => Array(players.length).fill({ taps: 0 }));
    grid = gridParam ? JSON.parse(gridParam) : initialGridState;
    history = historyParam ? JSON.parse(historyParam) : [];
  } catch (error) {
    console.error('Failed to parse parameters:', error);
    router.replace('/game-setup'); // Redirect to game setup on parsing error
  }

  // States
  const [gameGrid, setGameGrid] = useState(grid);
  const [moveHistory, setMoveHistory] = useState(history);
  const [originalGrid, setOriginalGrid] = useState(grid);
  const [originalHistory, setOriginalHistory] = useState(history);
  const [isWinnerDeclared, setIsWinnerDeclared] = useState(false);

  /**
   * useLayoutEffect Hook
   * 
   * Hook for styling the navigation bar to be the same color as the page and remove all text.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#A05C59', // Match the page background color
      },
      headerTitle: '', // Remove text from the navigation bar
    });
  }, [navigation]);

  /**
   * useEffect Hook
   * 
   * This hook is used to update the original grid and history state when the component
   * receives new grid and history data through route parameters. It ensures that the
   * component has the correct initial state when the game is resumed.
   */
  useEffect(() => {
    return () => {
      if (!isWinnerDeclared) saveGame();
    };
  }, [isWinnerDeclared]);

  /**
   * saveGame Function
   * 
   * This function saves the current game state to AsyncStorage, either by updating
   * an existing in-progress game or adding a new entry if necessary.
   */
  const saveGame = async () => {
    if (!gameGrid || !moveHistory) return;

    const gameData = {
      gameName,
      players,
      grid: gameGrid,
      history: moveHistory,
      date: new Date().toLocaleDateString(),
    };

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      const games = existingGames ? JSON.parse(existingGames) : [];
      const updatedGames = games.filter((game) => JSON.stringify(game.grid) !== JSON.stringify(originalGrid));
      updatedGames.push(gameData);
      await AsyncStorage.setItem('inProgressGames', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  /**
   * handleCellPress Function
   * 
   * This function handles the press event on a cell in the game grid.
   * It increments the number of taps for that cell, updates the grid state,
   * and checks if a player has won the game.
   */
  const handleCellPress = (rowIndex, colIndex) => {
    if (isWinnerDeclared) return;

    const updatedGrid = [...gameGrid];
    const previousTaps = updatedGrid[rowIndex][colIndex].taps;
    const newTaps = Math.min(previousTaps + 1, 3);

    updatedGrid[rowIndex][colIndex] = { taps: newTaps };
    setGameGrid(updatedGrid);
    setMoveHistory([...moveHistory, { rowIndex, colIndex, previousTaps }]);
    checkForWinner(updatedGrid, colIndex);
    saveGame();
  };

  /**
   * handleUndo Function
   * 
   * This function allows the user to undo the last move made in the game.
   * It updates the grid state to reflect the previous state.
   */
  const handleUndo = () => {
    if (moveHistory.length === 0 || isWinnerDeclared) return;

    const lastMove = moveHistory.pop();
    const updatedGrid = [...gameGrid];
    updatedGrid[lastMove.rowIndex][lastMove.colIndex] = { taps: lastMove.previousTaps };

    setGameGrid(updatedGrid);
    setMoveHistory([...moveHistory]);
    saveGame();
  };

  /**
   * handleResetBoard Function
   * 
   * This function resets the game board to its initial state, clearing all marks.
   * It asks the user for confirmation before proceeding with the reset.
   * After resetting the board, it immediately saves the new game state to ensure 
   * that the reset state is reflected when navigating away or resuming the game.
   */
  const handleResetBoard = () => {
    Alert.alert(
      'Reset Board',
      'Are you sure you want to reset the board? This will clear all marks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            const initialGridState = rows.map(() => Array(players.length).fill({ taps: 0 }));
            setGameGrid(initialGridState);
            setMoveHistory([]);
            await saveResetGame();
          },
        },
      ]
    );
  };

  /**
   * saveResetGame Function
   * 
   * This function saves the game state after the board has been reset. It clears
   * the grid and history, then updates AsyncStorage with the reset state. This ensures 
   * that when the game is resumed from the Game History page, the reset board state is loaded.
   */
  const saveResetGame = async () => {
    const currentTime = new Date().toLocaleTimeString();
    const resetGameHistory = { // Create a new game history object that reflects the reset state
      gameName,
      players,
      grid: initialGridState, // Save the reset grid state
      history: [],            // Clear the history as part of the reset
      date: new Date().toLocaleDateString(),
      time: currentTime,
    }

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      let inProgressGames = existingGames ? JSON.parse(existingGames) : [];

      // Remove the old game entry by matching the original grid state
      inProgressGames = inProgressGames.filter(
        (game) => JSON.stringify(game.grid) !== JSON.stringify(originalGrid)
      );

      // Add the reset game to AsyncStorage
      inProgressGames.push(resetGameHistory);
      await AsyncStorage.setItem('inProgressGames', JSON.stringify(inProgressGames));

      // Update the original grid and history
      setOriginalGrid(JSON.parse(JSON.stringify(initialGridState)));
      setOriginalHistory([]);
      setChangesMade(false); // No further changes after reset
    } catch (error) {
      console.error('Failed to save reset game:', error);
    }
  };

  /**
   * resetGame Function
   * 
   * This function helps the handleNewGameFromWinner function to ensure the board is reset
   * when a user starts a new game from the Winner Popup Page.
   */
  const resetGame = () => {
    setGrid(initialGridState); // Reset the grid to the initial state
    setHistory([]); // Clear the history
    setIsWinnerDeclared(false); // Reset winner status
  };

  /**
   * handleNewGameFromWinner Function
   * 
   * Resets the game and clears the navigation stack to start fresh from the GameSetup screen.
   */
  const handleNewGameFromWinner = () => {
    resetGame();
    router.replace('/game-setup');
  };

  /**
   * checkForWinner Function
   * 
   * This function checks if a player has filled an entire column with "Ⓧ" symbols,
   * which would indicate a win. If a player wins, the game is saved as completed
   * and the user is navigated to the WinnerPopupPage.
   */
  const checkForWinner = (grid, colIndex) => {
    const column = grid.map((row) => row[colIndex]);
    const isWinner = column.every((cell) => cell.taps === 3);

    if (isWinner) {
      const winnerName = players[colIndex];
      setIsWinnerDeclared(true);
      saveCompletedGame(winnerName);
      removeFromInProgress();

      setTimeout(() => {
        router.push({
          pathname: '/winner-popup',
          params: { playerName: winnerName, date: new Date().toLocaleDateString() },
        });
      }, 100);
    }
  };

  /**
   * removeFromInProgress Function
   * 
   * This function removes the current game from the in-progress games stored in AsyncStorage.
   * It ensures that the game is removed from the in-progress list if the game is completed.
   */
  const removeFromInProgress = async () => {
    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      let inProgressGames = existingGames ? JSON.parse(existingGames) : [];

      inProgressGames = inProgressGames.filter(
        (game) => JSON.stringify(game.grid) !== JSON.stringify(originalGrid)
      );

      await AsyncStorage.setItem('inProgressGames', JSON.stringify(inProgressGames));
    } catch (error) {
      console.error('Failed to remove game from in-progress:', error);
    }
  };

  /**
   * saveCompletedGame Function
   * 
   * This function saves the completed game to the list of completed games in AsyncStorage.
   */
  const saveCompletedGame = async (winnerName) => {
    const completedGame = {
      gameName,
      players,
      grid,
      winner: winnerName,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    try {
      const existingGames = await AsyncStorage.getItem('completedGames');
      const completedGames = existingGames ? JSON.parse(existingGames) : [];
      completedGames.push(completedGame);
      await AsyncStorage.setItem('completedGames', JSON.stringify(completedGames));
      // After saving to "Completed", remove it from "In-Progress"
      await removeFromInProgress();
    } catch (error) {
      console.error('Failed to save completed game:', error);
    }
  };

  /**
   * getNumberColumnPosition Function
   * 
   * This function determines the position of the number column based on the number of players.
   * It ensures that the number column is correctly placed between player columns.
   */
  const getNumberColumnPosition = () => {
    if (players.length === 2) return 1;
    if (players.length === 3 || players.length === 4) return 2;
    return players.length;
  };

  /**
   * renderCellContent Function
   * 
   * This function returns the appropriate symbol to display in a grid cell
   * based on the number of taps: "/", "X", or "Ⓧ".
   */
  const renderCellContent = (taps) => {
    if (taps === 1) return '/';
    if (taps === 2) return 'X';
    if (taps === 3) return 'Ⓧ';
    return '';
  };

  /**
   * getCellFontSize Function
   * 
   * This function returns the appropriate font size based on the number of taps.
   * The font size is larger when the symbol is "Ⓧ".
   */
  const getCellFontSize = (taps) => (taps === 3 ? styles.largeText : styles.normalText);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{gameName}</Text>
      </View>

      {/* Grid */}
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {players.map((_, colIndex) => (
              <TouchableOpacity
                key={`cell-${rowIndex}-${colIndex}`}
                style={styles.cell}
                onPress={() => handleCellPress(rowIndex, colIndex)}
              >
                <Text style={[styles.scoreText, { fontSize: gameGrid[rowIndex][colIndex]?.taps === 3 ? 40 : 24 }]}>
                  {gameGrid[rowIndex][colIndex]?.taps === 1 ? '/' : gameGrid[rowIndex][colIndex]?.taps === 2 ? 'X' : gameGrid[rowIndex][colIndex]?.taps === 3 ? 'Ⓧ' : ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleUndo}>
          <Text style={styles.footerButtonText}>Undo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleResetBoard}>
          <Text style={styles.footerButtonText}>Reset Board</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameScreenPage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A05C59',
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#A05C59',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: '#6495ED', // Blue color for the cells
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  playerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  normalText: {
    fontSize: 24,
  },
  largeText: {
    fontSize: 40, // Larger font size for circled X
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 60,
    backgroundColor: '#A05C59',
  },
  footerButton: {
    flex: 1, // Ensure both buttons take up equal space
    backgroundColor: '#D3D3D3',
    paddingVertical: 15,
    alignItems: 'center', // Center the text inside the button
    borderRadius: 5,
    marginHorizontal: 10, // Add some space between the buttons
  },
  footerButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * game-screen.js Explanation:
 * 
 * 1. `Game Screen Page Component`: The main component that represents the game screen where users can interact with the game grid, make moves, undo actions, reset the board, and navigate to other screens.
 * 2. `useEffect Hook`: Updates the original grid and history states when the component receives new data via route parameters, ensuring proper state initialization.
 * 3. `saveGame Function`: Saves the current game state to AsyncStorage, ensuring that the game can be resumed later.
 * 4. `handleCellPress Function`: Handles user interactions with the game grid, updating the grid state and checking for a winner.
 * 5. `handleUndo Function`: Allows the user to undo the last move made in the game and updates the grid state to reflect the previous state.
 * 6. `handleResetBoard Function`: Resets the game board to its initial state, clears all marks, immediately saves the new state, and alerts the user for confirmation before resetting.
 * 7. `saveResetGame Function`: This function saves the reset game state to AsyncStorage, ensuring the reset state is preserved and correctly loaded when the game is resumed.
 * 8. `renderCellContent Function`: Returns the appropriate symbol to display in a grid cell based on the number of taps.
 * 9. `getCellFontSize Function`: Returns the appropriate font size for each symbol and displays a larger font for the X with a circle.
 * 10. `checkForWinner Function`: Checks if a player has won by filling a column with "Ⓧ" symbols. If a player wins, the game is saved as completed, and the user is navigated to the WinnerPopupPage.
 * 11. `resetGame Function`: Resets the game grid, history, and winner status to the initial state.
 * 12. `handleNewGameFromWinner Function`: Resets the game and clears the navigation stack to start a new game from the GameSetup screen.
 * 13. `removeFromInProgress Function`: Removes the current game from in-progress games in AsyncStorage upon completion, ensuring that completed games are not duplicated in-progress.
 * 14. `saveCompletedGame Function`: Saves the completed game to the list of completed games in AsyncStorage.
 * 15. `getNumberColumnPosition Function`: Determines the position of the number and bull column based on the number of players and ensures the blank tile is in the appropriate position between the player names.
 * 16. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and consistent with the rest of the app.
 * 17. `useLayoutEffect`: A React hook used to customize the navigation bar:
 *    - `headerStyle`: Sets the background color of the navigation bar to match the page.
 *    - `headerTitle`: Removes the title text from the navigation bar for a minimalist appearance.
 */