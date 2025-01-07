import React, { useContext, useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  FlatList,
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import AuthContext from "../../context/AuthContext";
import { logout } from "../../services/AuthService";
import axios from "../../utils/axios";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import ReservationModal from "./components/ReservationModal";
import { useIsFocused } from "@react-navigation/native";
import ReviewsModal from "./components/ReviewModal";
import SplashScreen from "./SplashScreen";
import * as Location from "expo-location";

export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const mapRef = useRef(null);

  // Reservation state
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const isFocused = useIsFocused();

  const PHOTO_BASE_URL = "https://agusandelsur.boardinghouse.site/storage/";
  const GOOGLE_MAPS_API_KEY = 'AIzaSyD5uhjeX0EkDTz7mEoA0oYEXOpu54QxnVI';

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  useEffect(() => {
    async function fetchProperties() {
      if (isFocused) {
        setLoading(true);
        try {
          const response = await axios.get("/properties");
          setProperties(response.data.properties);
          setFilteredProperties(response.data.properties);
        } catch (error) {
          console.error("Failed to fetch properties:", error);
          Alert.alert("Error", "Failed to fetch properties");
        } finally {
          setLoading(false);
        }
      }
    }

    fetchProperties();
  }, [isFocused]);

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterProperties(text, selectedCategory);
  };

  const filterProperties = (text, category) => {
    let filtered = properties;

    if (text.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    if (category !== "") {
      filtered = filtered.filter((item) => item.room_type === category);
    }

    setFilteredProperties(filtered);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    filterProperties(searchQuery, category);
  };

  const getUserLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleViewMap = async (id) => {
    try {
      const response = await axios.get(`/properties_map/${id}`);
      const { location } = response.data;

      const propertyLocation = {
        latitude: parseFloat(location.lat),
        longitude: parseFloat(location.long),
      };

      setSelectedLocation(propertyLocation);

      if (userLocation) {
        try {
          const directionsResponse = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${propertyLocation.latitude},${propertyLocation.longitude}&key=${GOOGLE_MAPS_API_KEY}`
          );

          const directionsData = await directionsResponse.json();

          if (
            directionsData.status === "OK" &&
            directionsData.routes.length > 0
          ) {
            const route = directionsData.routes[0];
            const points = decodePolyline(route.overview_polyline.points);
            setDirections(points);

            const leg = route.legs[0];
            Alert.alert(
              "Route Information",
              `Distance: ${leg.distance.text}\nEstimated Time: ${leg.duration.text}`
            );
          } else {
            Alert.alert("Error", "Could not find directions to this location");
          }
        } catch (error) {
          console.error("Directions API error:", error);
          Alert.alert("Error", "Failed to get directions. Please try again.");
        }
      } else {
        Alert.alert(
          "Location Required",
          "Please enable location services to view directions"
        );
      }

      setShowMap(true);
    } catch (error) {
      console.error("Failed to fetch property location:", error);
      Alert.alert("Error", "Failed to load map location. Please try again.");
    }
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      const response = await axios.post("/reservations", reservationData);
      Alert.alert("Success", "Reservation submitted successfully");
      setShowReservationModal(false);
    } catch (error) {
      console.error(
        "Failed to submit reservation:",
        error.response?.data || error
      );
      Alert.alert("Error", "Failed to submit reservation. Please try again.");
    }
  };

  function decodePolyline(encoded) {
    const poly = [];
    let index = 0,
      len = encoded.length;
    let lat = 0,
      lng = 0;

    while (index < len) {
      let b,
        shift = 0,
        result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charAt(index++).charCodeAt(0) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) != 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      poly.push({
        latitude: lat / 1e5,
        longitude: lng / 1e5,
      });
    }
    return poly;
  }

  const MapModal = () => (
    <Modal
      visible={showMap}
      animationType="slide"
      onRequestClose={() => setShowMap(false)}
    >
      <View style={styles.mapContainer}>
        {selectedLocation && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {userLocation && (
              <Marker
                coordinate={userLocation}
                title="Your Location"
                pinColor="blue"
                description="You are here"
              />
            )}
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                title="Property Location"
                description="Destination"
              />
            )}
            {directions && (
              <Polyline
                coordinates={directions}
                strokeWidth={4}
                strokeColor="#007bff"
                strokeColors={["#7F0000"]}
                geodesic={true}
              />
            )}
          </MapView>
        )}
        <View style={styles.mapButtons}>
          <TouchableOpacity
            style={styles.recenterButton}
            onPress={() => {
              if (selectedLocation && mapRef.current) {
                mapRef.current.animateToRegion({
                  ...selectedLocation,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                });
              }
            }}
          >
            <Text style={styles.buttonText}>Recenter</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowMap(false)}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Boarding Houses</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search by property name..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      <View style={styles.categoryContainer}>
        {["studio", "pad", "apartment", "room only"].map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredProperties}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.propertyCard}>
            <Text style={styles.propertyTitle}>{item.name}</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageCarousel}
            >
              {item.photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{ uri: `${PHOTO_BASE_URL}${photo}` }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            <View style={styles.propertyDetails}>
              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Price:</Text>
                <Text style={styles.propertyPrice}>
                  ₱{Number(item.price).toLocaleString("en-PH")}
                </Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Address:</Text>
                <Text style={styles.propertyDetailText}>
                  {item.address || "Not provided"}
                </Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Room Type:</Text>
                <Text style={styles.propertyDetailText}>{item.room_type}</Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Capacity:</Text>
                <Text style={styles.propertyDetailText}>
                  {item.persons_per_room} persons
                </Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Amenities:</Text>
                <Text style={styles.propertyDetailText}>
                  {item.amenities
                    .map((amenity) => amenity.amenity)
                    .join(", ") || "None"}
                </Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Posted by:</Text>
                <Text style={styles.propertyDetailText}>{item.user.name}</Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Contact:</Text>
                <Text style={styles.propertyDetailText}>
                  {item.contact_number}
                </Text>
              </View>

              <View style={styles.propertyDetailRow}>
                <Text style={styles.propertyDetailLabel}>Status:</Text>
                <Text
                  style={[
                    styles.propertyStatus,
                    {
                      color:
                        item.availability_status === "Available"
                          ? "green"
                          : "red",
                    },
                  ]}
                >
                  {item.availability_status}
                </Text>
              </View>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleViewMap(item.id)}
                >
                  <Text style={styles.linkText}>View Map Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButtonReserve}
                  onPress={() => {
                    setSelectedProperty(item);
                    setShowReservationModal(true);
                  }}
                >
                  <Text style={styles.linkText}>Reserve</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.linkButton, { backgroundColor: "#007bff" }]}
                  onPress={() => {
                    setSelectedProperty(item);
                    setShowReviewsModal(true);
                  }}
                >
                  <Text style={styles.linkText}>Reviews</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No properties found.</Text>
        }
      />

      <MapModal />

      <ReservationModal
        visible={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        property={selectedProperty}
        onSubmit={handleReservationSubmit}
      />

      <ReviewsModal
        visible={showReviewsModal}
        onClose={() => setShowReviewsModal(false)}
        propertyId={selectedProperty?.id}
        propertyName={selectedProperty?.name}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginTop: 10,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333",
  },
  searchBar: {
    backgroundColor: "#fff",
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
  },
  categoryButtonSelected: {
    backgroundColor: "#007bff",
  },
  categoryText: {
    fontSize: 16,
    color: "#333",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  propertyCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  propertyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    padding: 16,
    paddingBottom: 0,
  },
  imageCarousel: {
    marginTop: 16,
    marginBottom: 16,
  },
  carouselImage: {
    width: width - 64,
    height: 250,
    borderRadius: 12,
    marginRight: 16,
  },
  propertyDetails: {
    padding: 16,
    paddingTop: 0,
  },
  propertyDetailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  buttonGroup: {
  flexDirection: "column",
  marginBottom: 10,
},
  propertyDetailLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginRight: 10,
    width: 120,
  },
  propertyDetailText: {
    fontSize: 18,
    color: "#333",
    flex: 1,
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#28a745",
  },
  propertyStatus: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#dc3545",
  },
  emptyListText: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 50,
    color: "#666",
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "red",
    marginRight: 10,
    marginTop: 10,
  },
  linkButtonReserve: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "green",
    marginRight: 10,
    marginTop: 10,
  },
  linkText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  mapButtons: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  recenterButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    padding: 15,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
