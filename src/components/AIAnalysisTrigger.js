import React, { useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost } from '../utils/api';

const AIAnalysisTrigger = ({ caseId, onAnalysisComplete, children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [error, setError] = useState(null);

  const triggerAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await apiPost(`/ai-case-analysis/analyze/${caseId}`);
      
      if (response.status === 'success') {
        setAnalysisStatus({
          is_analyzed: true,
          generated_at: response.generated_at,
          status: 'analyzed'
        });
        
        // Notify parent component that analysis is complete
        if (onAnalysisComplete) {
          onAnalysisComplete(response.analysis);
        }
      } else if (response.status === 'already_analyzed') {
        setAnalysisStatus({
          is_analyzed: true,
          generated_at: response.generated_at,
          status: 'analyzed'
        });
      } else {
        setError(response.message || 'Analysis failed');
      }
    } catch (err) {
      console.error('Error triggering analysis:', err);
      setError('Failed to analyze case');
    } finally {
      setIsAnalyzing(false);
    }
  }, [caseId, onAnalysisComplete]);

  const checkAnalysisStatus = useCallback(async () => {
    try {
      const response = await apiGet(`/ai-case-analysis/status/${caseId}`);
      setAnalysisStatus(response);
      
      // If not analyzed, trigger analysis
      if (!response.is_analyzed) {
        triggerAnalysis();
      }
    } catch (err) {
      console.error('Error checking analysis status:', err);
      setError('Failed to check analysis status');
    }
  }, [caseId, triggerAnalysis]);

  useEffect(() => {
    checkAnalysisStatus();
  }, [caseId, checkAnalysisStatus]);

  const retryAnalysis = () => {
    triggerAnalysis();
  };

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Analyzing case with AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-600 mb-2">Analysis failed: {error}</div>
          <button
            onClick={retryAnalysis}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (analysisStatus?.is_analyzed) {
    return (
      <div className="w-full">
        {children}
        <div className="text-xs text-gray-500 mt-2">
          AI Analysis completed on {new Date(analysisStatus.generated_at).toLocaleString()}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {children}
    </div>
  );
};

export default AIAnalysisTrigger;
