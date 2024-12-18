import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Game Setup Page Component
 * 
 * This component allows users to set up a new game by entering a game name,
 * specifying player names, and adjusting the number of players. Once the setup
 * is complete, users can start the game, which navigates them to the GameScreenPage.
 */
export default function GameSetupPage() {
  const router = useRouter(); // expo-router navigation hook
  const [gameName, setGameName] = useState(() => 'New Game'); // Optimized state initialization
  const [players, setPlayers] = useState(() => ['Player 1', 'Player 2']); // Optimized state initialization
  const [isLoading, setIsLoading] = useState(true); // Track asset loading status
  const navigation = useNavigation(); // Used for styling navigation bar

  const rows = ['20', '19', '18', '17', '16', '15', 'Bull'];

  /**
   * useLayoutEffect Hook
   * 
   * Hook for styling the navigation bar to be the same color as the page and remove all text.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#AAFFAA', // Match the page background color
      },
      headerTitle: '', // Remove text from the navigation bar
    });
  }, [navigation]);

  /**
   * useEffect Hook
   * 
   * Preload assets and ensure they're ready before the component is rendered.
   */
  useEffect(() => {
    async function preloadAssets() {
      try {
        await SplashScreen.preventAutoHideAsync(); // Keep the splash screen visible
        // Simulate asset loading if there are no large assets
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error preloading assets:', error);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync(); // Hide the splash screen
      }
    }

    preloadAssets();
  }, []);

  /**
   * Generate Initial Grid State
   * 
   * Dynamically generates the grid based on the number of players and rows.
   */
  const generateInitialGridState = () =>
    rows.map(() => Array(players.length).fill({ taps: 0 }));

  /**
   * addPlayer Function
   * 
   * This function adds a new player to the game setup.
   * It allows a maximum of four players.
   */
  const addPlayer = () => {
    if (players.length < 4) {
      setPlayers((prevPlayers) => [...prevPlayers, `Player ${prevPlayers.length + 1}`]);
    } else {
      Alert.alert('Player Limit Reached', 'You can only add up to 4 players.');
    }
  };

  /**
   * removePlayer Function
   * 
   * This function removes the last player from the game setup.
   * It ensures that there are always at least two players.
   */
  const removePlayer = (index) => {
    if (players.length > 2) {
      setPlayers((prevPlayers) => prevPlayers.filter((_, i) => i !== index));
    } else {
      Alert.alert('Minimum Players Required', 'You must have at least 2 players.');
    }
  };

  /**
   * handlePlayerNameChange Function
   * 
   * This function updates the name of a specific player in the players array
   * based on the index passed to it.
   * 
   * @param {string} name - The new name for the player
   * @param {number} index - The index of the player to be updated
   */
  const handlePlayerNameChange = (name, index) => {
    setPlayers((prevPlayers) => {
      const updatedPlayers = [...prevPlayers];
      updatedPlayers[index] = name;
      return updatedPlayers;
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
        index: 0, // Set the stack index to 0 (root level)
        routes: [{ name: 'index' }], // Route to the Home screen
    });
  };

  /**
   * startGame Function
   * 
   * This function is triggered when the user presses the "Start Game" button.
   * It navigates the user to the GameScreenPage and passes the game setup details
   * (game name, player names, etc.) to the GameScreenPage component.
   */
  const startGame = () => {
    if (!gameName.trim() || players.length < 2) {
      Alert.alert('Invalid Game Setup', 'Please ensure the game name is set and at least two players are added.');
      return;
    }

    const initialGridState = generateInitialGridState();

    try {
      router.push({
        pathname: '/game-screen',
        params: {
          gameName: gameName || 'New Game',
          players: JSON.stringify(players),
          grid: JSON.stringify(initialGridState),
          history: JSON.stringify([]),
        },
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to the game screen.');
    }
  };

  if (isLoading) {
    // Show a loading indicator while assets are being preloaded
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Game Setup</Text>

      {/* Input for the game name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Game Name</Text>
        <TextInput
          style={styles.input}
          value={gameName}
          onChangeText={setGameName}
        />
      </View>

      {/* Player name inputs and button to remove players */}
      {players.map((player, index) => (
        <View key={index} style={styles.inputGroup}>
          <Text style={styles.label}>Player {index + 1}</Text>
          <View style={styles.playerInputRow}>
            <TextInput
              style={[styles.input, styles.playerInput]}
              value={player}
              onChangeText={(text) => handlePlayerNameChange(text, index)}
            />
            {players.length > 2 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePlayer(index)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {/* Button to add players */}
      <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
        <Text style={styles.addButtonText}>Add Player</Text>
      </TouchableOpacity>

      {/* Button to start the game */}
      <TouchableOpacity style={styles.startButton} onPress={startGame}>
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>

      {/* Button to go back to main menu */}
      <TouchableOpacity style={styles.button} onPress={handleBackToHome}>
        <Text style={styles.buttonText}>Back to Main Menu</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameSetupPage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AAFFAA', // Light green background color
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#FFF', // White color background for the input
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerInput: {
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
    backgroundColor: '#FF6347', // Tomato red color for remove button
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#6495ED', // Blue color for add button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  startButton: {
    backgroundColor: '#32CD32', // Lime green color for start button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#8A2BE2', // Purple color for main menu button
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AAFFAA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});

/**
 * game-setup.js Explanation:
 * 
 * 1. `GameSetupPage Component`: The main component that allows users to set up a new game by entering the game name and player names, adjusting the number of players, starting the game, or navigate back to the main menu.
 * 2. `handlePlayerNameChange Function`: Updates the name of a player based on the index in the players array.
 * 3. `addPlayer Function`: Adds a new player to the setup, allowing a maximum of four players.
 * 4. `removePlayer Function`: Removes the last player from the setup, ensuring at least two players remain.
 * 5. `startGame Function`: Navigates to the GameScreenPage with the setup details if the game name is provided.
 * 6. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and user-friendly.
 * 7. `useLayoutEffect`: A React hook used to customize the navigation bar:
 *    - `headerStyle`: Sets the background color of the navigation bar to match the page.
 *    - `headerTitle`: Removes the title text from the navigation bar for a minimalist appearance.
 */