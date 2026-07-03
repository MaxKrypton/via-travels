import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  useWindowDimensions,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Video, ResizeMode, Audio } from "expo-av";
import { useCallback, useState, useRef, useEffect, memo, useContext } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from 'expo-blur';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import axios from "axios";
import AuthContext from "../context/AuthContext";

// Memoized Video Item Component
const VideoItem = memo(({
  item,
  index,
  width,
  height,
  videoRef,
  onPress,
  isActive,
  onBook,
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

          {/* Bottom content info */}
          <View style={styles.contentContainer}>
            <View style={styles.userInfoContainer}>
              {/* Hotel Info Row */}
              <View style={styles.hotelInfoRow}>
                <Text style={styles.nameText} numberOfLines={1}>
                  {item.hotel?.name || item.hotel_name || "Hotel"}
                </Text>
                
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
    prevProps.item.id === nextProps.item.id
  );
});

const VideoScroll = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const videoRefs = useRef([]);
  const [feedSize, setFeedSize] = useState({
    width: windowWidth,
    height: windowHeight,
  });
  const [activePostId, setActivePostId] = useState(null);
  const [videoFeed, setVideoFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ip, setCurrentID } = useContext(AuthContext);

  const itemWidth = feedSize.width || windowWidth;
  const itemHeight = feedSize.height || windowHeight;

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

  const handleContainerLayout = useCallback((event) => {
    const { width, height } = event.nativeEvent.layout;

    if (!width || !height) return;

    setFeedSize((currentSize) => {
      if (currentSize.width === width && currentSize.height === height) {
        return currentSize;
      }

      return { width, height };
    });
  }, []);

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
      width={itemWidth}
      height={itemHeight}
      videoRef={(ref) => (videoRefs.current[index] = ref)}
      onPress={onPress}
      isActive={item.id === activePostId && isFocused}
      onBook={handleBook}
    />
  ), [itemWidth, itemHeight, activePostId, isFocused, onPress, handleBook]);

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
    <View style={styles.container} onLayout={handleContainerLayout}>
      <FlatList
        key={`${itemWidth}x${itemHeight}`}
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
        snapToInterval={itemHeight}
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
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
    gap: 16,
  },
  nameText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
    flex: 1,
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
});

export default memo(VideoScroll);
