import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const { width } = Dimensions.get('window');

const MyBookingsScreen = () => {
  const { authToken, ip, isAuthenticated, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'all'
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [activeTab, isAuthenticated]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);

      const endpoint = activeTab === 'all'
        ? `/api/v1/my-bookings`
        : `/api/v1/my-bookings/${activeTab}`;

      const response = await axios.get(`http://${ip}:8000${endpoint}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      if (response.data.success) {
        setBookings(response.data.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please try again.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const fetchInvoice = async (bookingId) => {
    try {
      setLoadingInvoice(true);

      const response = await axios.get(
        `http://${ip}:8000/api/v1/my-bookings/${bookingId}/invoice`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success) {
        setSelectedInvoice(response.data.data.invoice);
        setShowInvoiceModal(true);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      Alert.alert('Error', 'Failed to load invoice. Please try again.');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#007AFF';
    }
  };

  const renderBookingCard = (booking) => {
    const isUpcoming = new Date(booking.check_in_date) > new Date();

    return (
      <View key={booking.id} style={styles.bookingCard}>
        {/* Hotel Info */}
        <View style={styles.hotelInfo}>
          <View style={styles.hotelIconContainer}>
            <FontAwesome5 name="hotel" size={24} color="#1995AD" />
          </View>
          <View style={styles.hotelDetails}>
            <Text style={styles.hotelName}>{booking.hotel_name}</Text>
            <Text style={styles.hotelLocation}>
              {booking.hotel_city}, {booking.hotel_country}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.payment_status) }]}>
            <Text style={styles.statusText}>{booking.payment_status}</Text>
          </View>
        </View>

        {/* Dates */}
        <View style={styles.datesContainer}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateText}>{formatDate(booking.check_in_date)}</Text>
          </View>
          <MaterialIcons name="arrow-forward" size={20} color="#8E8E93" />
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateText}>{formatDate(booking.check_out_date)}</Text>
          </View>
        </View>

        {/* Rooms */}
        <View style={styles.roomsContainer}>
          {booking.rooms?.map((room, index) => (
            <Text key={index} style={styles.roomText}>
              • {room.num_rooms}x {room.room_type} ({room.num_guests} guests)
            </Text>
          ))}
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalPrice}>
            {booking.currency} {parseFloat(booking.total_price).toFixed(2)}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => fetchInvoice(booking.id)}
            disabled={loadingInvoice}
          >
            <MaterialIcons name="receipt" size={18} color="#1995AD" />
            <Text style={styles.actionButtonText}>View Invoice</Text>
          </TouchableOpacity>

          {isUpcoming && (
            <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
              <MaterialIcons name="event" size={18} color="white" />
              <Text style={[styles.actionButtonText, { color: 'white' }]}>Manage</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderInvoiceModal = () => {
    if (!selectedInvoice) return null;

    return (
      <Modal
        visible={showInvoiceModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInvoiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.invoiceModal}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceTitle}>Invoice</Text>
                <TouchableOpacity onPress={() => setShowInvoiceModal(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {/* Invoice Number */}
              <Text style={styles.invoiceNumber}>{selectedInvoice.invoice_number}</Text>
              <Text style={styles.invoiceDate}>
                Issued: {formatDate(selectedInvoice.issue_date)}
              </Text>

              {/* Hotel Details */}
              <View style={styles.invoiceSection}>
                <Text style={styles.sectionTitle}>Hotel Details</Text>
                <Text style={styles.invoiceText}>{selectedInvoice.hotel_name}</Text>
                <Text style={styles.invoiceTextSecondary}>
                  {selectedInvoice.hotel_address}
                </Text>
                <Text style={styles.invoiceTextSecondary}>
                  {selectedInvoice.hotel_city}, {selectedInvoice.hotel_country}
                </Text>
              </View>

              {/* Stay Details */}
              <View style={styles.invoiceSection}>
                <Text style={styles.sectionTitle}>Stay Details</Text>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>Check-in:</Text>
                  <Text style={styles.invoiceText}>
                    {formatDate(selectedInvoice.check_in_date)}
                  </Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>Check-out:</Text>
                  <Text style={styles.invoiceText}>
                    {formatDate(selectedInvoice.check_out_date)}
                  </Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>Number of Nights:</Text>
                  <Text style={styles.invoiceText}>{selectedInvoice.num_nights}</Text>
                </View>
              </View>

              {/* Room Details */}
              <View style={styles.invoiceSection}>
                <Text style={styles.sectionTitle}>Room Details</Text>
                {selectedInvoice.rooms.map((room, index) => (
                  <View key={index} style={styles.roomDetail}>
                    <Text style={styles.roomDetailText}>
                      {room.num_rooms}x {room.room_type}
                    </Text>
                    <Text style={styles.roomDetailPrice}>
                      {selectedInvoice.currency} {room.subtotal}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Payment Summary */}
              <View style={styles.invoiceSection}>
                <Text style={styles.sectionTitle}>Payment Summary</Text>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>Subtotal:</Text>
                  <Text style={styles.invoiceText}>
                    {selectedInvoice.currency} {selectedInvoice.subtotal}
                  </Text>
                </View>
                <View style={styles.invoiceRow}>
                  <Text style={styles.invoiceText}>Tax (10%):</Text>
                  <Text style={styles.invoiceText}>
                    {selectedInvoice.currency} {selectedInvoice.tax}
                  </Text>
                </View>
                <View style={[styles.invoiceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalAmount}>
                    {selectedInvoice.currency} {selectedInvoice.total}
                  </Text>
                </View>

                {/* Payment Status */}
                <View style={styles.paymentStatus}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(selectedInvoice.payment_status) }
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedInvoice.payment_status.toUpperCase()}
                    </Text>
                  </View>
                  {selectedInvoice.payment_date && (
                    <Text style={styles.invoiceTextSecondary}>
                      Paid on: {formatDate(selectedInvoice.payment_date)}
                    </Text>
                  )}
                  {selectedInvoice.tx_ref && (
                    <Text style={styles.invoiceTextSecondary}>
                      Ref: {selectedInvoice.tx_ref}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <MaterialIcons name="lock" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Please Sign In</Text>
          <Text style={styles.emptyText}>
            You need to sign in to view your bookings
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={logout}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1995AD" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="event-busy" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptyText}>
            You don't have any {activeTab !== 'all' ? activeTab : ''} bookings yet
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Explore')}
          >
            <Text style={styles.exploreButtonText}>Explore Hotels</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {bookings.map(renderBookingCard)}
          <View style={{ height: 20 }} />
        </ScrollView>
      )}

      {/* Invoice Modal */}
      {renderInvoiceModal()}

      {/* Loading Overlay */}
      {loadingInvoice && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1995AD" />
          <Text style={styles.loadingText}>Loading invoice...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#1995AD',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hotelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(25, 149, 173, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hotelDetails: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'capitalize',
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dateBox: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  roomsContainer: {
    marginBottom: 12,
  },
  roomText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1995AD',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1995AD',
    gap: 6,
  },
  primaryButton: {
    backgroundColor: '#1995AD',
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1995AD',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#1995AD',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  signInButton: {
    backgroundColor: '#1995AD',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  invoiceModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '90%',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1995AD',
    marginBottom: 4,
  },
  invoiceDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  invoiceSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  invoiceText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  invoiceTextSecondary: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  roomDetailText: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  roomDetailPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#1995AD',
    marginTop: 8,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1995AD',
  },
  paymentStatus: {
    marginTop: 16,
    alignItems: 'flex-start',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyBookingsScreen;
