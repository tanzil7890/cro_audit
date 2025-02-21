'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWizard } from './WizardContext';
import { IframeErrorBoundary } from './ErrorBoundary';
import { getAgentOptimizations } from '../utils/agentOptimizations';

interface ScanningPhase {
  message: string;
  progress: number;
}

interface Enhancement {
  title: string;
  before: string;
  after: string;
  type: 'heading' | 'description' | 'cta' | 'seo';
}

interface ContentAnalysis {
  headings: string[];
  description: string;
  keywords: string[];
  seoScore: number;
}

const scanningPhases: ScanningPhase[] = [
  { message: "Analyzing website structure...", progress: 6 },
  { message: "Evaluating content strategy...", progress: 8 },
  { message: "Checking performance metrics...", progress: 10 },
  { message: "Identifying optimization opportunities...", progress: 12 },
  { message: "Generating personalized suggestions...", progress: 15 }
];

export function OptimizedPage() {
  const { userURL, selectedAgent, siteDescription, optimizationResult, setOptimizationResult, websiteInfo } = useWizard();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [insights, setInsights] = useState<{
    conversionRate: number;
    problems: string[];
    enhancements: Enhancement[];
  }>({
    conversionRate: 15,
    problems: [],
    enhancements: []
  });

  const analyzeContent = async () => {
    if (!websiteInfo) return null;

    // Extract headings from content
    const headings = websiteInfo.mainHeadings || [];
    
    // Get description
    const description = websiteInfo.description || '';
    
    // Extract potential keywords
    const keywords = websiteInfo.mainContent
      .split(/\s+/)
      .filter(word => word.length > 4)
      .slice(0, 10);

    // Calculate basic SEO score
    const seoScore = Math.min(
      ((headings.length * 10) + 
      (description.length > 100 ? 30 : 0) + 
      (keywords.length * 5)) / 10,
      100
    );

    return {
      headings,
      description,
      keywords,
      seoScore
    };
  };

  const generateInsights = (analysis: ContentAnalysis) => {
    const problems = [];
    const enhancements = [];

    // Check headings
    if (analysis.headings.length < 2) {
      problems.push("Limited use of headings for content structure");
    }

    // Check description
    if (!analysis.description || analysis.description.length < 100) {
      problems.push("The current webpage lacks emphasis on unique benefits and value proposition");
    }

    // Check SEO
    if (analysis.seoScore < 50) {
      problems.push("Low SEO optimization score, missing key elements");
    }

    // Generate enhancement suggestions
    if (websiteInfo) {
      // Content enhancement
      enhancements.push({
        title: "Enhanced Content Strategy",
        before: websiteInfo.description || "No description available",
        after: `Optimize your content with key benefits: ${analysis.keywords.slice(0, 3).join(', ')}. Address customer pain points and highlight your unique value proposition.`,
        type: "description" as const
      });

      // Heading enhancement
      if (websiteInfo.mainHeadings && websiteInfo.mainHeadings.length > 0) {
        enhancements.push({
          title: "Improved Headlines",
          before: websiteInfo.mainHeadings[0],
          after: `Convert More with ${websiteInfo.mainHeadings[0].split(' ').slice(-2).join(' ')}`,
          type: "heading" as const
        });
      }

      // CTA enhancement
      enhancements.push({
        title: "Optimized Call-to-Action",
        before: "Book a Demo",
        after: "Get Your Free Optimization Report",
        type: "cta" as const
      });
    }

    return {
      conversionRate: 15,
      problems,
      enhancements
    };
  };

  const analyzeWebsite = async () => {
    try {
      setIsLoading(true);
      setError('');
      setProgress(0); // Start at 0

      // Initial delay before starting
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Progress through each phase
      for (let i = 0; i < scanningPhases.length; i++) {
        setCurrentPhase(i);
        
        // Set progress for current phase
        const currentProgress = scanningPhases[i].progress;
        setProgress(currentProgress);

        // Perform phase-specific analysis
        switch (i) {
          case 0: // Analyzing website structure
            const analysis = await analyzeContent();
            if (analysis) {
              setContentAnalysis(analysis);
            }
            break;
          case 1: // Evaluating content strategy
            if (contentAnalysis) {
              const insights = generateInsights(contentAnalysis);
              setInsights(insights);
            }
            break;
          case 2: // Checking performance metrics
            if (selectedAgent) {
              const result = getAgentOptimizations(selectedAgent, siteDescription);
              setOptimizationResult(result);
            }
            break;
          // Additional phases can perform their specific tasks
        }

        // Wait before moving to next phase
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Ensure we reach the final progress state
      setProgress(15);
      
      // Small delay before completing
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    } catch (error) {
      console.error('Error analyzing website:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze website');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userURL || !selectedAgent) {
      setError('Missing required information. Please complete all previous steps.');
      setIsLoading(false);
      return;
    }

    if (selectedAgent && !optimizationResult) {
      analyzeWebsite();
    }
  }, [selectedAgent, userURL]); // Simplified dependencies

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-8"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="text-2xl font-bold text-gray-900">
              Hang tight we are upgrading your site
            </div>
          </div>

          <div className="w-full max-w-md mx-auto space-y-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-gray-900 font-medium"
            >
              {scanningPhases[currentPhase]?.message}
            </motion.div>
            <div className="text-sm text-gray-600 font-medium">
              {progress}% complete
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !optimizationResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 font-medium mb-4">{error || 'Something went wrong'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Website Preview */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white rounded-lg border-2 border-gray-200 h-[600px] overflow-hidden">
              <IframeErrorBoundary
                url={userURL}
                className="w-full h-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Right side - Insights and Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Conversion Rate Insight */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
            <div className="text-5xl font-bold text-emerald-600 mb-2">
              {insights.conversionRate}%
            </div>
            <div className="text-gray-600 text-sm">
              Potential Conversion Rate Uplift<br />
              Identified by Our Optimization Engine
            </div>
          </div>

          {/* Problems Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Problems I see on your page</h3>
            {insights.problems.map((problem, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  🔍
                </div>
                <p className="text-gray-800">{problem}</p>
              </div>
            ))}
          </div>

          {/* Enhancements Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              I made {insights.enhancements.length} enhancements to your website
            </h3>
            {insights.enhancements.map((enhancement, index) => (
              <div key={index} className="bg-white rounded-lg border-2 border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    ✨
                  </div>
                  <h4 className="font-medium text-gray-900">{enhancement.title}</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-500 mb-1">Previous Copy</div>
                    <div className="text-gray-900">{enhancement.before}</div>
                  </div>
                  <div className="bg-emerald-50 p-3 rounded">
                    <div className="text-sm text-emerald-600 mb-1">Enhanced Version</div>
                    <div className="text-gray-900">{enhancement.after}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Data Insights Section */}
          <div className="bg-black rounded-lg p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📊</span>
              <h3 className="text-lg font-semibold">Data-driven Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span>⏱️</span>
                <span>Previous Copy</span>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                Basic analytics dashboard
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-orange-500 text-white rounded-lg font-medium text-lg hover:bg-orange-600 transition-colors"
          >
            Book Demo
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 