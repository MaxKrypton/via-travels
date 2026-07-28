import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const FALLBACK_PROFILE_IMAGE =
  "https://rentals-app-bucket.s3.eu-north-1.amazonaws.com/1751995971866-free-user-icon-3296-thumb.png";

const Reviews = ({ hotelId, limit = 2 }) => {
  const { ip } = useContext(AuthContext);
  const [reviewData, setReviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  useEffect(() => {
    let isMounted = true;

    const fetchHotelReviews = async () => {
      if (!hotelId || !ip) {
        setReviewData([]);
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://${ip}:8000/api/v1/hotels/reviews/hotel/${hotelId}`
        );
        const reviews = response.data?.data || response.data;
        const reviewsArray = Array.isArray(reviews) ? reviews : [];

        if (isMounted) {
          setReviewData(reviewsArray.slice(0, limit));
        }
      } catch (error) {
        console.log(
          "Error fetching hotel reviews",
          error.response?.data || error.message
        );
        if (isMounted) {
          setReviewData([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchHotelReviews();

    return () => {
      isMounted = false;
    };
  }, [hotelId, ip, limit]);

  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderReview = (item, index) => {
    const rating = Number(item.rating) || 0;
    const reviewerName = item.username || item.name || "Guest";
    const reviewText =
      item.reviewText || item.review_text || item.review || "No review text.";
    const profileImage =
      item.profile || item.profileImage || FALLBACK_PROFILE_IMAGE;
    const createdAt = formatDate(item.createdAt || item.created_at);

    return (
      <View
        key={item.reviewId || item.id || `${reviewerName}-${index}`}
        style={[styles.card, index > 0 && styles.stackedCard]}
      >
        <View style={styles.header}>
          <Image source={{ uri: profileImage }} style={styles.avatar} />
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {reviewerName}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.stars}>
                {stars.map((star) => (
                  <FontAwesome
                    key={star}
                    name="star"
                    size={13}
                    color={star <= rating ? "#FFB800" : "#D7DCE2"}
                    style={styles.star}
                  />
                ))}
              </View>
              {!!createdAt && <Text style={styles.date}>{createdAt}</Text>}
            </View>
          </View>
        </View>
        <Text style={styles.review}>{reviewText}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color="#1995AD" />
        <Text style={styles.stateText}>Loading reviews...</Text>
      </View>
    );
  }

  if (!reviewData.length) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.emptyTitle}>No reviews yet</Text>
        <Text style={styles.emptyText}>
          Guest reviews for this hotel will appear here.
        </Text>
      </View>
    );
  }

  return <View>{reviewData.map(renderReview)}</View>;
};

export default Reviews;

const styles = StyleSheet.create({
  card: {
    borderColor: "#E1E6EA",
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },
  stackedCard: {
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EEF1F3",
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#1A1A1A",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 6,
    gap: 8,
  },
  stars: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
  date: {
    fontSize: 12,
    color: "#7B8790",
  },
  review: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    color: "#444",
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 96,
    marginRight: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E1E6EA",
    borderWidth: 1,
  },
  stateText: {
    marginTop: 8,
    color: "#6B747C",
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  emptyText: {
    marginTop: 6,
    textAlign: "center",
    color: "#6B747C",
    fontSize: 14,
  },
});
