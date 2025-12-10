import { collection, getDocs, query, limit } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

import { adminConfig } from '../../config/env';
import { db } from '../../config/firebase';
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
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string>('');

  // Check Firebase connection status
  useEffect(() => {
    if (isAuthenticated) {
      checkFirebaseConnection();
    }
  }, [isAuthenticated]);

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

  const checkFirebaseConnection = async () => {
    try {
      // Directly test Firebase connection by querying the orders collection
      // This will throw an error if Firebase is not properly connected
      const ordersRef = collection(db, 'orders');
      await getDocs(query(ordersRef, limit(1)));
      
      // If we get here, the connection is working
      setFirebaseConnected(true);
      setConnectionError('');
      return true;
    } catch (error: any) {
      // Connection failed
      setFirebaseConnected(false);
      
      // Check if it's a permissions error
      const isPermissionError = error?.code === 'permission-denied' || 
                                error?.message?.toLowerCase().includes('permission') ||
                                error?.message?.toLowerCase().includes('insufficient');
      
      let errorMessage = error?.message || error?.code || 'Failed to connect to Firebase';
      
      if (isPermissionError) {
        errorMessage = `Permission Denied: ${errorMessage}. Please update your Firestore security rules to allow read/write access to the 'orders' collection.`;
      }
      
      setConnectionError(errorMessage);
      console.error('Firebase connection error:', error);
      return false;
    }
  };

  const handleReconnectFirebase = async () => {
    setFirebaseConnected(null);
    setConnectionError('');
    const connected = await checkFirebaseConnection();
    if (connected) {
      loadOrders();
      loadStats();
    }
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

  const [funButtonActive, setFunButtonActive] = useState(false);
  const [funMessage, setFunMessage] = useState('');

  const funMessages = [
    '🎤 Why don\'t scientists trust atoms? Because they make up everything! 🎤',
    '🎭 I told my wife she was drawing her eyebrows too high. She looked surprised! 🎭',
    '🌮 I would tell you a chemistry joke, but I know I wouldn\'t get a reaction! 🌮',
    '🐴 I used to be a baker, but I couldn\'t make enough dough! 🐴',
    '🚪 I\'m reading a book about anti-gravity. It\'s impossible to put down! 🚪',
    '🍞 Why did the scarecrow win an award? He was outstanding in his field! 🍞',
    '⏰ I told my computer a joke, but it didn\'t get it. It must need more RAM! ⏰',
    '🥖 What do you call a fake noodle? An impasta! 🥖',
    '🚗 Why don\'t eggs tell jokes? They\'d crack each other up! 🚗',
    '🍝 I don\'t trust stairs. They\'re always up to something! 🍝',
    '🌙 Why did the math book look so sad? Because it had too many problems! 🌙',
    '🧀 What do you call a sleeping bull? A bulldozer! 🧀',
    '🎪 Why don\'t programmers like nature? It has too many bugs! 🎪',
    '🍕 I asked my dog what\'s two minus two. He said nothing! 🍕',
    '📚 Why did the golfer bring two pairs of pants? In case he got a hole in one! 📚',
    '🎸 What\'s the best thing about Switzerland? I don\'t know, but the flag is a big plus! 🎸',
    '🚲 Why don\'t bicycles fall over? Because they\'re two tired! 🚲',
    '☕ What do you call a bear with no teeth? A gummy bear! ☕',
    '🎯 Why did the coffee file a police report? It got mugged! 🎯',
    '🎨 What do you call a factory that makes okay products? A satisfactory! 🎨',
    '🌮 Want to hear a joke about construction? I\'m still working on it! 🌮',
    '🍔 Why don\'t skeletons fight each other? They don\'t have the guts! 🍔',
    '🎭 What did one ocean say to the other? Nothing, they just waved! 🎭',
    '🎪 Why did the tomato turn red? Because it saw the salad dressing! 🎪',
    '🎵 How do you organize a space party? You planet! 🎵',
  ];

  const handleFunButton = () => {
    const randomMessage = funMessages[Math.floor(Math.random() * funMessages.length)];
    setFunMessage(randomMessage);
    setFunButtonActive(true);
    
    // Reset after animation
    setTimeout(() => {
      setFunButtonActive(false);
    }, 3000);
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
        
        {firebaseConnected === false && (
          <div className="firebase-warning-banner" style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#856404', display: 'block', marginBottom: '4px' }}>
                Firebase Database Not Connected
              </strong>
              <p style={{ color: '#856404', margin: '0 0 8px 0', fontSize: '14px' }}>
                The Firebase database connection is currently disabled. Orders are being sent via email only and will not appear in this dashboard.
              </p>
              {connectionError && (
                <div style={{ marginBottom: '12px' }}>
                  <p style={{ color: '#dc2626', margin: '0 0 8px 0', fontSize: '12px', fontFamily: 'monospace' }}>
                    Error: {connectionError}
                  </p>
                  {connectionError.includes('Permission Denied') && (
                    <div style={{ 
                      backgroundColor: '#fef3c7', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#92400e'
                    }}>
                      <strong>How to fix:</strong>
                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                        <li>Go to Firebase Console → Firestore Database → Rules</li>
                        <li>Update your security rules to allow access:</li>
                      </ol>
                      <pre style={{ 
                        backgroundColor: '#1f2937', 
                        color: '#10b981', 
                        padding: '8px', 
                        borderRadius: '4px', 
                        marginTop: '8px',
                        fontSize: '11px',
                        overflow: 'auto'
                      }}>
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{orderId} {
      allow read, write: if true; // For testing
      // In production, use: allow read, write: if request.auth != null;
    }
    match /garmentRatios/{docId} {
      allow read: if true;
      allow write: if true; // For testing
    }
  }
}`}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleReconnectFirebase}
                disabled={firebaseConnected === null}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: firebaseConnected === null ? 'wait' : 'pointer',
                  opacity: firebaseConnected === null ? 0.6 : 1
                }}
              >
                {firebaseConnected === null ? 'Connecting...' : 'Reconnect Firebase'}
              </button>
            </div>
          </div>
        )}

        {firebaseConnected === true && (
          <div className="firebase-success-banner" style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>✅</span>
            <div>
              <strong style={{ color: '#065f46', display: 'block', marginBottom: '4px' }}>
                Firebase Database Connected
              </strong>
              <p style={{ color: '#065f46', margin: 0, fontSize: '14px' }}>
                Orders are being saved to Firebase and will appear in this dashboard.
              </p>
            </div>
          </div>
        )}

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
                      <th className="col-order-id">Order ID</th>
                      <th className="col-college">College</th>
                      <th className="col-store">Store</th>
                      <th className="col-manager">Manager</th>
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
                            to={`/all-orders?orderId=${order.id}`}
                            className="store-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Store #{order.storeNumber}
                          </Link>
                        </td>
                        <td className="col-manager">{order.storeManager}</td>
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
              <button 
                className="admin-action-button"
                onClick={() => navigate('/all-orders')}
              >
                <span className="action-icon">📋</span>
                <span>View All Orders</span>
              </button>
              <button 
                className="admin-action-button"
                onClick={() => navigate('/admin/colleges')}
              >
                <span className="action-icon">🏫</span>
                <span>Manage Colleges</span>
              </button>
              <button className="admin-action-button">
                <span className="action-icon">➕</span>
                <span>Add New Product</span>
              </button>
              <button 
                className={`admin-action-button fun-button ${funButtonActive ? 'active' : ''}`}
                onClick={handleFunButton}
              >
                <span className="action-icon">🎉</span>
                <span>Surprise Me!</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Message Overlay */}
      {funButtonActive && funMessage && (
        <>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                background: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'][Math.floor(Math.random() * 8)],
                top: '-10px',
              }}
            />
          ))}
          <div className="fun-message">{funMessage}</div>
        </>
      )}

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

        .admin-table-container {
          background: white;
          border-radius: 12px;
          overflow-x: auto;
          overflow-y: visible;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          -webkit-overflow-scrolling: touch;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .col-order-id,
        .col-college,
        .col-manager,
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

        .delete-btn:hover {
          background: #fecaca;
        }

        .admin-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
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
          width: 100%;
          box-sizing: border-box;
          min-height: 100px;
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

        .fun-button {
          position: relative;
          overflow: hidden;
        }

        .fun-button.active {
          animation: funPulse 0.5s ease-in-out;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradientShift 2s ease infinite, funPulse 0.5s ease-in-out;
          color: white;
          border: none;
          transform: scale(1.1);
        }

        .fun-button.active .action-icon {
          animation: spin 0.5s ease-in-out, bounce 1s ease-in-out infinite;
        }

        .fun-button.active span:last-child {
          color: white;
          font-weight: 700;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes funPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .fun-message {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 60px;
          border-radius: 20px;
          font-size: clamp(1.125rem, 3vw, 1.75rem);
          font-weight: 700;
          z-index: 2000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: messageAppear 0.5s ease-out, messageDisappear 0.5s ease-in 2.5s;
          pointer-events: none;
          text-align: center;
          white-space: normal;
          width: auto;
          min-width: 300px;
          max-width: min(90vw, 800px);
          word-wrap: break-word;
          overflow-wrap: break-word;
          line-height: 1.4;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes messageDisappear {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
          }
        }

        .confetti {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #ff6b6b;
          animation: confettiFall 3s linear forwards;
          z-index: 1999;
        }

        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @media (max-width: 768px) {
          .fun-message {
            padding: 30px 40px;
            font-size: clamp(1rem, 4vw, 1.5rem);
            max-width: 85vw;
            min-width: 280px;
          }

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

          .admin-stats-grid {
            grid-template-columns: 1fr;
            gap: 16px;
            margin-bottom: 30px;
          }

          .admin-stat-card {
            padding: 20px;
          }

          .stat-icon {
            font-size: 28px;
          }

          .stat-number {
            font-size: 1.25rem;
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

          .admin-actions-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .admin-action-button {
            padding: 16px 12px;
            min-height: 90px;
          }

          .action-icon {
            font-size: 20px;
          }

          .admin-action-button span:last-child {
            font-size: 0.8125rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .fun-message {
            padding: 24px 30px;
            font-size: clamp(0.9375rem, 4.5vw, 1.25rem);
            max-width: 90vw;
            min-width: 250px;
            border-radius: 16px;
          }

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

          .admin-stats-grid {
            gap: 12px;
            margin-bottom: 24px;
          }

          .admin-stat-card {
            padding: 16px;
            gap: 12px;
          }

          .stat-icon {
            font-size: 24px;
          }

          .stat-content h3 {
            font-size: 0.8125rem;
          }

          .stat-number {
            font-size: 1.125rem;
          }

          .stat-change {
            font-size: 0.6875rem;
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

          .admin-actions-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .admin-action-button {
            padding: 14px 10px;
            min-height: 80px;
          }

          .action-icon {
            font-size: 18px;
          }

          .admin-action-button span:last-child {
            font-size: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;
