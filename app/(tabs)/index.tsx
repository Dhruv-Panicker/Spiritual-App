import { useEffect } from 'react';
import { router } from 'expo-router';

export default function IndexScreen() {
  useEffect(() => {
    // Redirect to quotes page immediately
    router.replace('/quotes');
  }, []);

  return null;
}