import React, { useState, useEffect } from 'react';
import { useFocusEffect  } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import axios from '../../utils/axios';
import SplashScreen from './SplashScreen';

export default function ReservationScreen() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('/reservations');
      setReservations(response.data.reservations);
      console.log('Response:', response.data.reservations);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      Alert.alert('Error', 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      fetchReservations();
    }, [])
  );

  const handleDelete = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to cancel this reservation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/reservations/${id}`);
              Alert.alert('Success', 'Reservation cancelled successfully');
              fetchReservations(); // Refresh the list
            } catch (error) {
              console.error('Failed to delete reservation:', error);
              Alert.alert('Error', 'Failed to cancel reservation');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.propertyName}>{item.property.name}</Text>
        <Text style={styles.statusBadge(item.status)}>
          {item.status.toUpperCase()}
        </Text>
      </View>
  
      <View style={styles.cardBody}>
        <Text style={styles.label}>Date Reserved:</Text>
        <Text style={styles.value}>
          {new Date(item.date_reserved).toLocaleDateString()}
        </Text>
  
        <Text style={styles.label}>Message:</Text>
        <Text style={styles.value}>{item.description}</Text>
  
        <Text style={styles.label}>Property Address:</Text>
        <Text style={styles.value}>{item.property.address}</Text>

        <Text style={styles.label}>Contact Number:</Text>
        <Text style={styles.value}>{item.property.contact_number}</Text>
      </View>
  
      {item.status.toLowerCase() === 'reserved' && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Please call the landlord / landlady for your appointment visit.
          </Text>
        </View>
      )}
  
      <TouchableOpacity
        style={[
          styles.deleteButton,
          item.status.toLowerCase() === 'reserved' && styles.disabledButton
        ]}
        onPress={() => handleDelete(item.id)}
        disabled={item.status.toLowerCase() === 'reserved'}
      >
        <Text style={[
          styles.deleteButtonText,
          item.status.toLowerCase() === 'reserved' && styles.disabledButtonText
        ]}>
          Cancel Reservation
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SplashScreen/>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Reservations</Text>
      <FlatList
        data={reservations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No reservations found</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    marginTop:10,
    color: '#333',
    backgroundColor: "#ffffff",
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  propertyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: (status) => ({
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: status === 'pending' ? '#ffc107' : '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  }),
  cardBody: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#e9ecef',  
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#6c757d', 
  },
  warningContainer: {
    backgroundColor: '#fff3cd',  
    borderColor: '#ffeeba',      
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  warningText: {
    color: '#856404',           
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});