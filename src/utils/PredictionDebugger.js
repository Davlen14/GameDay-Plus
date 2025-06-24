/**
 * Comprehensive Prediction Debugger
 * Shows detailed logs, JSON data, and error tracking for matchup predictions
 */

class PredictionDebugger {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.apiCalls = [];
    this.dataFetched = {};
    this.isEnabled = true;
    this.startTime = null;
  }

  startDebugging(homeTeam, awayTeam) {
    this.clear();
    this.startTime = Date.now();
    this.log('🚀 DEBUG START', `Starting prediction for ${homeTeam} vs ${awayTeam}`, 'info');
  }

  log(category, message, level = 'info', data = null) {
    if (!this.isEnabled) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      timestamp,
      category,
      message,
      level,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      elapsed: this.startTime ? Date.now() - this.startTime : 0
    };
    
    this.logs.push(logEntry);
    
    // Console output with styling
    const style = this.getConsoleStyle(level);
    console.log(`%c[${timestamp}] ${category}: ${message}`, style);
    
    if (data) {
      console.log('📊 Data:', data);
    }
  }

  error(category, message, error, context = null) {
    const errorEntry = {
      timestamp: new Date().toLocaleTimeString(),
      category,
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      elapsed: this.startTime ? Date.now() - this.startTime : 0
    };
    
    this.errors.push(errorEntry);
    this.log(category, `❌ ERROR: ${message}`, 'error', { error: errorEntry.error, context });
  }

  trackApiCall(service, method, params, result, error = null) {
    const apiCall = {
      timestamp: new Date().toLocaleTimeString(),
      service,
      method,
      params: JSON.parse(JSON.stringify(params)),
      success: !error,
      result: result ? JSON.parse(JSON.stringify(result)) : null,
      error: error ? { name: error.name, message: error.message } : null,
      elapsed: this.startTime ? Date.now() - this.startTime : 0
    };
    
    this.apiCalls.push(apiCall);
    
    if (error) {
      this.log('API CALL', `❌ ${service}.${method} FAILED`, 'error', apiCall);
    } else {
      this.log('API CALL', `✅ ${service}.${method} SUCCESS`, 'success', apiCall);
    }
  }

  trackDataFetch(dataType, source, success, data = null, error = null) {
    this.dataFetched[dataType] = {
      source,
      success,
      timestamp: new Date().toLocaleTimeString(),
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      error: error ? { name: error.name, message: error.message } : null,
      elapsed: this.startTime ? Date.now() - this.startTime : 0
    };
    
    const status = success ? '✅' : '❌';
    this.log('DATA FETCH', `${status} ${dataType} from ${source}`, success ? 'success' : 'error', {
      dataType,
      source,
      success,
      error
    });
  }

  getConsoleStyle(level) {
    const styles = {
      info: 'color: #2196F3; font-weight: normal;',
      success: 'color: #4CAF50; font-weight: bold;',
      warning: 'color: #FF9800; font-weight: bold;',
      error: 'color: #F44336; font-weight: bold;',
      debug: 'color: #9C27B0; font-weight: normal;'
    };
    return styles[level] || styles.info;
  }

  clear() {
    this.logs = [];
    this.errors = [];
    this.apiCalls = [];
    this.dataFetched = {};
    this.startTime = null;
  }

  getDebugReport() {
    const endTime = Date.now();
    const totalTime = this.startTime ? endTime - this.startTime : 0;
    
    return {
      summary: {
        totalTime: `${totalTime}ms`,
        totalLogs: this.logs.length,
        totalErrors: this.errors.length,
        totalApiCalls: this.apiCalls.length,
        successfulApiCalls: this.apiCalls.filter(call => call.success).length,
        failedApiCalls: this.apiCalls.filter(call => !call.success).length,
        dataFetchAttempts: Object.keys(this.dataFetched).length,
        successfulDataFetches: Object.values(this.dataFetched).filter(d => d.success).length
      },
      logs: this.logs,
      errors: this.errors,
      apiCalls: this.apiCalls,
      dataFetched: this.dataFetched,
      timeline: this.generateTimeline()
    };
  }

  generateTimeline() {
    const allEvents = [
      ...this.logs.map(log => ({ ...log, type: 'log' })),
      ...this.errors.map(error => ({ ...error, type: 'error' })),
      ...this.apiCalls.map(call => ({ ...call, type: 'api' }))
    ].sort((a, b) => a.elapsed - b.elapsed);
    
    return allEvents;
  }

  printDebugReport() {
    const report = this.getDebugReport();
    
    console.group('🔍 PREDICTION DEBUG REPORT');
    console.log('📊 Summary:', report.summary);
    
    if (report.errors.length > 0) {
      console.group('❌ ERRORS');
      report.errors.forEach(error => {
        console.error(`[${error.timestamp}] ${error.category}: ${error.message}`);
        console.error('Error details:', error.error);
        if (error.context) console.error('Context:', error.context);
      });
      console.groupEnd();
    }
    
    if (report.apiCalls.length > 0) {
      console.group('🌐 API CALLS');
      report.apiCalls.forEach(call => {
        const status = call.success ? '✅' : '❌';
        console.log(`${status} [${call.timestamp}] ${call.service}.${call.method}`);
        console.log('  Params:', call.params);
        if (call.result) console.log('  Result:', call.result);
        if (call.error) console.error('  Error:', call.error);
      });
      console.groupEnd();
    }
    
    console.group('📈 DATA FETCH STATUS');
    Object.entries(report.dataFetched).forEach(([dataType, info]) => {
      const status = info.success ? '✅' : '❌';
      console.log(`${status} ${dataType} (${info.source})`);
      if (info.data) console.log('  Data sample:', info.data);
      if (info.error) console.error('  Error:', info.error);
    });
    console.groupEnd();
    
    console.groupEnd();
    
    return report;
  }

  // Export report as JSON for external analysis
  exportReport() {
    const report = this.getDebugReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction-debug-${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('📄 Debug report exported to JSON file');
  }

  // Create visual debug panel
  createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'prediction-debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 80vh;
      background: #1a1a1a;
      color: #fff;
      border: 1px solid #333;
      border-radius: 8px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      overflow-y: auto;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #333;
    `;
    header.innerHTML = `
      <span style="font-weight: bold; color: #4CAF50;">🔍 Prediction Debug</span>
      <button onclick="this.closest('#prediction-debug-panel').remove()" 
              style="background: #f44336; border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">×</button>
    `;
    
    const content = document.createElement('div');
    content.id = 'debug-content';
    
    panel.appendChild(header);
    panel.appendChild(content);
    document.body.appendChild(panel);
    
    return panel;
  }

  updateDebugPanel() {
    const panel = document.getElementById('prediction-debug-panel');
    if (!panel) return;
    
    const content = document.getElementById('debug-content');
    if (!content) return;
    
    const report = this.getDebugReport();
    
    content.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="color: #4CAF50; font-weight: bold;">Summary</div>
        <div>Time: ${report.summary.totalTime}</div>
        <div>Logs: ${report.summary.totalLogs}</div>
        <div>Errors: <span style="color: ${report.summary.totalErrors > 0 ? '#f44336' : '#4CAF50'}">${report.summary.totalErrors}</span></div>
        <div>API Calls: ${report.summary.successfulApiCalls}/${report.summary.totalApiCalls}</div>
      </div>
      
      <div style="margin-bottom: 12px;">
        <div style="color: #2196F3; font-weight: bold;">Recent Logs</div>
        <div style="max-height: 200px; overflow-y: auto;">
          ${this.logs.slice(-10).map(log => `
            <div style="margin: 4px 0; color: ${this.getLogColor(log.level)};">
              [${log.elapsed}ms] ${log.category}: ${log.message}
            </div>
          `).join('')}
        </div>
      </div>
      
      ${report.errors.length > 0 ? `
        <div style="margin-bottom: 12px;">
          <div style="color: #f44336; font-weight: bold;">Errors</div>
          <div style="max-height: 150px; overflow-y: auto;">
            ${report.errors.map(error => `
              <div style="margin: 4px 0; color: #f44336; font-size: 11px;">
                [${error.elapsed}ms] ${error.category}: ${error.message}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 12px;">
        <button onclick="window.predictionDebugger.exportReport()" 
                style="background: #2196F3; border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
          Export Report
        </button>
        <button onclick="window.predictionDebugger.printDebugReport()" 
                style="background: #4CAF50; border: none; color: white; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
          Print Report
        </button>
      </div>
    `;
  }

  getLogColor(level) {
    const colors = {
      info: '#2196F3',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      debug: '#9C27B0'
    };
    return colors[level] || colors.info;
  }

  enable() {
    this.isEnabled = true;
    console.log('🔍 Prediction debugger enabled');
  }

  disable() {
    this.isEnabled = false;
    console.log('🔍 Prediction debugger disabled');
  }
}

// Create global debugger instance
const predictionDebugger = new PredictionDebugger();

// Make it globally available for console access
if (typeof window !== 'undefined') {
  window.predictionDebugger = predictionDebugger;
}

export default predictionDebugger;
