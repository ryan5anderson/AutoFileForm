import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { adminConfig } from '../../config/env';
import { firebaseOrderService, Order } from '../../services/firebaseOrderService';


const AllOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Skip auth for now since coming from admin dashboard
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [filterCollege, setFilterCollege] = useState<string>('all');
  const [filterStoreNumber, setFilterStoreNumber] = useState<string>('all');

  // Load all orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllOrders();
    }
  }, [isAuthenticated]);

  // Set up real-time subscription for all orders
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = firebaseOrderService.subscribeToOrders((orders) => {
        setOrders(orders);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Handle orderId from URL query parameter - navigate to receipt page instead of modal
  useEffect(() => {
    if (isAuthenticated && orders.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const orderId = searchParams.get('orderId');
      if (orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          // Navigate to a receipt route instead of showing modal
          // For now, we'll use a route like /receipt/:orderId or pass data via state
          // Since we need the order data, we'll store it and navigate
          navigate(`/receipt/${orderId}`, { 
            state: { 
              order,
              fromAllOrders: true 
            },
            replace: true 
          });
        }
      }
    }
  }, [isAuthenticated, orders, location.search, navigate]);


  const loadAllOrders = async () => {
    try {
      const allOrders = await firebaseOrderService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminConfig.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  // Filter orders based on status, college, and store number
  const filteredOrders = orders.filter(order => {
    const statusMatch = filterStatus === 'all' || order.status === filterStatus;
    const collegeMatch = filterCollege === 'all' || order.college === filterCollege;
    const storeMatch = filterStoreNumber === 'all' || order.storeNumber === filterStoreNumber;
    return statusMatch && collegeMatch && storeMatch;
  });

  // Get unique colleges for filter
  const uniqueColleges = Array.from(new Set(orders.map(order => order.college))).sort();
  
  // Get unique store numbers for filter
  const uniqueStoreNumbers = Array.from(new Set(orders.map(order => order.storeNumber))).sort((a, b) => {
    // Sort numerically if possible, otherwise alphabetically
    const numA = parseInt(a, 10);
    const numB = parseInt(b, 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.localeCompare(b);
  });



  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-lock-icon">🔒</div>
            <h2>Admin Access</h2>
            <p>Enter admin password to view all orders</p>
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
              Access All Orders
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/admin')} 
            className="admin-back-button"
          >
            ← Back to Admin Dashboard
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
    <div className="all-orders-page">
      {/* Filters */}
      <div className="filters-section">
        <div className="filters-container">
          <button 
            onClick={() => navigate('/admin', { state: { isAuthenticated: true } })} 
            className="back-button"
          >
            ← Back to Dashboard
          </button>
          <div className="filter-group">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select 
              id="status-filter"
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as Order['status'] | 'all')}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="college-filter">Filter by College:</label>
            <select 
              id="college-filter"
              value={filterCollege} 
              onChange={(e) => setFilterCollege(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Colleges</option>
              {uniqueColleges.map(college => (
                <option key={college} value={college}>{college}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="store-filter">Filter by Store #:</label>
            <select 
              id="store-filter"
              value={filterStoreNumber} 
              onChange={(e) => setFilterStoreNumber(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stores</option>
              {uniqueStoreNumbers.map(storeNumber => (
                <option key={storeNumber} value={storeNumber}>Store #{storeNumber}</option>
              ))}
            </select>
          </div>

          <div className="order-count">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="orders-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found matching your filters.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="order-card" 
                onClick={() => navigate(`/receipt/${order.id}`, { 
                  state: { 
                    order,
                    fromAllOrders: true 
                  } 
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/receipt/${order.id}`, { 
                      state: { 
                        order,
                        fromAllOrders: true 
                      } 
                    });
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="order-header">
                  <div className="order-id">{order.id}</div>
                  <div className={`order-status status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
                
                <div className="order-info">
                  <div className="info-row">
                    <span className="label">College:</span>
                    <span className="value">{order.college}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Store:</span>
                    <span className="value">#{order.storeNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Manager:</span>
                    <span className="value">{order.storeManager}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(order.date).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Total Items:</span>
                    <span className="value">{order.totalItems}</span>
                  </div>
                </div>

                <div className="order-footer">
                  <span className="created-at">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </span>
                  <span className="click-hint">Click to view receipt</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .all-orders-page {
          min-height: 100vh;
          background: #f8fafc;
          padding-top: 72px; /* Account for fixed header */
        }


        .back-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .filters-section {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 20px 0;
        }

        .filters-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          gap: 24px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: space-between;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .filter-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          background: white;
          color: #1f2937;
          min-width: 150px;
        }
        
        .filter-select option {
          color: #1f2937;
          background: white;
        }

        .order-count {
          margin-left: auto;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .orders-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 20px;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-orders {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .order-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #e5e7eb;
        }

        .order-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
          border-color: #3b82f6;
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .order-id {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .order-status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-completed {
          background: #d1fae5;
          color: #065f46;
        }

        .status-cancelled {
          background: #fee2e2;
          color: #dc2626;
        }

        .order-info {
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .info-row .label {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .info-row .value {
          color: #1f2937;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .order-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .created-at {
          color: #6b7280;
          font-size: 0.75rem;
        }

        .click-hint {
          color: #3b82f6;
          font-size: 0.75rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .filters-container {
            flex-direction: column;
            align-items: stretch;
          }

          .orders-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AllOrdersPage;

