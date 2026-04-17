import './SettingsPanel.css';

function SettingsPanel({ 
  refreshInterval, 
  onIntervalChange, 
  onManualRefresh, 
  autoRefresh, 
  onToggleAutoRefresh,
  lastUpdate,
  loading,
  isRefreshing,
  isMockMode
}) {
  const intervals = [
    { label: '5 мин', value: 300000 },
    { label: '10 мин', value: 600000 },
    { label: '30 мин', value: 1800000 },
    { label: '1 час', value: 3600000 }
  ];

  const formatLastUpdate = () => {
    if (!lastUpdate) return '—';
    return lastUpdate.toLocaleTimeString('ru-RU');
  };

  return (
    <div className="settings-panel">
      <div className="settings-controls">
        <div className="auto-refresh-control">
          <label className="switch">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={onToggleAutoRefresh}
            />
            <span className="slider"></span>
          </label>
        </div>

        {autoRefresh && (
          <div className="interval-selector">
            <select 
              value={refreshInterval} 
              onChange={(e) => onIntervalChange(Number(e.target.value))}
            >
              {intervals.map(interval => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <button 
          className={`manual-refresh-btn ${isRefreshing ? 'refreshing' : ''}`} 
          onClick={onManualRefresh}
          disabled={loading || isRefreshing}
        >
          {isRefreshing ? '⟳' : '🔄'}
        </button>

        <div className="last-update">
          📅 {formatLastUpdate()}
        </div>

        {isMockMode && (
          <div className="mock-indicator" title="Тестовые данные">
            📦
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPanel;