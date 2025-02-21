'use client';

import React, { useEffect, useState } from 'react';
import { useWizard } from './WizardContext';
import { APIResponse, ScrapeResponse } from '../types/api';
import { IframeErrorBoundary } from './ErrorBoundary';
import { QuestionFlow } from './QuestionFlow';

export function SiteContext() {
  const { 
    userURL, 
    siteDescription, 
    setSiteDescription, 
    setStep,
    websiteInfo,
    setOptimizationContext 
  } = useWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [localDescription, setLocalDescription] = useState(siteDescription);

  useEffect(() => {
    setLocalDescription(siteDescription);
  }, [siteDescription]);

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        setIsLoading(true);
        setApiError('');

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: userURL }),
        });

        const result: APIResponse<ScrapeResponse> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to analyze website');
        }

        setLocalDescription(result.data.aiDescription);
        setSiteDescription(result.data.aiDescription);
      } catch (error) {
        console.error('Error fetching site info:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to analyze website');
      } finally {
        setIsLoading(false);
      }
    };

    if (userURL) {
      fetchSiteInfo();
    }
  }, [userURL, setSiteDescription]);

  const handleNext = () => {
    if (localDescription.trim()) {
      setSiteDescription(localDescription);
      setShowQuestions(true);
      setStep(4); // Move to Questions step
    }
  };

  const handleBack = () => {
    setStep(2);
  };

  const handleQuestionsComplete = (answers: Record<string, string[]>) => {
    setOptimizationContext(answers);
    setStep(5);
  };

  if (showQuestions) {
    return (
      <QuestionFlow 
        url={userURL}
        websiteInfo={websiteInfo ?? undefined}
        onComplete={handleQuestionsComplete}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Left side - Website Preview */}
      <div className="bg-gray-100 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Website Preview</h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative h-96 bg-white rounded border">
            <IframeErrorBoundary
              url={userURL}
              className="w-full h-full rounded"
            />
          </div>
        )}
      </div>

      {/* Right side - Site Description */}
      <div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">What is your site about?</h2>
          <p className="text-gray-900 font-medium">
            Helps us craft messaging that aligns with your site&apos;s purpose and goals
          </p>
          
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {apiError}
            </div>
          )}
          
          <textarea
            value={localDescription}
            onChange={(e) => setLocalDescription(e.target.value)}
            className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
            placeholder="Describe your website's purpose..."
            disabled={isLoading}
          />

          <div className="flex justify-between pt-4">
            <button
              onClick={handleBack}
              className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-900 font-medium"
              disabled={isLoading}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={isLoading || !localDescription.trim()}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 