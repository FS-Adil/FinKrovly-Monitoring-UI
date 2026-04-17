import './OrdersTable.css';

function OrdersTable({ orders }) {
  return (
    <div className="orders-table-container">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Номер</th>
            <th>Дата</th>
            <th>Автор</th>
            <th>Комментарий</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={order.id || index}>
              <td>{order.number}</td>
              <td>{order.date}</td>
              <td>{order.author}</td>
              <td>{order.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersTable;