import React, { useState, useEffect } from 'react';
import matchupPredictor from '../../utils/MatchupPredictor';
import predictionDebugger from '../../utils/PredictionDebugger';

const PredictionDebugControls = ({ isVisible = false, onToggle }) => {
  const [debugEnabled, setDebugEnabled] = useState(predictionDebugger.isEnabled);
  const [debugReport, setDebugReport] = useState(null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Update debug report when debugging is enabled
    if (debugEnabled) {
      const interval = setInterval(() => {
        const report = predictionDebugger.getDebugReport();
        setDebugReport(report);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [debugEnabled]);

  const handleToggleDebug = () => {
    if (debugEnabled) {
      predictionDebugger.disable();
      setDebugEnabled(false);
    } else {
      predictionDebugger.enable();
      setDebugEnabled(true);
    }
  };

  const handleShowPanel = () => {
    matchupPredictor.showDebugPanel();
    setShowPanel(true);
  };

  const handleExportReport = () => {
    matchupPredictor.exportDebugReport();
  };

  const handlePrintReport = () => {
    matchupPredictor.printDebugReport();
  };

  const handleClearLogs = () => {
    predictionDebugger.clear();
    setDebugReport(null);
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={onToggle}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Show Debug Controls"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center">
          🔍 Prediction Debugger
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Debug Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Enable Debugging</span>
          <button
            onClick={handleToggleDebug}
            className={`px-3 py-1 rounded text-xs ${
              debugEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {debugEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Debug Status */}
        {debugEnabled && debugReport && (
          <div className="bg-gray-50 rounded p-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-gray-500">Logs:</span>
                <span className="font-medium ml-1">{debugReport.summary.totalLogs}</span>
              </div>
              <div>
                <span className="text-gray-500">Errors:</span>
                <span className={`font-medium ml-1 ${debugReport.summary.totalErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {debugReport.summary.totalErrors}
                </span>
              </div>
              <div>
                <span className="text-gray-500">API Calls:</span>
                <span className="font-medium ml-1">{debugReport.summary.totalApiCalls}</span>
              </div>
              <div>
                <span className="text-gray-500">Time:</span>
                <span className="font-medium ml-1">{debugReport.summary.totalTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleShowPanel}
            disabled={!debugEnabled}
            className="px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Show Panel
          </button>
          <button
            onClick={handlePrintReport}
            disabled={!debugEnabled || !debugReport}
            className="px-3 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Print Report
          </button>
          <button
            onClick={handleExportReport}
            disabled={!debugEnabled || !debugReport}
            className="px-3 py-2 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export JSON
          </button>
          <button
            onClick={handleClearLogs}
            disabled={!debugEnabled}
            className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Logs
          </button>
        </div>

        {/* Recent Errors */}
        {debugEnabled && debugReport && debugReport.errors.length > 0 && (
          <div className="bg-red-50 rounded p-2">
            <div className="text-xs text-red-800 font-medium mb-1">Recent Errors:</div>
            <div className="space-y-1">
              {debugReport.errors.slice(-3).map((error, index) => (
                <div key={index} className="text-xs text-red-600">
                  [{error.timestamp}] {error.category}: {error.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 border-t pt-2">
          Enable debugging to track prediction API calls, data fetching, and errors in real-time.
        </div>
      </div>
    </div>
  );
};

export default PredictionDebugControls;
