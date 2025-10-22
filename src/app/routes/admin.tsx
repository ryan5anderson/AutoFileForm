import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { firebaseOrderService, Order } from '../../services/firebaseOrderService';

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    location.state?.isAuthenticated || false
  );
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    recentOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
  });

  // Load orders and stats when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
      loadStats();
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

  const loadStats = async () => {
    const stats = await firebaseOrderService.getOrderStats();
    setOrderStats(stats);
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (await firebaseOrderService.updateOrderStatus(orderId, newStatus)) {
      loadOrders();
      loadStats();
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      if (await firebaseOrderService.deleteOrder(orderId)) {
        loadOrders();
        loadStats();
      }
    }
  };

  const addTestOrder = async () => {
    const testOrder = await firebaseOrderService.addOrder({
      college: 'Alabama University',
      storeNumber: '001',
      storeManager: 'John Smith',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      totalItems: 15,
      orderNotes: 'Test order for demonstration',
    });
    loadOrders();
    loadStats();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check - in production, this would be more secure
    if (password === 'admin123') {
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
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Orders</h3>
              <p className="stat-number">{orderStats.totalOrders}</p>
              <p className="stat-change">{orderStats.recentOrders} this month</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pending Orders</h3>
              <p className="stat-number">{orderStats.pendingOrders}</p>
              <p className="stat-change">Awaiting processing</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Total Products</h3>
              <p className="stat-number">{orderStats.totalProducts}</p>
              <p className="stat-change">Items ordered</p>
            </div>
          </div>

          <div className="admin-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p className="stat-number">{orderStats.completedOrders}</p>
              <p className="stat-change">Successfully processed</p>
            </div>
          </div>
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
                      <th>Order ID</th>
                      <th>College</th>
                      <th>Store</th>
                      <th>Manager</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        <td>{order.college}</td>
                        <td>Store #{order.storeNumber}</td>
                        <td>{order.storeManager}</td>
                        <td>{new Date(order.date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-${order.status}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td>
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

          <div className="admin-section">
            <h2>Quick Actions</h2>
            <div className="admin-actions-grid">
              <button className="admin-action-button" onClick={addTestOrder}>
                <span className="action-icon">🧪</span>
                <span>Add Test Order</span>
              </button>
              <button 
                className="admin-action-button"
                onClick={() => navigate('/all-orders')}
              >
                <span className="action-icon">📋</span>
                <span>View All Orders</span>
              </button>
              <button className="admin-action-button">
                <span className="action-icon">➕</span>
                <span>Add New Product</span>
              </button>
              <button className="admin-action-button">
                <span className="action-icon">🏫</span>
                <span>Manage Colleges</span>
              </button>
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
        }

        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .admin-stat-card {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          font-size: 32px;
          opacity: 0.8;
        }

        .stat-content h3 {
          margin: 0 0 8px 0;
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-number {
          margin: 0 0 4px 0;
          color: #1f2937;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-change {
          margin: 0;
          color: #059669;
          font-size: 0.75rem;
        }

        .admin-sections {
          display: grid;
          gap: 30px;
        }

        .admin-section h2 {
          margin: 0 0 20px 0;
          color: #1f2937;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .admin-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
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

        .delete-btn:hover {
          background: #fecaca;
        }

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .admin-action-button {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .admin-action-button:hover {
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
          transform: translateY(-2px);
        }

        .action-icon {
          font-size: 24px;
        }

        .admin-action-button span:last-child {
          color: #374151;
          font-weight: 500;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .admin-header-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .admin-stats-grid {
            grid-template-columns: 1fr;
          }

          .admin-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
