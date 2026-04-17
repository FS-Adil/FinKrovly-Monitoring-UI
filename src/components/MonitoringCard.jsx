import './MonitoringCard.css';
import OrdersTable from './OrdersTable';

function MonitoringCard({ id, title, count, orders, isExpanded, onToggle }) {
  return (
    <div className="monitoring-card">
      <div className="card-header" onClick={onToggle}>
        <div className="card-info">
          <h3>{title}</h3>
          <div className="card-count">
            <span className="count-number">{count}</span>
          </div>
        </div>
        <div className={`card-arrow ${isExpanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>
      
      {isExpanded && (
        <div className="card-content">
          {orders.length > 0 ? (
            <OrdersTable orders={orders} />
          ) : (
            <div className="empty-table">—</div>
          )}
        </div>
      )}
    </div>
  );
}

export default MonitoringCard;