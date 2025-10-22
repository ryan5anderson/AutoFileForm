// Order storage service for admin dashboard
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
}

class OrderStorageService {
  private readonly STORAGE_KEY = 'admin_orders';

  // Get all orders
  getAllOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading orders:', error);
      return [];
    }
  }

  // Add a new order
  addOrder(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const orders = this.getAllOrders();
    const newOrder: Order = {
      ...order,
      id: this.generateOrderId(),
      createdAt: new Date().toISOString(),
    };
    
    orders.unshift(newOrder); // Add to beginning for newest first
    this.saveOrders(orders);
    
    // Notify admin dashboard of new order
    window.dispatchEvent(new CustomEvent('new-order', { detail: newOrder }));
    
    return newOrder;
  }

  // Update order status
  updateOrderStatus(orderId: string, status: Order['status']): boolean {
    const orders = this.getAllOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = status;
      this.saveOrders(orders);
      
      // Notify admin dashboard of status change
      window.dispatchEvent(new CustomEvent('order-updated', { detail: orders[orderIndex] }));
      
      return true;
    }
    return false;
  }

  // Delete an order
  deleteOrder(orderId: string): boolean {
    const orders = this.getAllOrders();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    
    if (filteredOrders.length !== orders.length) {
      this.saveOrders(filteredOrders);
      
      // Notify admin dashboard of order deletion
      window.dispatchEvent(new CustomEvent('order-deleted', { detail: orderId }));
      
      return true;
    }
    return false;
  }

  // Get orders by college
  getOrdersByCollege(college: string): Order[] {
    return this.getAllOrders().filter(order => 
      order.college.toLowerCase() === college.toLowerCase()
    );
  }

  // Get recent orders (last 10)
  getRecentOrders(limit: number = 10): Order[] {
    return this.getAllOrders().slice(0, limit);
  }

  // Get order statistics
  getOrderStats() {
    const orders = this.getAllOrders();
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= lastMonth
    );
    
    const completedOrders = orders.filter(order => order.status === 'completed');
    const pendingOrders = orders.filter(order => order.status === 'pending');
    
    // Calculate total products across all orders
    const totalProducts = orders.reduce((sum, order) => sum + order.totalItems, 0);
    
    return {
      totalOrders: orders.length,
      recentOrders: recentOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      totalProducts: totalProducts,
    };
  }

  // Private methods
  private saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  }

  private generateOrderId(): string {
    const now = new Date();
    // Convert to EST (UTC-5) or EDT (UTC-4) depending on daylight saving
    const estTime = new Date(now.getTime() - (5 * 60 * 60 * 1000)); // EST is UTC-5
    const timestamp = estTime.toISOString().replace(/[-:T]/g, '').substring(0, 14); // YYYYMMDDHHMMSS
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  // Clear all orders (for testing)
  clearAllOrders(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('orders-cleared'));
  }
}

export const orderStorage = new OrderStorageService();
