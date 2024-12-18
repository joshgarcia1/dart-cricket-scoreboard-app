import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';

/**
 * Game Screen Page Component
 * 
 * Represents the main game screen where players interact with the game grid.
 * Allows marking scores, undoing actions, resetting the board, and managing game state.
 */
export default function GameScreenPage() {
  const navigation = useNavigation(); // Navigation instance for customizing the header
  const router = useRouter(); // Router instance for navigating between screens
  // Extract parameters passed to the screen (game name, players, grid state, history)
  const { gameName = 'Game', players: playersParam, grid: gridParam, history: historyParam } = useLocalSearchParams();

  // Define rows of the game grid
  const rows = ['20', '19', '18', '17', '16', '15', 'Bull'];
  // Parse player names or set defaults
  const players = playersParam ? JSON.parse(playersParam) : ['Player 1', 'Player 2'];
  // Initial state setup: a grid with all cells having 0 taps
  const initialGridState = rows.map(() => Array(players.length).fill({ taps: 0 }));
  // State variables for managing grid, history, and changes
  const [grid, setGrid] = useState(gridParam ? JSON.parse(gridParam) : initialGridState);
  const [history, setHistory] = useState(historyParam ? JSON.parse(historyParam) : []);
  const [originalGrid, setOriginalGrid] = useState(gridParam ? JSON.parse(gridParam) : initialGridState);
  const [originalHistory, setOriginalHistory] = useState(historyParam ? JSON.parse(historyParam) : []);
  const [changesMade, setChangesMade] = useState(false); // Tracks unsaved changes
  const [isWinnerDeclared, setIsWinnerDeclared] = useState(false); // Track if a winner is declared
  const [hasSaved, setHasSaved] = useState(false); // Prevent duplicate saves

  /**
   * useLayoutEffect Hook
   *
   * Customizes the appearance of the navigation bar for the Game Screen.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#A05C59', // Match the page background color
      },
      headerTitle: '', // Remove default title for a clean look
    });
  }, [navigation]);

  /**
   * useEffect Hook
   *
   * Saves the game state when navigating away from the Game Screen.
   */
  useEffect(() => {
    return () => {
      if (!isWinnerDeclared && changesMade) {
        saveGame();
      }
    };
  }, [isWinnerDeclared, changesMade]);

  /**
   * useFocusEffect Hook
   *
   * Reloads the current game state when returning to the Game Screen.
   * Ensures the latest progress is reflected.
   */
  useFocusEffect(
    useCallback(() => {
      const fetchGameState = async () => {
        const existingGames = await AsyncStorage.getItem('inProgressGames');
        const games = existingGames ? JSON.parse(existingGames) : [];
        const currentGame = games.find(game => game.gameName === gameName);

        if (currentGame) {
          setGrid(currentGame.grid);
          setHistory(currentGame.history);
          setOriginalGrid(JSON.parse(JSON.stringify(currentGame.grid))); // Sync original grid
        }
      };

      fetchGameState();
    }, [gameName])
  );

  /**
   * saveGame Function
   *
   * Saves or updates the current game state in the "in-progress" games list.
   */
  const saveGame = async () => {
    const gameData = {
      gameName,
      players,
      grid,
      history,
      date: new Date().toLocaleDateString(),
    };

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      const games = existingGames ? JSON.parse(existingGames) : [];

      // Update the game list by replacing the current game data
      const updatedGames = games.filter(game => game.gameName !== gameName);
      updatedGames.push(gameData);

      await AsyncStorage.setItem('inProgressGames', JSON.stringify(updatedGames));
      setOriginalGrid(JSON.parse(JSON.stringify(grid))); // Sync original grid with saved grid
      setChangesMade(false); // Reset change tracker
      setHasSaved(true); // Prevent duplicate saves
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  /**
   * handleCellPress Function
   *
   * Increments the tap count for the selected cell in the game grid.
   * Also checks if a player has won after the tap.
   */
  const handleCellPress = (rowIndex, colIndex) => {
    if (isWinnerDeclared) return; // Do nothing if the game has already been won

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      const previousTaps = newGrid[rowIndex][colIndex].taps;
      // Increment taps, limiting them to a maximum of 3
      const newTaps = Math.min(previousTaps + 1, 3);
      newGrid[rowIndex][colIndex] = { taps: newTaps };
      // Update move history
      setHistory((prevHistory) => [
        ...prevHistory,
        { rowIndex, colIndex, previousTaps },
      ]);
      // Mark that changes have been made
      setChangesMade(true);
      // Check if the move resulted in a win
      checkForWinner(newGrid, colIndex);

      return newGrid;
    });
  };

  /**
   * handleUndo Function
   *
   * Reverts the last move made on the game grid.
   */
  const handleUndo = () => {
    if (history.length === 0 || isWinnerDeclared) return; // Do nothing if no history or winner declared

    const lastMove = history.pop(); // Remove the last move from history

    setGrid((prevGrid) => {
      const updatedGrid = [...prevGrid];
      updatedGrid[lastMove.rowIndex][lastMove.colIndex] = {
        taps: lastMove.previousTaps, // Restore the previous taps
      };
      return updatedGrid;
    });

    setHistory([...history]);
    setChangesMade(true);
    saveGame();
  };

  /**
   * handleResetBoard Function
   *
   * Resets the game grid to its initial state and clears the history.
   */
  const handleResetBoard = () => {
    Alert.alert('Reset Board', 'Are you sure you want to reset the board?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setGrid(initialGridState); // Reset the grid
          setHistory([]); // Clear the history
          setOriginalGrid(JSON.parse(JSON.stringify(initialGridState))); // Sync original grid
          setChangesMade(true);
          await saveResetGame(); // Save the reset state
        },
      },
    ]);
  };

  /**
   * saveResetGame Function
   * 
   * This function saves the game state after the board has been reset. It clears
   * the grid and history, then updates AsyncStorage with the reset state. This ensures 
   * that when the game is resumed from the Game History page, the reset board state is loaded.
   */
  const saveResetGame = async () => {
    const resetGameHistory = { // Create a new game history object that reflects the reset state
      gameName,
      players,
      grid: initialGridState, // Save the reset grid state
      history: [],            // Clear the history as part of the reset
      date: new Date().toLocaleDateString(),
    }

    try {
      const existingGames = await AsyncStorage.getItem('inProgressGames');
      const games = existingGames ? JSON.parse(existingGames) : [];

      const updatedGames = games.filter(game => game.gameName !== gameName);
      updatedGames.push(resetGameHistory);

      await AsyncStorage.setItem('inProgressGames', JSON.stringify(updatedGames));

      // Update the original grid and history
      setOriginalGrid(JSON.parse(JSON.stringify(initialGridState)));
      setOriginalHistory([]);
      setChangesMade(false); // No further changes after reset
    } catch (error) {
      console.error('Failed to save reset game:', error);
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
      const inProgressGames = existingGames ? JSON.parse(existingGames) : [];
      // Filter out the current game from "In-Progress" by comparing the grid or unique identifier
      const updatedGames = inProgressGames.filter(game => game.gameName !== gameName);
      await AsyncStorage.setItem('inProgressGames', JSON.stringify(updatedGames));
    } catch (error) {
      console.error('Failed to remove game from in-progress:', error);
    }
  };

  /**
   * saveCompletedGame Function
   *
   * Saves the completed game to the "completed" games list in AsyncStorage.
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
   * checkForWinner Function
   *
   * Checks if a player has won the game by completing a column.
   */
  const checkForWinner = (grid, colIndex) => {
    const column = grid.map(row => row[colIndex]);
    const isWinner = column.every(cell => cell.taps === 3);

    if (isWinner) {
      const winnerName = players[colIndex];
      setIsWinnerDeclared(true); // Mark the game as completed
      saveCompletedGame(winnerName);  // Save the game as completed
      // Delay navigation to avoid updating state during render
      setTimeout(() => {
        router.push({
          pathname: '/winner-popup',
          params: {
            playerName: winnerName,
            date: new Date().toLocaleDateString(),
          },
        });
      }, 100);
    }
  };

  /**
   * renderCellContent Function
   *
   * Determines the content to display in a grid cell based on the number of taps.
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
   * Determines the font size of the content displayed in a grid cell.
   * Larger font size is used when the cell has been tapped three times.
   */
  const getCellFontSize = (taps) => (taps === 3 ? styles.largeText : styles.normalText);

  /**
   * getNumberColumnPosition Function
   *
   * Determines the position of the "numbers" column in the grid based on the number of players.
   * Adjusts the layout dynamically for grids with 2, 3, or 4 players.
   */
  const getNumberColumnPosition = () => {
    if (players.length === 2) return 1; // Place numbers between 2 players
    if (players.length === 3) return 2; // Place numbers after the 2nd player
    if (players.length === 4) return 2; // Place numbers after the 2nd player for 4-player games
    return players.length; // Default position for other cases
  };

  return (
    <View style={styles.container}>
      {/* Header displaying the game name */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{gameName}</Text>
      </View>

      {/* Main grid container */}
      <View style={styles.gridContainer}>
        {/* Top row displaying player names and a blank cell for alignment */}
        <View style={styles.row}>
          {players.map((player, index) => (
            <React.Fragment key={`player-${index}`}>
              {/* Insert a blank cell for alignment if necessary */}
              {index === getNumberColumnPosition() && (
                <View style={styles.cell} key="blank-above-numbers">
                  <Text style={styles.playerText}></Text>
                </View>
              )}
              {/* Display each player's name */}
              <View style={styles.cell} key={`player-name-${index}`}>
                <Text style={styles.playerText}>{player}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Display the game grid with rows and columns */}
        {rows.map((row, rowIndex) => (
          <View style={styles.row} key={rowIndex}>
            {players.map((_, colIndex) => (
              <React.Fragment key={`fragment-${rowIndex}-${colIndex}`}>
                {/* Insert the numbers column in the correct position */}
                {colIndex === getNumberColumnPosition() && (
                  <View style={styles.cell} key={`number-${row}`}>
                    <Text style={styles.scoreText}>{row}</Text>
                  </View>
                )}
                {/* Render each cell in the grid, handling taps and displaying the appropriate symbol */}
                <TouchableOpacity
                  testID={`cell-${rowIndex}-${colIndex}`}
                  style={styles.cell}
                  key={`cell-${rowIndex}-${colIndex}`}
                  onPress={() => handleCellPress(rowIndex, colIndex)}
                >
                  <Text style={[styles.scoreText, getCellFontSize(grid[rowIndex][colIndex].taps)]}>
                    {renderCellContent(grid[rowIndex][colIndex].taps)}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>

      {/* Footer with Undo and Reset Board buttons */}
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
 * The styles object contains the styling for the GameHistoryPage component.
 * It includes layout settings, typography, and colors for the various elements within the page.
 */
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A05C59',
  },
  header: {
    backgroundColor: '#A05C59',
    paddingVertical: 20,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  gridContainer: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    flex: 1,
    backgroundColor: '#6495ED',
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
    fontSize: 40,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 50,
    backgroundColor: '#A05C59',
  },
  footerButton: {
    flex: 1,
    backgroundColor: '#D3D3D3',
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 10,
    borderRadius: 5,
  },
  footerButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

/**
 * game-screen.js Explanation:
 *
 * 1. **Game Screen Page Component**: Core gameplay screen, manages the grid, user interactions, and game state.
 * 2. **useLayoutEffect Hook**: Styles the navigation bar to match the game screen's appearance.
 * 3. **useFocusEffect Hook**: Reloads the game state whenever the screen is focused.
 * 4. **useEffect Hook**: Saves the current game state when the component is unmounted or changes are detected.
 * 5. **saveGame Function**: Saves the current game state to AsyncStorage under "in-progress" games.
 * 6. **handleCellPress Function**: Handles user taps on grid cells and updates the game state.
 * 7. **handleUndo Function**: Reverts the last move made on the grid.
 * 8. **handleResetBoard Function**: Resets the game board and clears the history.
 * 9. **checkForWinner Function**: Checks if a player has won by filling an entire column.
 * 10. **saveCompletedGame Function**: Moves completed games to the "completed" section.
 * 11. **saveResetGame Function**: Saves the game state after the board is reset, ensuring reset state is reflected.
 * 12. **removeFromInProgress Function**: Removes the game from the "in-progress" list once completed.
 * 13. **getCellFontSize Function**: Determines font size for grid cell content based on tap count.
 * 14. **getNumberColumnPosition Function**: Dynamically positions the "numbers" column based on the number of players.
 * 15. **renderCellContent Function**: Dynamically determines the content displayed in each grid cell.
 * 16. **styles Object**: Contains all styles for the component, ensuring consistent layout, typography, and appearance.
 */