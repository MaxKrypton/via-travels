// Frontend/screens/PaymentScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const PaymentScreen = ({ route, navigation }) => {
  const { grandTotal, bookingData, bookingId } = route.params;
  const { user, ip, authToken, isAuthenticated } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState(bookingData?.checkout_url || null);
  const [txRef, setTxRef] = useState(bookingData?.tx_ref || null);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [pollingInterval, setPollingInterval] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated || !authToken) {
      Alert.alert(
        'Login Required',
        'You need to be logged in to access the payment page',
        [
          {
            text: 'Login',
            onPress: () => navigation.navigate('SignIn', {
              returnTo: 'Payment',
              returnParams: { grandTotal, bookingData, bookingId }
            })
          },
          {
            text: 'Cancel',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    }
  }, []);

  // Auto-open WebView if checkout URL exists
  useEffect(() => {
    if (checkoutUrl && !showWebView && isAuthenticated) {
      setShowWebView(true);
    }
  }, [checkoutUrl, isAuthenticated]);

  // Poll for payment status
  useEffect(() => {
    let interval;
    
    if (txRef && paymentStatus === 'pending' && showWebView) {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 5000); // Check every 5 seconds
      
      setPollingInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [txRef, paymentStatus, showWebView]);

  const checkPaymentStatus = async () => {
    if (!txRef || !authToken) return;

    try {
      const response = await axios.get(
        `http://${ip}:8000/api/v1/payment/verify/${txRef}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === 200 || response.data.message?.includes('success')) {
        setPaymentStatus('completed');
        setShowWebView(false);
        
        // Clear polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        
        // Verify the booking payment
        if (bookingId) {
          await verifyBookingPayment();
        } else {
          showSuccessAndNavigate();
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      // Don't show error to user during polling
    }
  };

  const verifyBookingPayment = async () => {
    try {
      const response = await axios.get(
        `http://${ip}:8000/api/v1/hotels/booking/${bookingId}/verify-payment`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );

      if (response.data.status === 200) {
        showSuccessAndNavigate(response.data.data);
      } else {
        Alert.alert('Verification Issue', response.data.message || 'Payment verified but booking update failed');
        navigation.navigate('Bookings');
      }
    } catch (error) {
      console.error('Booking verification error:', error);
      Alert.alert('Success', 'Payment completed! Your booking will be confirmed shortly.');
      navigation.navigate('Bookings');
    }
  };

  const showSuccessAndNavigate = (bookingDetails) => {
    Alert.alert(
      '🎉 Payment Successful!',
      'Your booking has been confirmed. Check your email for details.',
      [
        {
          text: 'Go to Bookings',
          onPress: () => navigation.navigate('Bookings')
        }
      ],
      { cancelable: false }
    );
  };

  const handleWebViewNavigationChange = (navState) => {
    const { url } = navState;
    
    console.log('WebView navigation:', url);
    
    // Check if payment was completed
    if (url.includes('status=successful') || url.includes('payment/callback')) {
      setShowWebView(false);
      checkPaymentStatus();
    } else if (url.includes('status=cancelled') || url.includes('status=failed')) {
      setShowWebView(false);
      Alert.alert(
        'Payment Cancelled',
        'Your payment was not completed. Your booking will expire in 30 minutes if payment is not completed.',
        [
          { text: 'Try Again', onPress: () => setShowWebView(true) },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const manualVerifyPayment = () => {
    Alert.alert(
      'Verify Payment',
      'Have you completed the payment? We will check the status now.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Check Status',
          onPress: () => {
            setLoading(true);
            checkPaymentStatus().finally(() => setLoading(false));
          }
        }
      ]
    );
  };

  const handleClosePayment = () => {
    Alert.alert(
      'Close Payment',
      'Are you sure? Your booking will expire in 30 minutes if payment is not completed.',
      [
        { text: 'Continue Payment', style: 'cancel' },
        { 
          text: 'Close', 
          onPress: () => {
            if (pollingInterval) {
              clearInterval(pollingInterval);
            }
            navigation.goBack();
          },
          style: 'destructive'
        }
      ]
    );
  };

  // WebView Display
  if (showWebView && checkoutUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity 
            onPress={handleClosePayment}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>Complete Payment</Text>
          <TouchableOpacity onPress={manualVerifyPayment}>
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        </View>
        
        <WebView
          source={{ uri: checkoutUrl }}
          onNavigationStateChange={handleWebViewNavigationChange}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color="#1995AD" />
              <Text style={styles.loadingText}>Loading payment page...</Text>
            </View>
          )}
        />
        
        <View style={styles.webViewFooter}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.secureText}>Secured by Flutterwave</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Payment Summary Display
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hotel</Text>
            <Text style={styles.summaryValue}>{bookingData?.hotel_name}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in</Text>
            <Text style={styles.summaryValue}>{bookingData?.check_in}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out</Text>
            <Text style={styles.summaryValue}>{bookingData?.check_out}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nights</Text>
            <Text style={styles.summaryValue}>{bookingData?.nights}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests</Text>
            <Text style={styles.summaryValue}>{bookingData?.adults} Adults, {bookingData?.children || 0} Children</Text>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>
              {user?.preferred_currency || 'RWF'} {grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Rooms Booked */}
        <View style={styles.roomsCard}>
          <Text style={styles.sectionTitle}>Rooms Booked</Text>
          {bookingData?.rooms?.map((room, index) => (
            <View key={index} style={styles.roomItem}>
              <View style={styles.roomInfo}>
                <MaterialCommunityIcons name="bed" size={20} color="#1995AD" />
                <Text style={styles.roomText}>{room.roomType}</Text>
              </View>
              <Text style={styles.roomCount}>{room.count} room(s)</Text>
            </View>
          ))}
        </View>

        {/* Payment Method Info */}
        <View style={styles.paymentMethodCard}>
          <View style={styles.methodHeader}>
            <MaterialCommunityIcons name="credit-card" size={24} color="#1995AD" />
            <Text style={styles.methodTitle}>Flutterwave Payment</Text>
          </View>
          
          <Text style={styles.methodDescription}>
            Click below to open the secure payment page where you can pay using:
          </Text>
          
          <View style={styles.methodsList}>
            <View style={styles.methodItem}>
              <Ionicons name="card" size={20} color="#4A90E2" />
              <Text style={styles.methodText}>Credit/Debit Cards</Text>
            </View>
            
            <View style={styles.methodItem}>
              <MaterialCommunityIcons name="cellphone" size={20} color="#FFCC00" />
              <Text style={styles.methodText}>MTN Mobile Money</Text>
            </View>
            
            <View style={styles.methodItem}>
              <MaterialCommunityIcons name="cellphone-wireless" size={20} color="#FF0000" />
              <Text style={styles.methodText}>Airtel Money</Text>
            </View>
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Important Notes:</Text>
          <Text style={styles.noteText}>• Complete payment within 30 minutes</Text>
          <Text style={styles.noteText}>• You will receive confirmation via email</Text>
          <Text style={styles.noteText}>• Keep your transaction reference safe</Text>
          <Text style={styles.noteText}>• Contact support if you face any issues</Text>
        </View>

        {/* Open Payment Button */}
        {!showWebView && checkoutUrl && (
          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={() => setShowWebView(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="lock" size={20} color="#fff" />
                <Text style={styles.payButtonText}>Open Payment Page</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Manual Verify Button */}
        {txRef && (
          <TouchableOpacity
            style={styles.verifyButton}
            onPress={manualVerifyPayment}
            disabled={loading}
          >
            <Text style={styles.verifyButtonText}>Already Paid? Verify Now</Text>
          </TouchableOpacity>
        )}

        {/* Security Info */}
        <View style={styles.securityContainer}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Secured by Flutterwave. Your payment information is encrypted and secure.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1995AD',
  },
  roomsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roomText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  roomCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1995AD',
  },
  paymentMethodCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    lineHeight: 20,
  },
  methodsList: {
    marginTop: 10,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  notesCard: {
    backgroundColor: '#FFF9E6',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
  payButton: {
    backgroundColor: '#1995AD',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#1995AD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  verifyButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1995AD',
  },
  verifyButtonText: {
    color: '#1995AD',
    fontSize: 16,
    fontWeight: '600',
  },
  securityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    textAlign: 'center',
    flex: 1,
  },
  // WebView Styles
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 5,
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  verifyText: {
    fontSize: 16,
    color: '#1995AD',
    fontWeight: '600',
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  webViewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#F5F7FA',
  },
  secureText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
});

export default PaymentScreen;