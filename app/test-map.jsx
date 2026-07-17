import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MapSettings, Map, MapView } from 'expo-arcgis';
import { ARCGIS_API_KEY, ARCGIS_LICENSE_KEY, MAP_CENTER } from '../config/arcgis';

export default function TestMap() {
  const [isDark, setIsDark] = useState(false);

  const toggleBasemap = () => {
    setIsDark(!isDark);
  };

  return (
    <View style={styles.container}>
      <MapSettings config={{ apiKey: ARCGIS_API_KEY, license: ARCGIS_LICENSE_KEY }}>
        <Map
          basemap={isDark ? 'arcGISDarkGray' : 'arcGISTopographic'}
          initialViewpoint={{
            latitude: MAP_CENTER.latitude,
            longitude: MAP_CENTER.longitude,
            scale: 250000 // Roughly equivalent to zoom 11
          }}
        >
          <MapView
            style={styles.map}
            onMapLoaded={() => console.log('Map loaded successfully')}
            onMapLoadError={(e) => console.warn('Map load error:', e.nativeEvent.message)}
          />
        </Map>
      </MapSettings>

      <TouchableOpacity style={styles.toggleButton} onPress={toggleBasemap}>
        <Text style={styles.buttonText}>
          Switch to {isDark ? 'Light' : 'Dark'} Basemap
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  toggleButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
