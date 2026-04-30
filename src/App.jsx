import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import MonitoringCard from './components/MonitoringCard';
import SettingsPanel from './components/SettingsPanel';
import { fetchOrdersFromAPI } from './services/api';

function App() {

  // Внутри компонента App monitoring приложения
  // В App.jsx monitoring приложения
const containerRef = useRef(null);
const heightSentRef = useRef(false);

useEffect(() => {
  let timeoutId = null;
  
  const sendHeight = () => {
  // Измеряем ВЕСЬ документ, а не только контейнер
  const body = document.body;
  const html = document.documentElement;
  
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight
  );
  
  console.log(`📤 [Monitoring] Полная высота документа: ${height}px`);
  window.parent.postMessage({ type: 'RESIZE', height }, '*');
};

  // Отправляем READY только один раз
  window.parent.postMessage({ type: 'READY' }, '*');

  // Начальная отправка
  sendHeight();

  // Наблюдатель с debounce
  const observer = new ResizeObserver(sendHeight);
  if (containerRef.current) {
    observer.observe(containerRef.current);
  }

  return () => {
    if (timeoutId) clearTimeout(timeoutId);
    observer.disconnect();
  };
}, []);





  const [expandedCard, setExpandedCard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300000);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);
  const [mockMessage, setMockMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const cardsConfig = [
    {
      id: 1,
      title: 'Заказ проведен',
      filter: (order) => order.status === 'conducted'
    },
    {
      id: 2,
      title: 'Заказ проведен и оплачен',
      filter: (order) => order.status === 'conducted' && order.paid
    },
    {
      id: 3,
      title: 'Заказ проведен, оплачен и есть заказ на производство',
      filter: (order) => order.status === 'conducted' && order.paid && order.productionOrder
    },
    {
      id: 4,
      title: 'Заказ проведен, оплачен, есть производство',
      filter: (order) => order.status === 'conducted' && order.paid && order.hasProduction
    },
    {
      id: 5,
      title: 'Заказ проведен и есть заказ на производство',
      filter: (order) => order.status === 'conducted' && order.productionOrder
    },
    {
      id: 6,
      title: 'Заказ проведен, есть производство',
      filter: (order) => order.status === 'conducted' && order.hasProduction
    }
  ];

  const loadData = useCallback(async (showRefreshIndicator = true) => {
    const startTime = performance.now();
    console.log('[APP] 🔄 Начало загрузки данных');
    console.log(`[APP] ⏱️ Таймштамп: ${new Date().toISOString()}`);
    
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    
    try {
      setLoading(true);
      const data = await fetchOrdersFromAPI();
      
      const endTime = performance.now();
      console.log(`[APP] ✅ Данные загружены за ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[APP] 📊 Получено записей: ${data.length}`);
      
      if (data._isMockData) {
        console.warn('[APP] ⚠️ РЕЖИМ МОК-ДАННЫХ АКТИВИРОВАН');
        console.warn(`[APP] 🔍 Причина: ${data._errorDetails}`);
        setIsMockMode(true);
        setMockMessage('📦 Тестовые данные');
      } else {
        console.log('[APP] 🟢 Режим реальных данных. Сервер доступен.');
        setIsMockMode(false);
        setMockMessage('');
      }
      
      const cleanData = data.map(({ _isMockData, _errorDetails, ...rest }) => rest);
      setOrders(cleanData);
      setLastUpdate(new Date());
      
      console.log('[APP] 📈 Статистика по статусам:');
      const stats = {
        conducted: cleanData.filter(o => o.status === 'conducted').length,
        paid: cleanData.filter(o => o.paid).length,
        productionOrder: cleanData.filter(o => o.productionOrder).length,
        hasProduction: cleanData.filter(o => o.hasProduction).length
      };
      console.table(stats);
      
    } catch (err) {
      console.error('[APP] ❌ Критическая ошибка загрузки:', err);
      setIsMockMode(true);
      setMockMessage('⚠️ Ошибка, тестовые данные');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
      console.log('[APP] 🏁 Завершение процесса загрузки\n');
    }
  }, []);

  useEffect(() => {
    console.log('[APP] 🚀 Инициализация приложения');
    loadData(false);
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) {
      console.log('[APP] ⏸️ Автообновление остановлено пользователем');
      return;
    }

    console.log(`[APP] ⏰ Настроено автообновление каждые ${refreshInterval / 1000} секунд`);
    const intervalId = setInterval(() => {
      console.log(`[APP] 🔄 Автоматическое обновление по таймеру (интервал: ${refreshInterval / 1000}с)`);
      loadData(true);
    }, refreshInterval);

    return () => {
      console.log('[APP] 🧹 Очистка интервала автообновления');
      clearInterval(intervalId);
    };
  }, [autoRefresh, refreshInterval, loadData]);

  const getMonitoringOrders = useCallback(() => {
    const today = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.date);
      const diffTime = today - orderDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      const isOverdue = diffDays > 3;
      if (isOverdue) {
        console.log(`[FILTER] Заказ ${order.number} просрочен на ${Math.floor(diffDays)} дней`);
      }
      return isOverdue;
    });
    console.log(`[FILTER] Всего просроченных заказов: ${filtered.length} из ${orders.length}`);
    return filtered;
  }, [orders]);

  const monitoringOrders = getMonitoringOrders();

  const cardsData = cardsConfig.map(config => ({
    ...config,
    orders: monitoringOrders.filter(config.filter),
    count: monitoringOrders.filter(config.filter).length
  }));

  const handleRefreshIntervalChange = (intervalMs) => {
    console.log(`[APP] 🔧 Интервал обновления изменен на ${intervalMs / 1000} секунд`);
    setRefreshInterval(intervalMs);
  };

  const handleManualRefresh = () => {
    console.log('[APP] 👆 Ручное обновление по запросу пользователя');
    loadData(true);
  };

  const handleToggleAutoRefresh = () => {
    console.log(`[APP] 🔘 Автообновление ${!autoRefresh ? 'включено' : 'выключено'}`);
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div ref={containerRef} className="app" style={{ minHeight: '100vh' }}>
      <div className="app-header">
        <h1>Контроль выполнения заказов</h1>
        <SettingsPanel
          refreshInterval={refreshInterval}
          onIntervalChange={handleRefreshIntervalChange}
          onManualRefresh={handleManualRefresh}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={handleToggleAutoRefresh}
          lastUpdate={lastUpdate}
          loading={loading}
          isRefreshing={isRefreshing}
          isMockMode={isMockMode}
        />
      </div>

      {isMockMode && (
        <div className="mock-banner">
          {mockMessage}
        </div>
      )}

      <div className={`content-wrapper ${isRefreshing ? 'refreshing' : ''}`}>
        {loading && orders.length === 0 ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Загрузка...</p>
          </div>
        ) : (
          <div className="cards-grid">
            {cardsData.map(card => (
              <MonitoringCard
                key={card.id}
                id={card.id}
                title={card.title}
                count={card.count}
                orders={card.orders}
                isExpanded={expandedCard === card.id}
                onToggle={() => {
                  console.log(`[UI] 📂 Карточка ${card.id} ${expandedCard === card.id ? 'закрыта' : 'открыта'}`);
                  setExpandedCard(expandedCard === card.id ? null : card.id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {isRefreshing && (
        <div className="refresh-overlay">
          <div className="refresh-spinner"></div>
          <div className="refresh-text">Обновление данных...</div>
        </div>
      )}
    </div>
  );
}

export default App;