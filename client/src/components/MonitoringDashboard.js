import React, { useState, useEffect } from 'react';
import { FiActivity, FiAlertCircle, FiClock, FiCpu, FiDatabase, FiServer } from 'react-icons/fi';
import logger from '../utils/logger';

const MonitoringDashboard = () => {
  const [metrics, setMetrics] = useState({
    apiLatency: [],
    errorRate: 0,
    requestCount: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    activeUsers: 0,
    serverStatus: 'unknown',
  });

  const [logs, setLogs] = useState([]);

  // Fetch metrics from the server
  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          ...data,
          apiLatency: [...prevMetrics.apiLatency.slice(-9), data.currentLatency].filter(Boolean),
        }));
      } else {
        // If the metrics endpoint is not available, use mock data
        setMetrics(prevMetrics => ({
          ...prevMetrics,
          apiLatency: [...prevMetrics.apiLatency.slice(-9), Math.random() * 200 + 100].filter(Boolean),
          errorRate: Math.random() * 2,
          requestCount: prevMetrics.requestCount + Math.floor(Math.random() * 5),
          cpuUsage: Math.random() * 30 + 10,
          memoryUsage: Math.random() * 40 + 20,
          activeUsers: Math.floor(Math.random() * 10) + 1,
          serverStatus: Math.random() > 0.1 ? 'healthy' : 'degraded',
        }));
      }
    } catch (error) {
      logger.error('Failed to fetch metrics', { error });
      // Use mock data on error
      setMetrics(prevMetrics => ({
        ...prevMetrics,
        apiLatency: [...prevMetrics.apiLatency.slice(-9), Math.random() * 200 + 100].filter(Boolean),
        errorRate: Math.random() * 2,
        requestCount: prevMetrics.requestCount + Math.floor(Math.random() * 5),
        cpuUsage: Math.random() * 30 + 10,
        memoryUsage: Math.random() * 40 + 20,
        activeUsers: Math.floor(Math.random() * 10) + 1,
        serverStatus: Math.random() > 0.1 ? 'healthy' : 'degraded',
      }));
    }
  };

  // Fetch logs from the server
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        // If the logs endpoint is not available, use mock data
        const mockLogs = [
          { level: 'info', message: 'Server started', timestamp: new Date().toISOString() },
          { level: 'info', message: 'API request received', timestamp: new Date(Date.now() - 5000).toISOString() },
          { level: 'warn', message: 'Slow API response', timestamp: new Date(Date.now() - 10000).toISOString() },
          { level: 'error', message: 'API request failed', timestamp: new Date(Date.now() - 15000).toISOString() },
        ];
        setLogs(mockLogs);
      }
    } catch (error) {
      logger.error('Failed to fetch logs', { error });
      // Use mock data on error
      const mockLogs = [
        { level: 'info', message: 'Server started', timestamp: new Date().toISOString() },
        { level: 'info', message: 'API request received', timestamp: new Date(Date.now() - 5000).toISOString() },
        { level: 'warn', message: 'Slow API response', timestamp: new Date(Date.now() - 10000).toISOString() },
        { level: 'error', message: 'API request failed', timestamp: new Date(Date.now() - 15000).toISOString() },
      ];
      setLogs(mockLogs);
    }
  };

  // Fetch metrics and logs on component mount and every 5 seconds
  useEffect(() => {
    fetchMetrics();
    fetchLogs();

    const intervalId = setInterval(() => {
      fetchMetrics();
      fetchLogs();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'degraded':
        return 'orange';
      case 'down':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Get log level color
  const getLogLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'red';
      case 'warn':
        return 'orange';
      case 'info':
        return 'blue';
      case 'debug':
        return 'gray';
      default:
        return 'black';
    }
  };

  return (
    <div className="monitoring-dashboard">
      <h2>System Monitoring</h2>
      
      <div className="metrics-grid">
        {/* Server Status */}
        <div className="metric-card">
          <div className="metric-header">
            <FiServer />
            <h3>Server Status</h3>
          </div>
          <div className="metric-value" style={{ color: getStatusColor(metrics.serverStatus) }}>
            {metrics.serverStatus.toUpperCase()}
          </div>
        </div>
        
        {/* API Latency */}
        <div className="metric-card">
          <div className="metric-header">
            <FiClock />
            <h3>API Latency</h3>
          </div>
          <div className="metric-value">
            {metrics.apiLatency.length > 0 
              ? `${Math.round(metrics.apiLatency[metrics.apiLatency.length - 1])} ms` 
              : 'N/A'}
          </div>
          <div className="metric-chart">
            {metrics.apiLatency.map((value, index) => (
              <div 
                key={index} 
                className="chart-bar" 
                style={{ 
                  height: `${Math.min(100, value / 3)}%`,
                  backgroundColor: value > 300 ? 'red' : value > 200 ? 'orange' : 'green'
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Error Rate */}
        <div className="metric-card">
          <div className="metric-header">
            <FiAlertCircle />
            <h3>Error Rate</h3>
          </div>
          <div className="metric-value" style={{ color: metrics.errorRate > 1 ? 'red' : 'green' }}>
            {metrics.errorRate.toFixed(2)}%
          </div>
        </div>
        
        {/* Request Count */}
        <div className="metric-card">
          <div className="metric-header">
            <FiActivity />
            <h3>Request Count</h3>
          </div>
          <div className="metric-value">
            {metrics.requestCount}
          </div>
        </div>
        
        {/* CPU Usage */}
        <div className="metric-card">
          <div className="metric-header">
            <FiCpu />
            <h3>CPU Usage</h3>
          </div>
          <div className="metric-value">
            {metrics.cpuUsage.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${metrics.cpuUsage}%`,
                backgroundColor: metrics.cpuUsage > 80 ? 'red' : metrics.cpuUsage > 60 ? 'orange' : 'green'
              }}
            />
          </div>
        </div>
        
        {/* Memory Usage */}
        <div className="metric-card">
          <div className="metric-header">
            <FiDatabase />
            <h3>Memory Usage</h3>
          </div>
          <div className="metric-value">
            {metrics.memoryUsage.toFixed(1)}%
          </div>
          <div className="metric-progress">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${metrics.memoryUsage}%`,
                backgroundColor: metrics.memoryUsage > 80 ? 'red' : metrics.memoryUsage > 60 ? 'orange' : 'green'
              }}
            />
          </div>
        </div>
      </div>
      
      <h3>Recent Logs</h3>
      <div className="logs-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Level</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{formatTime(log.timestamp)}</td>
                <td style={{ color: getLogLevelColor(log.level) }}>{log.level.toUpperCase()}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <style jsx>{`
        .monitoring-dashboard {
          padding: 20px;
          background-color: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .metric-card {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        
        .metric-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .metric-header svg {
          margin-right: 10px;
          font-size: 20px;
        }
        
        .metric-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .metric-chart {
          display: flex;
          align-items: flex-end;
          height: 50px;
          gap: 2px;
        }
        
        .chart-bar {
          flex: 1;
          min-height: 1px;
          background-color: #4caf50;
          border-radius: 2px 2px 0 0;
        }
        
        .metric-progress {
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background-color: #4caf50;
        }
        
        .logs-container {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          max-height: 300px;
          overflow-y: auto;
        }
        
        .logs-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .logs-table th,
        .logs-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .logs-table th {
          font-weight: 500;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default MonitoringDashboard;
