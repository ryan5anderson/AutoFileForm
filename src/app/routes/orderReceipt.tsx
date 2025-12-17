import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { colleges } from '../../config';
import { firebaseOrderService, Order } from '../../services/firebaseOrderService';

import ReceiptPage from './receipt';

const OrderReceiptPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      if (orderId) {
        try {
          // Try to get order from location state first (if navigating from allOrders)
          const stateOrder = (location.state as { order?: Order } | null)?.order;
          if (stateOrder) {
            setOrder(stateOrder);
            setLoading(false);
            return;
          }

          // Otherwise, fetch from Firebase
          const allOrders = await firebaseOrderService.getAllOrders();
          const foundOrder = allOrders.find(o => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);
          }
        } catch (error) {
          console.error('Error loading order:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadOrder();
  }, [orderId, location.state]);

  // Get college categories for receipt display
  const getCollegeCategories = (collegeName: string) => {
    const collegeKeyMap: { [key: string]: string } = {
      'alabamauniversity': 'alabamauniversity',
      'arizonastate': 'arizonastate', 
      'michiganstate': 'michiganstate',
      'pittsburghuniversity': 'pittsburghuniversity',
      'westvirginiauniversity': 'westvirginiauniversity',
      'oregonuniversity': 'oregonuniversity'
    };
    
    const collegeKey = collegeKeyMap[collegeName.toLowerCase()] || collegeName.toLowerCase();
    const collegeConfig = colleges[collegeKey as keyof typeof colleges];
    
    return collegeConfig ? collegeConfig.categories : [];
  };

  // Convert Order to FormData for receipt component
  const convertOrderToFormData = (order: Order) => {
    if (order.formData) {
      return order.formData;
    }
    
    return {
      company: order.college,
      storeNumber: order.storeNumber,
      storeManager: order.storeManager,
      date: order.date,
      orderNotes: order.orderNotes || '',
      quantities: {},
      shirtVersions: {},
      displayOptions: {},
      sweatpantJoggerOptions: {},
      pantOptions: {},
      shirtSizeCounts: {},
      colorOptions: {},
      shirtColorSizeCounts: {},
    };
  };

  const handleBack = () => {
    navigate('/all-orders');
  };

  const handleExit = () => {
    navigate('/all-orders');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Loading receipt...
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        gap: '16px'
      }}>
        <div style={{ fontSize: '1.125rem', color: '#dc2626' }}>Order not found</div>
        <button
          onClick={handleBack}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Back to All Orders
        </button>
      </div>
    );
  }

  return (
    <ReceiptPage 
      formData={convertOrderToFormData(order)}
      categories={getCollegeCategories(order.college)}
      onBackToSummary={handleBack}
      onExit={handleExit}
    />
  );
};

export default OrderReceiptPage;

