import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, Keyboard } from 'react-native';
import { MapSettings, Map, MapView, GraphicsOverlay, Graphic, geocoder } from 'expo-arcgis';
import { ARCGIS_API_KEY, ARCGIS_LICENSE_KEY, MAP_CENTER } from '../config/arcgis';

export default function TestSearch() {
  const [searchText, setSearchText] = useState('');
  const [viewpoint, setViewpoint] = useState({
    latitude: MAP_CENTER.latitude,
    longitude: MAP_CENTER.longitude,
    scale: 250000
  });
  const [markerGeometry, setMarkerGeometry] = useState(null);

  const handleSearch = async () => {
    if (!searchText) return;
    Keyboard.dismiss();
    
    try {
      const results = await geocoder.geocode(searchText);
      if (results && results.length > 0) {
        const hit = results[0];
        // GeocodeResult.location is a PointGeometry: { type: 'point', x, y }
        // where x = longitude, y = latitude
        if (hit.location) {
          setMarkerGeometry(hit.location);
          setViewpoint({
            latitude: hit.location.y,   // y = latitude
            longitude: hit.location.x,  // x = longitude
            scale: 50000 // Zoom in closer on search result
          });
        } else {
          alert('No location data for this result');
        }
      } else {
        alert('No results found');
      }
    } catch (error) {
      console.warn('Geocode error:', error);
      alert('Error during search');
    }
  };

  return (
    <View style={styles.container}>
      <MapSettings config={{ apiKey: ARCGIS_API_KEY, license: ARCGIS_LICENSE_KEY }}>
        <Map
          basemap="arcGISTopographic"
          initialViewpoint={{
            latitude: MAP_CENTER.latitude,
            longitude: MAP_CENTER.longitude,
            scale: 250000
          }}
        >
          <MapView
            style={styles.map}
            viewpoint={viewpoint}
          >
            <GraphicsOverlay>
              {markerGeometry && (
                <Graphic
                  geometry={markerGeometry}
                  symbol={{
                    type: 'simple-marker',
                    color: '#ff0000',
                    size: 12,
                    outline: { color: '#ffffff', width: 2 }
                  }}
                />
              )}
            </GraphicsOverlay>
          </MapView>
        </Map>
      </MapSettings>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search location (e.g. Cairo Tower)..."
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Button title="Search" onPress={handleSearch} />
      </View>
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
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  }
});
