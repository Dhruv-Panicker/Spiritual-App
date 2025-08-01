import { useEffect } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    // Redirect to quotes page immediately
    router.replace('/(tabs)/quotes');
  }, []);

  return null;
}