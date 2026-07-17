import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MapSettings, Map, MapView, FeatureLayer } from 'expo-arcgis';
import { ARCGIS_API_KEY, ARCGIS_LICENSE_KEY, MAP_CENTER, FEATURE_LAYERS } from '../config/arcgis';

export default function TestLayers() {
  const mapViewRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);

  const handleMapTap = async (e) => {
    try {
      if (!mapViewRef.current) return;
      
      const { screenPoint } = e.nativeEvent;
      // identify returns IdentifyResult[] — one per layer with hits
      const results = await mapViewRef.current.identify(screenPoint, {
        tolerance: 12,
        maxResults: 1
      });
      
      // Find the metro_stations layer results
      if (results && results.length > 0) {
        // Look through all layer results for station features
        for (const layerResult of results) {
          if (layerResult.features && layerResult.features.length > 0) {
            const feature = layerResult.features[0];
            setSelectedStation(feature.attributes);
            return;
          }
        }
        setSelectedStation(null);
      } else {
        setSelectedStation(null);
      }
    } catch (error) {
      console.warn('Identify error:', error);
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
          <FeatureLayer
            url={FEATURE_LAYERS.metroLines}
            renderer={{
              type: 'simple',
              symbol: {
                type: 'simple-line',
                color: '#00cc00',
                width: 2
              }
            }}
          />
          <FeatureLayer
            url={FEATURE_LAYERS.metroStations}
            renderer={{
              type: 'simple',
              symbol: {
                type: 'simple-marker',
                color: '#0055ff',
                size: 6,
                outline: { color: '#000000', width: 1 }
              }
            }}
          />
          <MapView
            ref={mapViewRef}
            style={styles.map}
            onTap={handleMapTap}
          />
        </Map>
      </MapSettings>

      {selectedStation && (
        <View style={styles.popup}>
          <Text style={styles.popupTitle}>{selectedStation.Name || 'Unknown Station'}</Text>
          <Text style={styles.popupText}>Status: {selectedStation.status || 'N/A'}</Text>
          <Text style={styles.popupText}>Line: {selectedStation.LineNumber || 'N/A'}</Text>
          <Text style={styles.popupText}>Level: {selectedStation.StationLev || 'N/A'}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedStation(null)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
  popup: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  popupText: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  }
});
