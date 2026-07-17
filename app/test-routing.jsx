import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { MapSettings, Map, MapView, GraphicsOverlay, Graphic, router as arcgisRouter } from 'expo-arcgis';
import { ARCGIS_API_KEY, ARCGIS_LICENSE_KEY, MAP_CENTER } from '../config/arcgis';

export default function TestRouting() {
  const [waypoints, setWaypoints] = useState([]);
  const [routeLine, setRouteLine] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleMapTap = (e) => {
    if (waypoints.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 waypoints allowed.');
      return;
    }
    const { mapPoint } = e.nativeEvent;
    if (mapPoint) {
      // Convert mapPoint { latitude, longitude } to PointGeometry { type: 'point', x, y }
      const pointGeometry = {
        type: 'point',
        x: mapPoint.longitude,
        y: mapPoint.latitude
      };
      setWaypoints([...waypoints, pointGeometry]);
    }
  };

  const calculateRoute = async () => {
    if (waypoints.length < 2) {
      Alert.alert('Need Waypoints', 'Please tap on the map to add at least 2 waypoints.');
      return;
    }
    
    try {
      // RouteStop requires point as PointGeometry: { type: 'point', x, y }
      const stops = waypoints.map(pt => ({ point: pt }));
      const result = await arcgisRouter.solveRoute(stops);
      
      if (result.routes && result.routes.length > 0) {
        const route = result.routes[0];
        setRouteLine(route.geometry);
        setRouteInfo({
          distance: route.totalLength,
          time: route.travelTime
        });
      }
    } catch (error) {
      console.warn('Routing error:', error);
      Alert.alert('Routing Error', 'Failed to calculate route.');
    }
  };

  const clearAll = () => {
    setWaypoints([]);
    setRouteLine(null);
    setRouteInfo(null);
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
            onTap={handleMapTap}
          >
            <GraphicsOverlay>
              {waypoints.map((pt, index) => (
                <Graphic
                  key={index}
                  geometry={pt}
                  symbol={{
                    type: 'composite',
                    symbols: [
                      {
                        type: 'simple-marker',
                        color: '#ff8800',
                        size: 20,
                        outline: { color: '#ffffff', width: 2 }
                      },
                      {
                        type: 'text',
                        text: String(index + 1),
                        color: '#ffffff',
                        size: 10
                      }
                    ]
                  }}
                />
              ))}
              
              {routeLine && (
                <Graphic
                  geometry={routeLine}
                  symbol={{
                    type: 'simple-line',
                    color: '#8800cc',
                    width: 4
                  }}
                />
              )}
            </GraphicsOverlay>
          </MapView>
        </Map>
      </MapSettings>

      <View style={styles.controlsContainer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button} onPress={calculateRoute}>
            <Text style={styles.buttonText}>Calculate Route</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearAll}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {routeInfo && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Distance: {(routeInfo.distance / 1000).toFixed(2)} km
            </Text>
            <Text style={styles.infoText}>
              Time: {Math.round(routeInfo.time)} min
            </Text>
          </View>
        )}
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
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
    marginRight: 0,
    marginLeft: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoBox: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
  }
});
