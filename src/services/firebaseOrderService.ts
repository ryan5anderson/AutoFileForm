import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

import { db } from '../config/firebase';
import { FormData } from '../types';

export interface OrderProduct {
  category: string;
  productName: string;
  imagePath: string;
  sku?: string;
  quantities: {
    [key: string]: number; // size -> quantity
  };
  totalQuantity: number;
  version?: string;
  color?: string;
  style?: string;
}

export interface Order {
  id: string;
  college: string;
  storeNumber: string;
  storeManager: string;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  totalItems: number;
  orderNotes?: string;
  createdAt: string;
  updatedAt: string;
  emailSent: boolean;
  adminNotes?: string;
  products?: OrderProduct[]; // New: detailed product information
  formData?: FormData; // Store the original form data for detailed receipt generation
}

class FirebaseOrderService {
  private readonly COLLECTION_NAME = 'orders';

  // Add a new order
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'emailSent'>): Promise<Order> {
    try {
      const orderData = {
        ...order,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        emailSent: true,
      };
      
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), orderData);
      
      const newOrder: Order = {
        id: docRef.id,
        ...orderData
      };
      
      // Notify admin dashboard of new order
      window.dispatchEvent(new CustomEvent('new-order', { detail: newOrder }));
      
      return newOrder;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  }

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc'))
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  // Get recent orders
  async getRecentOrders(count: number = 10): Promise<Order[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, this.COLLECTION_NAME), 
          orderBy('createdAt', 'desc'),
          limit(count)
        )
      );
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
    } catch (error) {
      console.error('Error getting recent orders:', error);
      return [];
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<boolean> {
    try {
      await updateDoc(doc(db, this.COLLECTION_NAME, orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
      
      // Notify admin dashboard of status change
      window.dispatchEvent(new CustomEvent('order-updated', { detail: { orderId, status } }));
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  // Delete an order
  async deleteOrder(orderId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, orderId));
      
      // Notify admin dashboard of order deletion
      window.dispatchEvent(new CustomEvent('order-deleted', { detail: orderId }));
      
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      return false;
    }
  }

  // Get orders by college
  async getOrdersByCollege(college: string): Promise<Order[]> {
    try {
      const orders = await this.getAllOrders();
      return orders.filter(order => 
        order.college.toLowerCase() === college.toLowerCase()
      );
    } catch (error) {
      console.error('Error getting orders by college:', error);
      return [];
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const orders = await this.getAllOrders();
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      
      const recentOrders = orders.filter(order => 
        new Date(order.createdAt) >= lastMonth
      );
      
      const completedOrders = orders.filter(order => order.status === 'completed');
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      const totalProducts = orders.reduce((sum, order) => sum + order.totalItems, 0);
      
      return {
        totalOrders: orders.length,
        recentOrders: recentOrders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalProducts: totalProducts,
      };
    } catch (error) {
      console.error('Error getting order stats:', error);
      return {
        totalOrders: 0,
        recentOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
      };
    }
  }

  // Subscribe to real-time updates (for admin dashboard)
  subscribeToOrders(callback: (orders: Order[]) => void) {
    return onSnapshot(
      query(collection(db, this.COLLECTION_NAME), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        callback(orders);
      },
      (error) => {
        console.error('Error in orders subscription:', error);
      }
    );
  }

  // Subscribe to recent orders only (for admin dashboard)
  subscribeToRecentOrders(count: number = 10, callback: (orders: Order[]) => void) {
    return onSnapshot(
      query(
        collection(db, this.COLLECTION_NAME), 
        orderBy('createdAt', 'desc'),
        limit(count)
      ),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Order));
        callback(orders);
      },
      (error) => {
        console.error('Error in recent orders subscription:', error);
      }
    );
  }

  // Clear all orders (for testing purposes)
  async clearAllOrders(): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      const deletePromises = orders.map(order => 
        deleteDoc(doc(db, this.COLLECTION_NAME, order.id))
      );
      await Promise.all(deletePromises);
      window.dispatchEvent(new CustomEvent('orders-cleared'));
    } catch (error) {
      console.error('Error clearing orders:', error);
      throw error;
    }
  }
}

export const firebaseOrderService = new FirebaseOrderService();
