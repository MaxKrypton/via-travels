import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  Image,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Video, ResizeMode, Audio } from "expo-av";
import { useCallback, useState, useRef, useEffect, memo, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from "axios";
import AuthContext from "../context/AuthContext";

// Animated Like Button Component
const AnimatedLikeButton = ({ isLiked, onPress, likesCount }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.sidebarItem} onPress={handlePress}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <MaterialIcons
          name={isLiked ? "favorite" : "favorite-border"}
          size={32}
          color={isLiked ? "#FF3B30" : "white"}
        />
      </Animated.View>
      <Text style={styles.iconText}>{likesCount || 0}</Text>
    </TouchableOpacity>
  );
};

// Memoized Video Item Component
const VideoItem = memo(({
  item,
  index,
  width,
  height,
  videoRef,
  onPress,
  isActive,
  onLike,
  onSave,
  onBook,
  isLiked,
  isSaved
}) => {
  return (
    <View style={{ width, height }}>
      <Video
        ref={videoRef}
        style={[StyleSheet.absoluteFill, styles.video]}
        source={{ uri: item.video_url }}
        isLooping={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive}
        isMuted={false}
        volume={1.0}
        useNativeControls={false}
        posterSource={item.thumbnail ? { uri: item.thumbnail } : null}
        usePoster={!!item.thumbnail}
      />

      <Pressable onPress={() => onPress(index)} style={styles.content}>
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.95)"]}
          style={styles.gradientOverlay}
        >
          {/* Top header with blur effect */}
          <View style={styles.headerContainer}>
            <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
              <View style={styles.header}>
                <Text style={styles.headerText}>Discover</Text>
                <TouchableOpacity style={styles.cameraButton}>
                  <Feather name="camera" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </BlurView>
          </View>

          {/* Right sidebar with actions */}
          <View style={styles.sidebar}>
            {/* Like Button */}
            <AnimatedLikeButton
              isLiked={isLiked}
              onPress={() => onLike(item.id)}
              likesCount={item.likes_count}
            />

            {/* Comment Button */}
            <TouchableOpacity style={styles.sidebarItem}>
              <Ionicons name="chatbubble-outline" size={30} color="white" />
              <Text style={styles.iconText}>
                {item.comments_count || 0}
              </Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity style={styles.sidebarItem} onPress={() => onSave(item.id)}>
              <MaterialIcons
                name={isSaved ? "bookmark" : "bookmark-border"}
                size={32}
                color={isSaved ? "#FFD700" : "white"}
              />
            </TouchableOpacity>

            {/* Share Button */}
            <TouchableOpacity style={styles.sidebarItem}>
              <Feather name="share-2" size={28} color="white" />
            </TouchableOpacity>

            {/* Hotel Logo */}
            <View style={styles.hotelLogoContainer}>
              <Image
                source={
                  item.hotel?.logo_url
                    ? { uri: item.hotel.logo_url }
                    : require("../assets/images/profile.webp")
                }
                style={styles.sidebarHotelLogo}
              />
            </View>
          </View>

          {/* Bottom content info */}
          <View style={styles.contentContainer}>
            <View style={styles.userInfoContainer}>
              {/* Hotel Info Row */}
              <View style={styles.hotelInfoRow}>
                <View style={styles.profileContainer}>
                  <Image
                    source={
                      item.hotel?.logo_url
                        ? { uri: item.hotel.logo_url }
                        : require("../assets/images/profile.webp")
                    }
                    style={styles.profileImage}
                  />
                  <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>
                      {item.hotel?.name || item.hotel_name || "Hotel"}
                    </Text>
                    {item.hotel?.location && (
                      <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={12} color="white" />
                        <Text style={styles.locationText}>
                          {item.hotel.location}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Book Button */}
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={() => onBook(item.hotel_id || item.hotel?.id)}
                >
                  <LinearGradient
                    colors={['#1995AD', '#148899']}
                    style={styles.bookGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <MaterialIcons name="hotel" size={16} color="white" />
                    <Text style={styles.bookText}>Book</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Caption/Description */}
              {item.caption || item.description ? (
                <Text style={styles.captionText} numberOfLines={2}>
                  {item.caption || item.description}
                </Text>
              ) : null}

              {/* Music info */}
              <View style={styles.musicContainer}>
                <View style={styles.musicDisc}>
                  <Feather name="music" size={12} color="white" />
                </View>
                <Text style={styles.musicText} numberOfLines={1}>
                  {item.audio_title || "Original Audio"}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.width === nextProps.width &&
    prevProps.height === nextProps.height &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.isLiked === nextProps.isLiked &&
    prevProps.isSaved === nextProps.isSaved
  );
});

