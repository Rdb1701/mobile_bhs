import React, { useContext, useEffect, useState } from "react";
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
} from "react-native";
import AuthContext from "../../context/AuthContext";
import { logout } from "../../services/AuthService";
import axios from "../../utils/axios";
// import MapboxGL from '@react-native-mapbox-gl/maps';


export default function HomeScreen() {
  const { user, setUser } = useContext(AuthContext);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const PHOTO_BASE_URL = "http://192.168.254.103:8000/storage/";


  async function handleLogout() {
    await logout();
    setUser(null);
  }

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await axios.get("/properties");
        setProperties(response.data.properties);
        setFilteredProperties(response.data.properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome, {user.name}</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by property name..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Categories */}
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
                <Text style={styles.propertyPrice}>${item.price}</Text>
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

              {/* Add the links for View Map Location and Reserve */}
              <View style={styles.propertyDetailRow}>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => {
                    /* Handle View Map Location */
                  }}
                >
                  <Text style={styles.linkText}>View Map Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                style={styles.linkButtonReserve}
                onPress={() => handleViewMapLocation(item.lat, item.long)}
              >
                  <Text style={styles.linkText}>Reserve</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>No properties found.</Text>
        }
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
    padding: 20,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    fontSize: 28,
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
});
