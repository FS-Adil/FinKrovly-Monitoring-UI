const API_URL = '/api/orders';

console.log('[API] 🔌 Инициализация API модуля');
console.log(`[API] 🎯 Endpoint: ${API_URL}`);

const getDateWithDelay = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getMockOrders = () => {
  console.log('[MOCK] 📦 Генерация моковых данных');
  const mockData = [
    { id: 1, number: 'ORD-001', date: getDateWithDelay(5), author: 'Иванов И.И.', comment: 'Срочный заказ', status: 'conducted', paid: false, productionOrder: false, hasProduction: false },
    { id: 2, number: 'ORD-002', date: getDateWithDelay(4), author: 'Петров П.П.', comment: 'Оплачен полностью', status: 'conducted', paid: true, productionOrder: false, hasProduction: false },
    { id: 3, number: 'ORD-003', date: getDateWithDelay(6), author: 'Сидоров С.С.', comment: 'Ждем материалы', status: 'conducted', paid: true, productionOrder: true, hasProduction: false },
    { id: 4, number: 'ORD-004', date: getDateWithDelay(7), author: 'Кузнецова А.А.', comment: 'В производстве', status: 'conducted', paid: true, productionOrder: false, hasProduction: true },
    { id: 5, number: 'ORD-005', date: getDateWithDelay(3), author: 'Смирнов Д.Д.', comment: 'Обычный заказ', status: 'conducted', paid: false, productionOrder: true, hasProduction: false },
    { id: 6, number: 'ORD-006', date: getDateWithDelay(8), author: 'Волкова Е.Е.', comment: 'На производстве', status: 'conducted', paid: false, productionOrder: false, hasProduction: true },
    { id: 7, number: 'ORD-007', date: getDateWithDelay(10), author: 'Новикова Г.Г.', comment: 'Давно не оплачен', status: 'conducted', paid: false, productionOrder: false, hasProduction: false },
    { id: 8, number: 'ORD-008', date: getDateWithDelay(12), author: 'Федоров А.А.', comment: 'Требуется внимание', status: 'conducted', paid: true, productionOrder: true, hasProduction: true },
    { id: 9, number: 'ORD-009', date: getDateWithDelay(15), author: 'Михайлова О.О.', comment: 'Долгий заказ', status: 'conducted', paid: false, productionOrder: false, hasProduction: false },
    { id: 10, number: 'ORD-010', date: getDateWithDelay(20), author: 'Алексеев К.К.', comment: 'Просрочен', status: 'conducted', paid: true, productionOrder: true, hasProduction: false }
  ];
  console.log(`[MOCK] ✅ Сгенерировано ${mockData.length} записей`);
  return mockData;
};

const normalizeOrderData = (order) => {
  return {
    id: order.id || order.ID,
    number: order.number || order.order_number || order.Num,
    date: order.date || order.order_date || order.Date,
    author: order.author || order.created_by || order.Author,
    comment: order.comment || order.Comment || '',
    status: order.status || order.Status || 'conducted',
    paid: order.paid || order.is_paid || order.Paid || false,
    productionOrder: order.productionOrder || order.has_production_order || order.ProductionOrder || false,
    hasProduction: order.hasProduction || order.in_production || order.HasProduction || false
  };
};

export const fetchOrdersFromAPI = async () => {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = performance.now();
  
  console.log(`[API:${requestId}] 🌐 Выполнение запроса к ${API_URL}`);
  console.log(`[API:${requestId}] ⏱️ Время начала: ${new Date().toISOString()}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-cache',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = performance.now() - startTime;
    console.log(`[API:${requestId}] 📡 Получен ответ за ${responseTime.toFixed(2)}ms`);
    console.log(`[API:${requestId}] 📊 Статус ответа: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[API:${requestId}] 📦 Тип данных: ${Array.isArray(data) ? 'массив' : typeof data}`);
    
    let orders = [];
    
    if (Array.isArray(data)) {
      orders = data.map(normalizeOrderData);
      console.log(`[API:${requestId}] ✅ Данные в формате массива, ${orders.length} записей`);
    } else if (data.data && Array.isArray(data.data)) {
      orders = data.data.map(normalizeOrderData);
      console.log(`[API:${requestId}] ✅ Данные в поле 'data', ${orders.length} записей`);
    } else if (data.orders && Array.isArray(data.orders)) {
      orders = data.orders.map(normalizeOrderData);
      console.log(`[API:${requestId}] ✅ Данные в поле 'orders', ${orders.length} записей`);
    } else {
      console.warn(`[API:${requestId}] ⚠️ Неизвестный формат данных`);
      throw new Error('UNKNOWN_DATA_FORMAT');
    }
    
    const endTime = performance.now();
    console.log(`[API:${requestId}] ✅ Запрос успешно завершен за ${(endTime - startTime).toFixed(2)}ms`);
    
    orders._isMockData = false;
    return orders;
    
  } catch (error) {
    const errorTime = performance.now() - startTime;
    console.error(`[API:${requestId}] ❌ ОШИБКА через ${errorTime.toFixed(2)}ms`);
    console.error(`[API:${requestId}] 🔥 Тип: ${error.name}`);
    console.error(`[API:${requestId}] 📝 Сообщение: ${error.message}`);
    
    let errorDetails = '';
    
    if (error.name === 'AbortError') {
      errorDetails = 'TIMEOUT: Превышено время ожидания';
    } else if (error.message.includes('Failed to fetch')) {
      errorDetails = 'NETWORK_ERROR: Сервер недоступен';
    } else if (error.message.includes('HTTP')) {
      errorDetails = `HTTP_ERROR: ${error.message}`;
    } else {
      errorDetails = error.message;
    }
    
    console.log(`[API:${requestId}] 🔄 Fallback на моковые данные`);
    const mockData = getMockOrders();
    mockData._isMockData = true;
    mockData._errorDetails = errorDetails;
    
    console.log(`[API:${requestId}] 📦 Возвращено ${mockData.length} моковых записей`);
    return mockData;
  }
};

export const checkAPIAvailability = async () => {
  console.log('[API] 🔍 Проверка доступности API');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(API_URL, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    const isAvailable = response.ok;
    console.log(`[API] 📡 API ${isAvailable ? 'ДОСТУПЕН' : 'НЕДОСТУПЕН'}`);
    return isAvailable;
  } catch (error) {
    console.error('[API] ❌ Ошибка проверки:', error.message);
    return false;
  }
};