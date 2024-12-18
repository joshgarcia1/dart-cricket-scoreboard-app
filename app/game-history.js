import React, { useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useNavigation } from 'expo-router';

/**
 * Game History Page Component
 * 
 * This component displays a list of in-progress and completed games.
 * Users can resume in-progress games, view details of completed games, or delete games from the history.
 */
export default function GameHistoryPage() {
  const [inProgressGames, setInProgressGames] = useState([]); // State to store in-progress games
  const [completedGames, setCompletedGames] = useState([]); // State to store completed games
  const router = useRouter(); // expo-router navigation
  const navigation = useNavigation(); // Used for styling navigation bar

  /**
   * useLayoutEffect Hook
   * 
   * Customizes the navigation bar, sets the background color to match the page, 
   * and removes any text from the navigation header for a cleaner look.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#6495ED', // Match the page background color
      },
      headerTitle: '', // Remove text from the navigation bar
    });
  }, [navigation]);

  /**
   * loadGames Function
   *
   * Loads both in-progress and completed games from AsyncStorage.
   * Updates the component state with the retrieved game data.
   */
  const loadGames = async () => {
    try {
      // Fetch saved games from AsyncStorage
      const savedInProgressGames = await AsyncStorage.getItem('inProgressGames');
      const savedCompletedGames = await AsyncStorage.getItem('completedGames');
      // Update the state with parsed game data
      setInProgressGames(savedInProgressGames ? JSON.parse(savedInProgressGames) : []);
      setCompletedGames(savedCompletedGames ? JSON.parse(savedCompletedGames) : []);
    } catch (error) {
      console.error('Failed to load games:', error);
    }
  };

  /**
   * useEffect Hook
   *
   * Automatically reloads game data when the Game History page is mounted.
   * Ensures that the displayed data is up-to-date whenever the user navigates here.
   */
  React.useEffect(() => {
    loadGames();
  }, []);

  /**
   * deleteGame Function
   *
   * Deletes a specified game from either the in-progress or completed list.
   * Updates AsyncStorage and the component state to reflect the changes.
   *
   * @param {Object} game - The game object to be deleted.
   * @param {string} type - The type of the game list ("inProgress" or "completed").
   */
  const deleteGame = async (game, type) => {
    try {
      let gamesList;
      // Determine the list to delete from (in-progress or completed)
      if (type === 'inProgress') {
        gamesList = await AsyncStorage.getItem('inProgressGames');
        gamesList = gamesList ? JSON.parse(gamesList) : [];
        gamesList = gamesList.filter((g) => JSON.stringify(g) !== JSON.stringify(game));
        await AsyncStorage.setItem('inProgressGames', JSON.stringify(gamesList));
        setInProgressGames(gamesList);
      } else {
        gamesList = await AsyncStorage.getItem('completedGames');
        gamesList = gamesList ? JSON.parse(gamesList) : [];
        gamesList = gamesList.filter((g) => JSON.stringify(g) !== JSON.stringify(game));
        await AsyncStorage.setItem('completedGames', JSON.stringify(gamesList));
        setCompletedGames(gamesList);
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  };

  /**
   * confirmDelete Function
   *
   * Displays an alert to confirm game deletion. If confirmed, it deletes the game.
   *
   * @param {Object} game - The game object to be deleted.
   * @param {string} type - The type of the game list ("inProgress" or "completed").
   */
  const confirmDelete = (game, type) => {
    Alert.alert(
      'Delete Game',
      'Are you sure you want to delete this game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteGame(game, type),
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * renderGame Function
   *
   * Renders an individual game item in the list. Displays:
   * - Game name
   * - Players involved
   * - Date and time
   * - Winning player (if applicable)
   * Provides buttons to resume or delete the game.
   *
   * @param {Object} item - Game object to render.
   * @param {string} type - The type of the game list ("inProgress" or "completed").
   */
  const renderGame = ({ item, index }, type) => (
    <View style={styles.gameItem} key={index}>
      <View style={styles.gameDetails}>
        <Text style={styles.gameText}>{item.gameName}</Text>
        <Text style={styles.playerText}>Players: {item.players.join(', ')}</Text>
        <Text style={styles.dateText}>{item.date} {item.time}</Text>
        {type === 'completed' && (
          <Text style={styles.winnerText}>Winner: {item.winner}</Text>
        )}
      </View>
      <View style={styles.gameActions}>
        {type === 'inProgress' && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={() =>
              router.push({
                pathname: '/game-screen',
                params: {
                  gameName: item.gameName,
                  players: JSON.stringify(item.players),
                  grid: JSON.stringify(item.grid),
                  history: JSON.stringify(item.history),
                },
              })
            }
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDelete(item, type)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Section for In-Progress Games */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>In Progress</Text>
      </View>
      <FlatList
        data={inProgressGames}
        renderItem={(item) => renderGame(item, 'inProgress')}
        keyExtractor={(item, index) => index.toString()}
      />

      {/* Section for Completed Games */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completed</Text>
      </View>
      <FlatList
        data={completedGames}
        renderItem={(item) => renderGame(item, 'completed')}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the GameHistoryPage component.
 * It includes layout settings, typography, and colors for the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#6495ED',
  },
  sectionHeader: {
    backgroundColor: '#32CD32',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  gameItem: {
    backgroundColor: '#87CEEB',
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameDetails: {
    flex: 3,
  },
  gameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  playerText: {
    fontSize: 16,
    color: '#000000',
  },
  dateText: {
    fontSize: 14,
    color: '#000000',
  },
  winnerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4500',
  },
  gameActions: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
  },
  resumeButton: {
    backgroundColor: '#32CD32',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 8,
    borderRadius: 5,
    marginLeft: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

/**
 * game-history.js Explanation:
 *
 * 1. `Game History Page Component`: The main component that displays the game history. It shows lists of in-progress and completed games, allowing users to resume or delete games.
 * 2. `loadGames Function`: Loads the game data from AsyncStorage and updates the component's state with this data.
 * 3. `deleteGame Function`: Deletes a specified game from the appropriate list (in-progress or completed) and updates the state.
 * 4. `confirmDelete Function`: Displays a confirmation alert before deleting a game, ensuring accidental deletions are avoided.
 * 5. `renderGame Function`: Renders individual game items with their details and action buttons to resume or delete games.
 * 6. `useLayoutEffect Hook`: Customizes the navigation bar to match the page design and removes unnecessary header text.
 * 7. `styles Object`: Defines all visual styles, including layout, typography, and colors for various UI components.
 */