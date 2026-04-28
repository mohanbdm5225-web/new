import React from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FieldTeamView } from './components/FieldTeamView';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FieldTeamView />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}
