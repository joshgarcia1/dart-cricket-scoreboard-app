import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter, useSearchParams, useNavigation } from 'expo-router';

/**
 * Winner Popup Page Component
 * 
 * This component represents the popup that appears when a player wins a game.
 * It displays the winner's name, date, and a dynamic "WINNER" text. Users can 
 * navigate back to the main menu or start a new game from this screen.
 */
export default function WinnerPopupPage() {
  const router = useRouter();
  const { playerName, date } = useSearchParams(); // Extract parameters passed to the component
  const navigation = useNavigation(); // Used for styling navigation bar

  /**
   * useLayoutEffect Hook
   * 
   * Hook for styling the navigation bar to be the same color as the page and remove all text.
   */
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: '#F0E68C', // Match the page background color
      },
      headerTitle: '', // Remove text from the navigation bar
    });
  }, [navigation]);

  /**
   * handleNewGame Function
   * 
   * Resets navigation and starts a new game by routing to the GameSetup page.
   */
  const handleNewGame = () => {
    router.replace('/game-setup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        {/* Image representing the winner or a trophy */}
        <Image
          source={require('../assets/winner_popup_art.png')} // Inserting winner graphic asset
          style={styles.winnerImage}
        />
        {/* Inserting "WINNER" text */}
        <Text style={styles.winnerText}>WINNER!</Text>

        {/* Display game details: player name and date */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Player: {playerName}</Text>
          <Text style={styles.infoText}>Date: {date}</Text>
        </View>

        {/* Button to navigate back to the main menu */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/Home')}
        >
          <Text style={styles.buttonText}>Main Menu</Text>
        </TouchableOpacity>

        {/* Button to start a new game */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleNewGame}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the WinnerPopupPage component.
 * This includes the layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0E68C', // Background color for the popup
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '80%',
    backgroundColor: '#DDA0DD', // Background color for the popup box
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  winnerImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  winnerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color
    textShadowColor: '#000', // Shadow for depth
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  infoText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * winner-popup.js Explanation:
 * 
 * 1. `Winner Popup Page Component`: The main component that renders the winner's popup screen. It displays the winner's details (name and date) and provides options to navigate back to the main menu or start a new game.
 * 2. `useSearchParams`: Extracts `playerName` and `date` parameters from the URL for dynamic rendering.
 * 3. `Image Component`: Displays an image (e.g., trophy) symbolizing the win.
 * 4. `Text Components`: Render the "WINNER" text with a dynamic and visually stunning style, along with the game details.
 * 5. `TouchableOpacity Components`: Provide interactive buttons for the user to either go back to the main menu or start a new game.
 * 6. `router.push` and `router.replace`: Replace `navigation.navigate` for routing to appropriate screens in Expo Router.
 * 7. `styles Object`: Contains all the styling for the component, ensuring the layout is visually appealing and consistent with the rest of the app.
 * 8. `useLayoutEffect`: A React hook used to customize the navigation bar:
 *    - `headerStyle`: Sets the background color of the navigation bar to match the page.
 *    - `headerTitle`: Removes the title text from the navigation bar for a minimalist appearance.
 */
