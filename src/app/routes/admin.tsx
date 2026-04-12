import { collection, getDocs, query, limit } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { colleges } from '../../config';
import { adminConfig } from '../../config/env';
import { db } from '../../config/firebase';
import { createTemplateParams } from '../../features/utils';
import { sendOrderEmail } from '../../services/emailService';
import { firebaseOrderService, Order } from '../../services/firebaseOrderService';
import { TemplateParams } from '../../types';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    location.state?.isAuthenticated || false
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);

  // Check Firebase connection status
  useEffect(() => {
    if (isAuthenticated) {
      checkFirebaseConnection();
    }
  }, [isAuthenticated]);

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  // Set up real-time subscription for orders
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = firebaseOrderService.subscribeToRecentOrders(10, (orders) => {
        setOrders(orders);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Listen for order updates
  useEffect(() => {
    const handleNewOrder = () => loadOrders();
    const handleOrderUpdate = () => loadOrders();
    const handleOrderDelete = () => loadOrders();

    window.addEventListener('new-order', handleNewOrder);
    window.addEventListener('order-updated', handleOrderUpdate);
    window.addEventListener('order-deleted', handleOrderDelete);

    return () => {
      window.removeEventListener('new-order', handleNewOrder);
      window.removeEventListener('order-updated', handleOrderUpdate);
      window.removeEventListener('order-deleted', handleOrderDelete);
    };
  }, []);

  const loadOrders = async () => {
    const recentOrders = await firebaseOrderService.getRecentOrders(10);
    setOrders(recentOrders);
  };

  const checkFirebaseConnection = async () => {
    try {
      // Directly test Firebase connection by querying the orders collection
      // This will throw an error if Firebase is not properly connected
      const ordersRef = collection(db, 'orders');
      await getDocs(query(ordersRef, limit(1)));
      
      // If we get here, the connection is working
      setFirebaseConnected(true);
      return true;
    } catch (error: unknown) {
      setFirebaseConnected(false);
      console.error('Firebase connection error:', error);
      return false;
    }
  };

  const handleReconnectFirebase = async () => {
    setFirebaseConnected(null);
    const connected = await checkFirebaseConnection();
    if (connected) {
      loadOrders();
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (await firebaseOrderService.updateOrderStatus(orderId, newStatus)) {
      loadOrders();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      if (await firebaseOrderService.deleteOrder(orderId)) {
        loadOrders();
      }
    }
  };

  const [reorderLoading, setReorderLoading] = useState<Record<string, boolean>>({});

  const buildTemplateParamsFromOrder = (order: Order): TemplateParams | null => {
    if (order.emailTemplateParams) {
      return order.emailTemplateParams;
    }

    const collegeKey = order.college as keyof typeof colleges;
    const collegeConfig = colleges[collegeKey];
    if (!collegeConfig || !order.formData) {
      return null;
    }

    return createTemplateParams(order.formData, collegeConfig.categories, collegeConfig.name);
  };

  const handleReorder = async (order: Order) => {
    const templateParams = buildTemplateParamsFromOrder(order);
    if (!templateParams) {
      window.alert('Cannot reorder this order yet. This order is missing the saved email details needed to resend.');
      return;
    }

    const shouldSend = window.confirm(
      `Send this order email again for Store #${order.storeNumber}?`
    );
    if (!shouldSend) {
      return;
    }

    setReorderLoading((prev) => ({ ...prev, [order.id]: true }));
    try {
      await sendOrderEmail(templateParams);
      window.alert(`Reorder email sent for Store #${order.storeNumber}.`);
    } catch (error) {
      console.error('Reorder email error:', error);
      window.alert('Failed to resend the order email. Please check EmailJS configuration and try again.');
    } finally {
      setReorderLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, this would be more secure
    if (password === adminConfig.password) {
      setIsAuthenticated(true);
      setError('');
      // Notify sidebar that admin is logged in
      window.dispatchEvent(new CustomEvent('admin-login'));
    } else {
      setError('Invalid password');
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-lock-icon">🔒</div>
            <h2>Admin Access</h2>
            <p>Enter admin password to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" className="admin-login-button">
              Access Admin Panel
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')} 
            className="admin-back-button"
          >
            ← Back to Colleges
          </button>
        </div>

        <style>{`
           .admin-login-container {
             min-height: 100vh;
             background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
             background-attachment: fixed;
             display: flex;
             align-items: center;
             justify-content: center;
             padding: 20px;
           }

          .admin-login-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 400px;
            text-align: center;
          }

          .admin-login-header {
            margin-bottom: 30px;
          }

          .admin-lock-icon {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.8;
          }

          .admin-login-header h2 {
            margin: 0 0 8px 0;
            color: #1f2937;
            font-size: 1.5rem;
            font-weight: 600;
          }

          .admin-login-header p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
          }

          .admin-login-form {
            margin-bottom: 24px;
          }

          .form-group {
            margin-bottom: 20px;
            text-align: left;
          }

          .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #374151;
            font-weight: 500;
            font-size: 0.875rem;
          }

          .form-group input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 0.875rem;
            transition: border-color 0.2s ease;
            box-sizing: border-box;
          }

          .form-group input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }

          .error-message {
            color: #dc2626;
            font-size: 0.875rem;
            margin-bottom: 16px;
            padding: 8px 12px;
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
          }

          .admin-login-button {
            width: 100%;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            padding: 14px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .admin-login-button:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          }

          .admin-back-button {
            background: transparent;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .admin-back-button:hover {
            background: #f9fafb;
            color: #374151;
            border-color: #d1d5db;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-content">
        <div className="admin-welcome-section">
          <h1>Welcome, Admin</h1>
          <p>Manage your application from the admin dashboard</p>
        </div>
        
        <div className="firebase-status-bar">
          {firebaseConnected === null && (
            <span className="firebase-status-dot firebase-status-checking" />
          )}
          {firebaseConnected === true && (
            <span className="firebase-status-dot firebase-status-connected" />
          )}
          {firebaseConnected === false && (
            <span className="firebase-status-dot firebase-status-disconnected" />
          )}
          <span className="firebase-status-label">
            {firebaseConnected === null && 'Checking Firebase connection...'}
            {firebaseConnected === true && 'Firebase Connected'}
            {firebaseConnected === false && 'Firebase not connected'}
          </span>
          {firebaseConnected === false && (
            <button className="firebase-retry-btn" onClick={handleReconnectFirebase}>
              Retry
            </button>
          )}
        </div>

        <div className="admin-sections">
          <div className="admin-section">
            <h2>Recent Orders</h2>
            <div className="admin-table-container">
              {orders.length === 0 ? (
                <div className="no-orders">
                  <p>No orders yet. Orders will appear here when customers submit them.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="col-order-id">Order ID</th>
                      <th className="col-college">College</th>
                      <th className="col-store">Store</th>
                      <th className="col-manager">Manager</th>
                      <th className="col-ordered-by">Ordered By</th>
                      <th className="col-date">Date</th>
                      <th className="col-status">Status</th>
                      <th className="col-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="col-order-id">{order.id}</td>
                        <td className="col-college">{order.college}</td>
                        <td className="col-store">
                          <Link
                            to={`/receipt/${order.id}`}
                            className="store-link"
                          >
                            Store #{order.storeNumber}
                          </Link>
                        </td>
                        <td className="col-manager">{order.storeManager}</td>
                        <td className="col-ordered-by">{order.orderedBy || order.storeManager}</td>
                        <td className="col-date">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="col-status">
                          <span className={`status-${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="col-actions">
                          <div className="order-actions">
                            {order.status === 'pending' && (
                              <button 
                                className="action-btn complete-btn"
                                onClick={() => handleStatusChange(order.id, 'completed')}
                              >
                                Complete
                              </button>
                            )}
                            {order.status === 'completed' && (
                              <button 
                                className="action-btn pending-btn"
                                onClick={() => handleStatusChange(order.id, 'pending')}
                              >
                                Reopen
                              </button>
                            )}
                            <button 
                              className="action-btn reorder-btn"
                              onClick={() => handleReorder(order)}
                              disabled={Boolean(reorderLoading[order.id])}
                            >
                              {reorderLoading[order.id] ? 'Sending...' : 'Reorder'}
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteOrder(order.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .admin-dashboard {
          min-height: 100vh;
          background: #f8fafc;
        }

        .admin-welcome-section {
          text-align: center;
          margin: 60px 0 40px 0;
          padding: 40px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .admin-welcome-section h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 2rem;
          font-weight: 700;
        }

        .admin-welcome-section p {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .admin-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
          width: 100%;
          box-sizing: border-box;
        }

        .admin-sections {
          display: grid;
          gap: 30px;
          width: 100%;
          box-sizing: border-box;
        }

        .admin-section {
          width: 100%;
          box-sizing: border-box;
        }

        .admin-section h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .firebase-status-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
          width: fit-content;
        }

        .firebase-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .firebase-status-checking {
          background: #94a3b8;
        }

        .firebase-status-connected {
          background: #10b981;
        }

        .firebase-status-disconnected {
          background: #f59e0b;
        }

        .firebase-status-label {
          font-size: 0.8125rem;
          color: #374151;
          font-weight: 500;
        }

        .firebase-retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 3px 10px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .firebase-retry-btn:hover {
          background: #2563eb;
        }

        .admin-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 304px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          -webkit-overflow-scrolling: touch;
        }

        .admin-table thead tr {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .col-order-id,
        .col-college,
        .col-manager,
        .col-ordered-by,
        .col-date {
          display: table-cell;
        }

        .store-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .store-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .admin-table th {
          background: #f8fafc;
          color: #374151;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          color: #374151;
          font-size: 0.875rem;
        }

        .admin-table tr:last-child td {
          border-bottom: none;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #dc2626;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .no-orders {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .order-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .action-btn {
          padding: 4px 8px;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .complete-btn {
          background: #d1fae5;
          color: #065f46;
        }

        .complete-btn:hover {
          background: #a7f3d0;
        }

        .pending-btn {
          background: #fef3c7;
          color: #92400e;
        }

        .pending-btn:hover {
          background: #fde68a;
        }

        .delete-btn {
          background: #fee2e2;
          color: #dc2626;
        }

        .reorder-btn {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .reorder-btn:hover:not(:disabled) {
          background: #bfdbfe;
        }

        .reorder-btn:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        .delete-btn:hover {
          background: #fecaca;
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 20px 16px;
          }

          .admin-welcome-section {
            margin: 40px 0 30px 0;
            padding: 30px 16px;
          }

          .admin-welcome-section h1 {
            font-size: 1.5rem;
          }

          .admin-welcome-section p {
            font-size: 0.875rem;
          }

          .admin-header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .admin-sections {
            gap: 24px;
          }

          .admin-section h2 {
            font-size: 1.125rem;
            margin-bottom: 16px;
          }

          .admin-table-container {
            border-radius: 8px;
          }

          .admin-table {
            font-size: 0.8125rem;
            min-width: 400px;
          }

          .admin-table th,
          .admin-table td {
            padding: 12px 8px;
            font-size: 0.8125rem;
          }

          .admin-table th {
            font-size: 0.75rem;
          }

          /* Hide non-essential columns on tablet and mobile */
          .col-order-id,
          .col-college,
          .col-manager,
          .col-ordered-by,
          .col-date {
            display: none;
          }

          .col-store,
          .col-status,
          .col-actions {
            display: table-cell;
          }

          .order-actions {
            flex-direction: row;
            gap: 4px;
            flex-wrap: wrap;
          }

          .action-btn {
            padding: 4px 8px;
            font-size: 0.6875rem;
            min-width: auto;
            white-space: nowrap;
          }

        }

        @media (max-width: 480px) {
          .admin-content {
            padding: 16px 12px;
          }

          .admin-welcome-section {
            margin: 30px 0 24px 0;
            padding: 24px 12px;
          }

          .admin-welcome-section h1 {
            font-size: 1.25rem;
          }

          .admin-sections {
            gap: 20px;
          }

          .admin-section h2 {
            font-size: 1rem;
            margin-bottom: 12px;
          }

          .admin-table {
            min-width: 300px;
          }

          .admin-table th,
          .admin-table td {
            padding: 8px 6px;
            font-size: 0.75rem;
          }

          .admin-table th {
            font-size: 0.6875rem;
            white-space: nowrap;
          }

          .admin-table td {
            white-space: nowrap;
          }

          /* Ensure only Store, Status, Actions are visible on mobile */
          .col-order-id,
          .col-college,
          .col-manager,
          .col-ordered-by,
          .col-date {
            display: none;
          }

          .col-store,
          .col-status,
          .col-actions {
            display: table-cell;
          }

          .order-actions {
            flex-direction: row;
            gap: 3px;
            flex-wrap: wrap;
          }

          .action-btn {
            padding: 3px 6px;
            font-size: 0.625rem;
            min-width: auto;
            white-space: nowrap;
          }

        }
      `}</style>
    </div>
  );
};

export default AdminPage;
