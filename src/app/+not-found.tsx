import { Redirect } from 'expo-router';

// An unknown address shows no text and no route list: back to the home (securite.md §3).
export default function NotFound() {
  return <Redirect href="/" />;
}
