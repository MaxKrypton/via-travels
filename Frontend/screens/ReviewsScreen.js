import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Platform,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
  ScrollView
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { data } from "../data/reviewdata";
import * as ImagePicker from 'expo-image-picker';
import axios from "axios";
import AuthContext from "../context/AuthContext";

const { width, height } = Dimensions.get('window');

const ReviewsScreen = () => {
  const [comment, setComment] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const {currentID, ip, userId, setReview, review} = useContext(AuthContext);
  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaModalVisible, setMediaModalVisible] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openMediaPreview = (mediaUri) => {
    if (!mediaUri) {
      console.warn('No media URI provided for preview');
      return;
    }
    setSelectedMedia(mediaUri);
    setMediaModalVisible(true);
  };

  const closeMediaPreview = () => {
    setSelectedMedia(null);
    setMediaModalVisible(false);
  };

  const fetchReviews = async () => {
    try {
      const getUrl = `http://${ip}:8000/api/v1/hotels/reviews/all-reviews`;
      console.log('Fetching reviews from:', getUrl);
      
      const response = await axios.get(getUrl);
      console.log('Reviews response:', response.data);
      
      const reviews = response.data.data || response.data;
      const reviewsArray = Array.isArray(reviews) ? reviews : [];
      setAllReviews(reviewsArray);
      setReview(reviews);
      console.log(review)
      
      filterReviewsByHotel(reviewsArray);
      
    } catch (error) {
      console.error('Error fetching reviews:', error.response?.data || error.message);
      Alert.alert("Error", "Failed to load reviews. Please try again.");
    }
  };

  const filterReviewsByHotel = (reviews) => {
    if (!currentID) {
      console.log('No currentID provided, showing all reviews');
      setFilteredReviews(reviews);
      return;
    }

    const hotelReviews = reviews.filter(review => {
      const reviewHotelId = review.hotelId || review.hotel_id || review.hotelID;
      const matches = reviewHotelId === currentID;
      
      if (matches) {
        console.log(`Review ${review.reviewId} matches hotel ${currentID}`);
      }
      
      return matches;
    });

    console.log(`Filtered ${hotelReviews.length} reviews for hotel ${currentID} out of ${reviews.length} total reviews`);
    setFilteredReviews(hotelReviews);
  };

  const pickFile = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your media library to upload files.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      maxFiles: 3,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newAttachments = [...attachments];
      result.assets.forEach((asset) => {
        if (newAttachments.length < 3) {
          newAttachments.push(asset);
        }
      });
      
      setAttachments(newAttachments.slice(0, 3));
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const renderRatingInput = () => {
    return (
      <View style={styles.ratingInputContainer}>
        <Text style={styles.ratingLabel}>Your Rating:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity 
              key={star} 
              onPress={() => setUserRating(star)}
              style={styles.starButton}
            >
              <Text style={[
                styles.star, 
                {color: star <= userRating ? '#FFB300' : '#C5CEE0'}
              ]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const numericRating = parseFloat(rating);
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push("★");
    }
    
    if (hasHalfStar) {
      stars.push("★");
    }
    
    while (stars.length < 5) {
      stars.push("☆");
    }
    
    return (
      <Text style={styles.ratingStars}>
        {stars.join('')}
      </Text>
    );
  };

  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        <Text style={styles.attachmentsLabel}>Attachments ({attachments.length}/3):</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.attachmentsScrollView}
        >
          {attachments.map((file, index) => (
            <View key={index} style={styles.attachmentItem}>
              <TouchableOpacity onPress={() => openMediaPreview(file.uri)}>
                <Image 
                  source={{ uri: file.uri }} 
                  style={styles.attachmentThumbnail} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeAttachmentButton}
                onPress={() => removeAttachment(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderMediaModal = () => {
    if (!selectedMedia) return null;
    
    return (
      <Modal
        visible={mediaModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeMediaPreview}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalCloseArea} 
            onPress={closeMediaPreview}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeMediaPreview}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              <Image 
                source={{ uri: selectedMedia }} 
                style={styles.fullScreenImage}
                resizeMode="contain"
                onError={(error) => {
                  console.error('Error loading image:', error);
                  Alert.alert('Error', 'Failed to load image');
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const renderReviewItem = ({ item }) => {
    const mediaUrls = [item.mediaUrl];
    
    try {
      if (item?.mediaUrl) {
        if (typeof item.mediaUrl === 'string') {
          mediaUrls.push(item.mediaUrl);
        } else if (Array.isArray(item.mediaUrl)) {
          mediaUrls.push(...item.mediaUrl.filter(url => url && typeof url === 'string'));
        }
      }
      
      if (item?.media && Array.isArray(item.media)) {
        mediaUrls.push(...item.media.filter(url => url && typeof url === 'string'));
      }
      
      if (item?.attachments && Array.isArray(item.attachments)) {
        mediaUrls.push(...item.attachments.filter(url => url && typeof url === 'string'));
      }

      if (item?.images && Array.isArray(item.images)) {
        mediaUrls.push(...item.images.filter(url => url && typeof url === 'string'));
      }

    } catch (error) {
      console.error('Error processing media URLs for review:', item?.reviewId, error);
    }

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <Image 
            source={{ uri: item?.profile || 'https://rentals-app-bucket.s3.eu-north-1.amazonaws.com/1751995971866-free-user-icon-3296-thumb.png' }} 
            style={styles.profileImage}
            onError={(error) => console.warn('Profile image failed to load')}
          />
          <View style={styles.reviewerInfo}>
            <Text style={styles.reviewerName}>{item?.username || 'Anonymous User'}</Text>
            <View style={styles.dateRatingContainer}>
              <Text style={styles.reviewDate}>
                {item?.createdAt ? formatDate(item.createdAt) : 'Unknown date'}
              </Text>
              {item?.rating && renderRatingStars(item.rating)}
            </View>
          </View>
        </View>
        <Text style={styles.reviewText}>{item?.reviewText || 'No review text'}</Text>
        
        {mediaUrls.length > 0 && (
          <View style={styles.reviewAttachmentsContainer}>
            <Text style={styles.mediaLabel}>
              {mediaUrls.length} {mediaUrls.length === 1 ? 'Photo' : 'Photos'}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.mediaScrollView}
            >
              {mediaUrls.map((mediaUri, index) => (
                <TouchableOpacity
                  key={`media-${index}`}
                  onPress={() => openMediaPreview(mediaUri)}
                  style={styles.mediaItemContainer}
                >
                  <Image 
                    source={{ uri: `${mediaUri}` }} 
                    style={styles.reviewAttachmentImage}
                    onError={(error) => console.warn('Review media failed to load:', mediaUri)}
                  />
                  {mediaUrls.length > 1 && (
                    <View style={styles.mediaCountBadge}>
                      <Text style={styles.mediaCountText}>{index + 1}/{mediaUrls.length}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {mediaUrls.length > 3 && (
              <Text style={styles.moreMediaText}>
                Tap to view all {mediaUrls.length} photos
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const handlePost = async () => {
    if (!comment.trim() || userRating === 0) {
      Alert.alert("Missing Information", "Please provide both a rating and review text.");
      return;
    }

    if (!currentID) {
      Alert.alert("Error", "Hotel ID is missing. Please try again.");
      return;
    }

    setLoading(true);

    try {
      let requestData;
      let headers = {};

      if (attachments && attachments.length > 0) {
        requestData = new FormData();
        requestData.append('rating', userRating.toString());
        requestData.append('review_text', comment.trim());
        
        attachments.forEach((file, index) => {
          requestData.append('media', {
            uri: file.uri,
            type: file.type || 'image/jpeg',
            name: file.fileName || `image_${index}.jpg`,
          });
        });

        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = {
          rating: userRating,
          review_text: comment.trim(),
        };
        headers['Content-Type'] = 'application/json';
      }

      console.log('Posting review to:', `http://${ip}:8000/api/v1/hotels/reviews/create/${currentID}`);

      const response = await axios.post(
        `http://${ip}:8000/api/v1/hotels/reviews/create/${currentID}`,
        requestData,
        { headers }
      );

      console.log('Post response:', response.data);

      setComment("");
      setUserRating(0);
      setAttachments([]);
      
      Alert.alert("Success", "Your review has been posted!");
      await fetchReviews();
      
    } catch (error) {
      console.error('Error posting review:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Server error: ${error.response.status}`;
        Alert.alert("Error", errorMessage);
      } else if (error.request) {
        Alert.alert("Network Error", "Please check your internet connection and try again.");
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ip) {
      fetchReviews();
    }
  }, [ip]);

  useEffect(() => {
    if (allReviews.length > 0) {
      filterReviewsByHotel(allReviews);
    }
  }, [currentID]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Reviews {currentID && filteredReviews.length > 0 && `(${filteredReviews.length})`}
        </Text>
      </View>
      
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewItem}
        keyExtractor={(item) => item.reviewId || item.id || Math.random().toString()}
        contentContainerStyle={styles.reviewsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {currentID ? "No reviews yet for this hotel" : "No reviews available"}
            </Text>
            <Text style={styles.emptySubtext}>
              {currentID ? "Be the first to leave a review!" : "Please select a hotel to view reviews"}
            </Text>
          </View>
        )}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.commentContainer}
      >
        {renderRatingInput()}
        
        <TextInput
          placeholder="Share your thoughts..."
          style={styles.commentInput}
          multiline={true}
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#8F9BB3"
          editable={!loading}
        />
        
        {renderAttachments()}
        
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity 
            style={[styles.attachButton, {opacity: loading ? 0.5 : 1}]}
            onPress={pickFile}
            disabled={loading}
          >
            <Text style={styles.attachButtonText}>
              {attachments.length > 0 
                ? `Files (${attachments.length}/3)` 
                : "Attach Files"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handlePost}
            style={[
              styles.postButton, 
              { 
                opacity: (comment.trim().length > 0 && userRating > 0 && !loading) ? 1 : 0.5,
                flex: 2
              }
            ]}
            disabled={comment.trim().length === 0 || userRating === 0 || loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? "Posting..." : "Post Review"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      
      {renderMediaModal()}
    </SafeAreaView>
  );
};

export default ReviewsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E9F2",
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222B45",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#8F9BB3",
    marginTop: 4,
  },
  reviewsList: {
    paddingHorizontal: 16,
    paddingBottom: 220,
  },
  reviewCard: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reviewerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222B45",
  },
  dateRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 14,
    color: "#8F9BB3",
    marginRight: 8,
  },
  ratingStars: {
    fontSize: 14,
    color: "#FFB300",
  },
  reviewText: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    color: "#2E3A59",
  },
  reviewAttachmentsContainer: {
    marginTop: 12,
  },
  mediaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8F9BB3',
    marginBottom: 8,
  },
  mediaScrollView: {
    flexDirection: 'row',
  },
  mediaItemContainer: {
    position: 'relative',
    marginRight: 8,
  },
  reviewAttachmentImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  mediaCountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  mediaCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moreMediaText: {
    fontSize: 12,
    color: '#1995AD',
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  commentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E4E9F2",
  },
  ratingInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222B45",
    marginRight: 12,
  },
  starsContainer: {
    flexDirection: "row",
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 24,
  },
  commentInput: {
    height: 80,
    borderWidth: 1,
    borderColor: "#E4E9F2",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F7F9FC",
    textAlignVertical: "top",
  },
  attachmentsContainer: {
    marginTop: 12,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222B45',
    marginBottom: 8,
  },
  attachmentsScrollView: {
    flexDirection: 'row',
  },
  attachmentItem: {
    position: "relative",
    marginRight: 8,
  },
  attachmentThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeAttachmentButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF3D71",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtonsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  attachButton: {
    backgroundColor: "#E4E9F2",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flex: 1,
  },
  attachButtonText: {
    color: "#2E3A59",
    fontSize: 16,
    fontWeight: "500",
  },
  postButton: {
    backgroundColor: "#1995AD",
    borderRadius: 12,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  postButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8F9BB3',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C5CEE0',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.95,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: -20,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});