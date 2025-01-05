import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Rating } from 'react-native-ratings';
import AuthContext from "../../../context/AuthContext";
import axios from "../../../utils/axios";

const ReviewsModal = ({ visible, onClose, propertyId, propertyName }) => {
  const { user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (visible) {
      fetchReviews();
    }
  }, [visible, propertyId]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/properties/${propertyId}/reviews`);
      setReviews(response.data.reviews);

      // Calculate average rating
      if (response.data.reviews.length > 0) {
        const avg =
          response.data.reviews.reduce(
            (acc, review) => acc + parseFloat(review.rating),
            0
          ) / response.data.reviews.length;
        setAverageRating(avg);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    }
  };

  const handleSubmitReview = async () => {
    if (!rating) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`/properties/${propertyId}/reviews`, {
        rating: rating.toString(),
        comment,
        user_id: user.id,
      });

      Alert.alert('Success', 'Review submitted successfully');
      setRating(0);
      setComment('');
      fetchReviews();
    } catch (error) {
      if (error.response?.status === 422) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>{item.user.name}</Text>
        <Rating
          readonly
          startingValue={parseFloat(item.rating)}
          imageSize={20}
          style={styles.rating}
        />
      </View>
      <Text style={styles.reviewDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
      {item.comment && (
        <Text style={styles.reviewComment}>{item.comment}</Text>
      )}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{propertyName}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* Average Rating */}
        <View style={styles.averageRatingContainer}>
          <Text style={styles.averageRatingText}>
            Average Rating: {averageRating.toFixed(1)}
          </Text>
          <Rating
            readonly
            startingValue={averageRating}
            imageSize={25}
            style={styles.averageRatingStars}
          />
          <Text style={styles.totalReviews}>
            ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
          </Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Submit Review Section */}
          <View style={styles.submitReviewContainer}>
            <Text style={styles.submitTitle}>Write a Review</Text>
            <Rating
              showRating
              onFinishRating={setRating}
              style={styles.ratingInput}
              startingValue={rating}
            />
            <TextInput
              style={styles.commentInput}
              placeholder="Write your review here (optional)"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          <Text style={styles.reviewsListTitle}>All Reviews</Text>
          {reviews.length === 0 ? (
            <Text style={styles.emptyText}>
              No reviews yet. Be the first to review!
            </Text>
          ) : (
            reviews.map((review, index) => (
              <View key={review.id || index}>{renderReview({ item: review })}</View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  averageRatingContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  averageRatingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  averageRatingStars: {
    marginBottom: 8,
  },
  totalReviews: {
    color: '#666',
    fontSize: 16,
  },
  submitReviewContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  submitTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ratingInput: {
    paddingVertical: 10,
  },
  commentInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  rating: {
    alignItems: 'flex-start',
  },
  reviewDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 16,
    lineHeight: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default ReviewsModal;
