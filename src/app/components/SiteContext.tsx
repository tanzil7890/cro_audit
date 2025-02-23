'use client';

import React, { useEffect, useState } from 'react';
import { useWizard } from './WizardContext';
import { APIResponse, ScrapeResponse } from '../types/api';
import { IframeErrorBoundary } from './ErrorBoundary';
import { MultiSelectQuestion } from './MultiSelectQuestion';

export function SiteContext() {
  const { 
    userURL, 
    setSiteDescription, 
    setStep,
    setOptimizationContext 
  } = useWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [currentPhase, setCurrentPhase] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  const questions = [
    {
      title: "What is your site about?",
      description: "Helps us craft messaging that aligns with your site's purpose and goals",
      type: "description",
      placeholder: "Describe your website's purpose..."
    },
    {
      title: "What are the key benefits your website offers?",
      description: "Let's emphasize the benefits that matter most to your audience",
      type: "benefits",
      placeholder: "Select or add key benefits..."
    },
    {
      title: "Who is your ideal target audience?",
      description: "Ensures the page resonates deeply with your audience's needs",
      type: "audience",
      placeholder: "Select or add target audiences..."
    },
    {
      title: "Who would you consider your main competitors?",
      description: "Helps us position your site uniquely against competitors",
      type: "competitors",
      placeholder: "Select or add competitors..."
    },
    {
      title: "What common objections do potential customers have?",
      description: "Helps address concerns and build trust with your audience",
      type: "objections",
      placeholder: "Select or add potential objections..."
    },
    {
      title: "Which keywords are you currently targeting or aiming to rank for?",
      description: "Optimizes your content to improve rankings and conversions",
      type: "keywords",
      placeholder: "Select or add target keywords..."
    }
  ];

  useEffect(() => {
    const fetchSiteInfo = async () => {
      try {
        setIsLoading(true);
        setApiError('');
        setCurrentPhase('Analyzing your website\'s content and visual elements...');
        setProgress(25);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: userURL }),
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        setCurrentPhase('Gathering competitive insights from your industry...');
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result: APIResponse<ScrapeResponse> = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to analyze website');
        }

        setCurrentPhase('Processing website structure and content hierarchy...');
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const description = result.data.aiDescription || '';
        setAnswers(prev => ({
          ...prev,
          description: [description]
        }));
        setSiteDescription(description);
        
        // Generate suggestions based on the website analysis
        const suggestedBenefits = [
          'Increased conversion rates',
          'Better user engagement',
          'Improved search rankings'
        ];
        
        const suggestedAudience = [
          'E-commerce businesses',
          'Digital marketers',
          'Website owners'
        ];
        
        const suggestedCompetitors = [
          'Similar tools in your industry',
          'Direct competitors',
          'Alternative solutions'
        ];
        
        const suggestedObjections = [
          'Trust and Credibility',
          'Pricing Transparency',
          'Usability and Ease of Integration'
        ];
        
        const suggestedKeywords = [
          'Website optimization',
          'Conversion rate optimization',
          'User experience improvement'
        ];
        
        setSuggestions({
          benefits: suggestedBenefits,
          audience: suggestedAudience,
          competitors: suggestedCompetitors,
          objections: suggestedObjections,
          keywords: suggestedKeywords
        });
        
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching site info:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to analyze website');
        setIsLoading(false);
      }
    };

    if (userURL) {
      fetchSiteInfo();
    }
  }, [userURL, setSiteDescription]);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setOptimizationContext(answers);
      setStep(5);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setStep(2);
    }
  };

  const handleSelectionChange = (selections: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestion].type]: selections
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
      {/* Left side - Questions Flow */}
      <div>
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round((currentQuestion + 1) / questions.length * 100)}% Complete</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          {isLoading ? (
            <div className="space-y-6 bg-white rounded-lg p-6 border-2 border-gray-100">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 text-xl">🔍</span>
                    </div>
                    <div className="font-medium text-gray-900">{currentPhase}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {progress}% complete
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {apiError}
                </div>
              )}
              
              {currentQuestion === 0 ? (
                <textarea
                  value={answers[questions[currentQuestion].type]?.[0] || ''}
                  onChange={(e) => handleSelectionChange([e.target.value])}
                  className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                  placeholder={questions[currentQuestion].placeholder}
                  disabled={isLoading}
                />
              ) : (
                <MultiSelectQuestion
                  title={questions[currentQuestion].title}
                  description={questions[currentQuestion].description}
                  suggestions={suggestions[questions[currentQuestion].type] || []}
                  onSelectionChange={handleSelectionChange}
                  initialSelections={answers[questions[currentQuestion].type] || []}
                />
              )}
            </>
          )}

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
              disabled={isLoading || !answers[questions[currentQuestion].type]?.length}
            >
              {currentQuestion === questions.length - 1 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Website Preview */}
      <div className="bg-gray-100 rounded-lg">
        <div className="relative h-[800px] bg-white rounded-lg overflow-hidden shadow-lg">
          <IframeErrorBoundary url={userURL} />
        </div>
      </div>
    </div>
  );
} 