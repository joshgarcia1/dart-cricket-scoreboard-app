import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { Link, useNavigation } from 'expo-router';

/**
 * Home Component
 * 
 * This component serves as the main landing page for the app. It allows users to navigate to other
 * sections of the app, including starting a new game, viewing game history, and accessing the "About" page.
 * The navigation bar is styled dynamically to match the page design.
 */
export default function Home() {
  const navigation = useNavigation(); // Used for styling navigation bar

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

  return (
    <View style={styles.container}>
      {/* Dartboard Image Section */}
      <View style={styles.imageContainer}>
        <Image 
          source={require('../assets/dartboard.png')} 
          style={styles.image} 
          resizeMode="contain" 
          testID="dartboard-image" 
          accessibilityRole="image" 
        />
      </View>
      {/* Start Game Button */}
      <TouchableOpacity style={styles.button}>
        <Link href="/game-setup">
          <Text style={styles.buttonText}>Start Game</Text>
        </Link>
      </TouchableOpacity>
      {/* Navigation Buttons Row */}
      <View style={styles.buttonRow}>
        {/* Game History Button */}
        <TouchableOpacity style={styles.smallButton}>
          <Link href="/game-history">
            <Text style={styles.buttonText}>Game History</Text>
          </Link>
        </TouchableOpacity>
        {/* About Page Button */}
        <TouchableOpacity style={styles.smallButton}>
          <Link href="/about">
            <Text style={styles.buttonText}>About</Text>
          </Link>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

/**
 * Styles
 * 
 * The styles object contains the styling for the HomePage component.
 * This includes layout settings, typography, colors, and dimensions for
 * the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A05C59', // Crimson red background color
    paddingBottom: 100,
  },
  imageContainer: {
    width: width * 0.8,
    aspectRatio: 1,
    marginBottom: 30,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#D3D3D3', // Gray button background
    paddingVertical: 10,
    paddingHorizontal: 118,
    borderRadius: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  smallButton: {
    backgroundColor: '#D3D3D3', // Gray button background
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * index.js Explanation:
 * 
 * 1. `Home Component`: Acts as the main entry point for the app, serving as the landing page.
 *    It provides navigation to other sections, including starting a game, viewing game history, and accessing the About page.
 * 2. `useLayoutEffect`: A React hook used to customize the navigation bar:
 *    - `headerStyle`: Sets the background color of the navigation bar to match the page.
 *    - `headerTitle`: Removes the title text from the navigation bar for a minimalist appearance.
 * 3. `expo-router Integration`:
 *    - `Link`: Used to navigate between app pages using the `expo-router` structure. Each `href` corresponds to a file in the `app` directory.
 * 4. `Image Component`: Displays a dartboard image on the main landing page.
 * 5. `TouchableOpacity and Link`: Provide interactive buttons for navigation to the Game Setup, Game History, and About pages.
 * 6. `styles Object`: Contains all the styling for the component, ensuring consistency with the app's visual theme.
 */