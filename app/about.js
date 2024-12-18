import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Share, Platform } from 'react-native';
import { useNavigation } from 'expo-router';

/**
 * About Page Component
 * 
 * This component serves as the "About" page for the app. It provides information about the app,
 * along with options to contact support, rate the app, and share it with others.
 */
export default function AboutPage() {
  const navigation = useNavigation(); // Used for styling navigation bar

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
   * handleContactSupport Function
   * 
   * Opens the default email client with a pre-filled email to the support address
   * when the user presses the "Contact Support" button.
   */
  const handleContactSupport = () => {
    const email = 'jgdevelopmentsupport@protonmail.com';
    const subject = 'Support Request';
    const body = 'Please describe your issue or feedback here.';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(mailtoUrl).catch((error) =>
      Alert.alert('Error', 'Unable to open email client. Please check your email configuration.')
    );
  };

  /**
   * handleRateApp Function
   * 
   * Opens the app rating dialog when the user presses the "Rate" button.
   * It uses the `StoreReview` API from Expo to prompt the user to rate the app.
   */
  const handleRateApp = () => {
    const expoGoAppStoreUrl = 'https://apps.apple.com/us/app/expo-go/id982107779';

    if (Platform.OS === 'ios') {
      Linking.openURL(expoGoAppStoreUrl).catch(() => {
        Alert.alert('Error', 'Unable to open the App Store.');
      });
    } else {
      Alert.alert('Not Supported', 'Rating is only available on iOS devices.');
    }
  };

  /**
   * handleShareApp Function
   * 
   * Triggers the share functionality when the user presses the "Share" button.
   * It creates a shareable message that includes the app name, a brief description, and a placeholder link.
   */
  const handleShareApp = async () => {
    try {
      const message = `Check out this interactive dart cricket scoreboard mobile app! Download it here: http://example.com/DartCricketScoreboard`;
      const result = await Share.share({
        message: `Dart Cricket Scoreboard: ${message}`,
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
        } else {
          // Shared without specifying activity type
        }
      } else if (result.action === Share.dismissedAction) {
        // The share action was dismissed by the user
      }
    } catch (error) {
      console.error('Error sharing the app:', error);
    }
  };

  return (
    <View style={styles.container}>

      {/* Contact Support Button: Triggers the handleContactSupport function */}
      <TouchableOpacity style={styles.button} onPress={handleContactSupport}>
        <Text style={styles.buttonText}>Contact Support</Text>
      </TouchableOpacity>

      {/* Rate App Button: Triggers the handleRateApp function */}
      <TouchableOpacity style={styles.button} onPress={handleRateApp}>
        <Text style={styles.buttonText}>Rate</Text>
      </TouchableOpacity>

      {/* Share Button: Triggers the handleShare function */}
      <TouchableOpacity style={styles.button} onPress={handleShareApp}>
        <Text style={styles.buttonText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Styles
 * 
 * The styles object contains the styling for the About page. This includes layout settings,
 * typography, and color schemes for the various elements within the page.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AAFFAA', // Light green background
    alignItems: 'center',
    paddingTop: 220, // Padding to position the buttons in the center vertically
  },
  button: {
    backgroundColor: '#00BFFF', // Bright blue color for buttons
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

/**
 * about.js Explanation:
 * 
 * 1. `About Page Component`: Main component for the About page, displaying the app's information and providing options like sharing, contacting support, and rating the app.
 * 2. `handleContactSupport Function`: Opens the user's default email client with a pre-filled email to contact support.
 * 3. `handleRateApp Function`: Uses Expo's `StoreReview` API to prompt the user to rate the app if the rating feature is available on the device.
 * 4. `handleShare Function`: Manages the share functionality using React Native's `Share` API, allowing users to share information about the app.
 * 5. `styles Object`: Defines the layout, typography, and color schemes for the About page, ensuring consistency with the app's overall design.
 * 6. `useLayoutEffect`: A React hook used to customize the navigation bar:
 *    - `headerStyle`: Sets the background color of the navigation bar to match the page.
 *    - `headerTitle`: Removes the title text from the navigation bar for a minimalist appearance.
 */