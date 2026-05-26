'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/app/components/admin/ProtectedRoute';
import { getAdminOrders, type AdminOrder } from '@/lib/api';
import './admin-orders.scss';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAdminOrders();
        setOrders(data);
      } catch {
        setError('Erreur lors du chargement des commandes');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <ProtectedRoute>
      <div className="admin-orders-page">
        <div className="container">
          <div className="admin-header">
            <div>
              <h1>Commandes</h1>
              <p>Suivez toutes les commandes générées par Stripe</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {loading ? (
            <div className="loading">Chargement des commandes...</div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <p>Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Client</th>
                    <th>Stripe Session</th>
                    <th>Date</th>
                    <th>Montant</th>
                    <th>Articles</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td data-label="ID">#{order.id}</td>
                      <td data-label="Client">
                        <strong>{order.userEmail || order.userId}</strong>
                      </td>
                      <td data-label="Stripe Session">
                        <span className="session-id">{order.stripeSessionId}</span>
                      </td>
                      <td data-label="Date">{new Date(order.createdAtUtc).toLocaleString('fr-CA')}</td>
                      <td data-label="Montant">${order.totalAmount.toFixed(2)}</td>
                      <td data-label="Articles">
                        <div className="order-items">
                          {order.items.map((item) => (
                            <span key={`${order.id}-${item.productId}`} className="item-badge">
                              {item.productName} x{item.quantity}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