const VideoScroll = () => {
  const { width, height } = useWindowDimensions();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const videoRefs = useRef([]);
  const [activePostId, setActivePostId] = useState(null);
  const [videoFeed, setVideoFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedVideos, setLikedVideos] = useState(new Set());
  const [savedVideos, setSavedVideos] = useState(new Set());
  const { ip, authToken, setCurrentID } = useContext(AuthContext);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.error('Failed to configure audio mode:', e);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const videoSource = `http://${ip}:8000/api/v1/content/videos/all`;
        const response = await axios.get(videoSource);
        const result = response.data;

        if (result && result.data) {
          setVideoFeed(result.data);
          if (result.data.length > 0) {
            setActivePostId(result.data[0].id);
          }
        } else {
          setError("No videos found");
        }
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      videoRefs.current.forEach(async (video) => {
        if (video) {
          try {
            await video.pauseAsync();
          } catch (err) {
            console.log("Error pausing video:", err);
          }
        }
      });
    } else if (activePostId !== null && videoFeed.length > 0) {
      const activeIndex = videoFeed.findIndex(item => item.id === activePostId);
      if (activeIndex !== -1 && videoRefs.current[activeIndex]) {
        try {
          videoRefs.current[activeIndex].playAsync();
        } catch (err) {
          console.log("Error playing video:", err);
        }
      }
    }
  }, [isFocused, activePostId, videoFeed]);

  const onPress = useCallback((index) => {
    const videoRef = videoRefs.current[index];
    if (!videoRef) return;

    videoRef.getStatusAsync().then((status) => {
      if (status.isPlaying) {
        videoRef.pauseAsync();
      } else {
        videoRef.playAsync();
      }
    }).catch(err => {
      console.log("Error getting video status:", err);
    });
  }, []);

  const handleLike = useCallback(async (videoId) => {
    const isLiked = likedVideos.has(videoId);

    setLikedVideos(prev => {
      const newSet = new Set(prev);
      if (isLiked) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    setVideoFeed(prev => prev.map(video => {
      if (video.id === videoId) {
        return {
          ...video,
          likes_count: isLiked
            ? Math.max(0, (video.likes_count || 1) - 1)
            : (video.likes_count || 0) + 1
        };
      }
      return video;
    }));
  }, [likedVideos]);

  const handleSave = useCallback(async (videoId) => {
    const isSaved = savedVideos.has(videoId);

    setSavedVideos(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, [savedVideos]);

  const handleBook = useCallback((hotelId) => {
    if (!hotelId) {
      console.log("Hotel ID not available");
      return;
    }

    if (setCurrentID) {
      setCurrentID(hotelId);
    }

    navigation.navigate('Home', {
      screen: 'Hotel Profile',
      params: { hotelId }
    });
  }, [navigation, setCurrentID]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0 && videoFeed.length > 0) {
      const currentActiveId = viewableItems[0].item.id;
      setActivePostId(currentActiveId);

      if (isFocused) {
        videoRefs.current.forEach(async (video, index) => {
          if (video) {
            try {
              if (videoFeed[index] && videoFeed[index].id === currentActiveId) {
                await video.playAsync();
              } else {
                await video.pauseAsync();
                await video.setPositionAsync(0);
              }
            } catch (err) {
              console.log("Error managing video playback:", err);
            }
          }
        });
      }
    }
  }, [isFocused, videoFeed]);

  const renderItem = useCallback(({ item, index }) => (
    <VideoItem
      item={item}
      index={index}
      width={width}
      height={height}
      videoRef={(ref) => (videoRefs.current[index] = ref)}
      onPress={onPress}
      isActive={item.id === activePostId && isFocused}
      onLike={handleLike}
      onSave={handleSave}
      onBook={handleBook}
      isLiked={likedVideos.has(item.id)}
      isSaved={savedVideos.has(item.id)}
    />
  ), [width, height, activePostId, isFocused, onPress, handleLike, handleSave, handleBook, likedVideos, savedVideos]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1995AD" />
        <Text style={styles.loadingText}>Loading videos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={50} color="#FFFFFF" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setIsLoading(true);
            axios.get(`http://${ip}:8000/api/v1/content/videos/all`)
              .then(response => {
                if (response.data && response.data.data) {
                  setVideoFeed(response.data.data);
                  if (response.data.data.length > 0) {
                    setActivePostId(response.data.data[0].id);
                  }
                  setIsLoading(false);
                }
              })
              .catch(err => {
                console.error("Error retrying video fetch:", err);
                setError("Failed to load videos");
                setIsLoading(false);
              });
          }}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (videoFeed.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="video-off" size={50} color="#FFFFFF" />
        <Text style={styles.emptyText}>No videos available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        vertical
        pagingEnabled
        showsVerticalScrollIndicator={false}
        data={videoFeed}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
        initialNumToRender={1}
        snapToInterval={height}
        decelerationRate="fast"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1995AD',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  video: {
    flex: 1,
  },
  content: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
  },
  headerContainer: {
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerText: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebar: {
    position: 'absolute',
    right: 12,
    bottom: 140,
    alignItems: 'center',
  },
  sidebarItem: {
    alignItems: 'center',
    marginVertical: 14,
  },
  iconText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '700',
  },
  hotelLogoContainer: {
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  sidebarHotelLogo: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  userInfoContainer: {
    gap: 12,
  },
  hotelInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'white',
  },
  nameContainer: {
    marginLeft: 12,
    flex: 1,
  },
  nameText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.9,
  },
  bookButton: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#1995AD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  bookText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  captionText: {
    color: "white",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  musicDisc: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  musicText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 200,
  },
});

export default memo(VideoScroll);