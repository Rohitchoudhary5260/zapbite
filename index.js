/**
 * Zaptite Customer App
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register both names so currently running APK and new builds both work seamlessly
AppRegistry.registerComponent('youtube', () => App);
AppRegistry.registerComponent('zaptite', () => App);

if (appName && appName !== 'youtube' && appName !== 'zaptite') {
  AppRegistry.registerComponent(appName, () => App);
}
