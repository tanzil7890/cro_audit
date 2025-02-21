'use client';

import React from 'react';
import { useWizard } from './WizardContext';
import { URLInput } from './URLInput';
import { SiteContext } from './SiteContext';
import { AgentSelection } from './AgentSelection';
import { OptimizedPage } from './OptimizedPage';
import { QuestionFlow } from './QuestionFlow';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionType } from '../services/suggestions';

const steps = [
  { number: 1, label: 'Input URL', component: URLInput },
  { number: 2, label: 'Select Agent', component: AgentSelection },
  { number: 3, label: 'Site Context', component: SiteContext },
  { number: 4, label: 'Questions', component: QuestionFlow },
  { number: 5, label: 'Optimized Page', component: OptimizedPage }
];

const gradientTextStyle = "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent";

export function Wizard() {
  const { 
    step, 
    setStep, 
    userURL, 
    selectedAgent, 
    siteDescription,
    websiteInfo,
    setOptimizationContext 
  } = useWizard();

  const canNavigateToStep = (targetStep: number) => {
    switch (targetStep) {
      case 1:
        return true;
      case 2:
        return !!userURL;
      case 3:
        return !!userURL && !!selectedAgent;
      case 4:
        return !!userURL && !!selectedAgent && !!siteDescription;
      case 5:
        return !!userURL && !!selectedAgent && !!siteDescription;
      default:
        return false;
    }
  };

  const handleStepClick = (targetStep: number) => {
    if (canNavigateToStep(targetStep)) {
      setStep(targetStep);
    }
  };

  const handleQuestionComplete = (answers: Record<QuestionType, string[]>) => {
    setOptimizationContext(answers);
    setStep(5);
  };

  const CurrentStepComponent = steps[step - 1].component;
  const componentProps = (CurrentStepComponent === QuestionFlow
    ? {
        url: userURL,
        websiteInfo: websiteInfo ? {
          title: websiteInfo.title,
          description: websiteInfo.description || '',
          mainContent: websiteInfo.mainContent
        } : undefined,
        onComplete: handleQuestionComplete
      }
    : {}) as React.ComponentProps<typeof CurrentStepComponent>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className={`mb-6 flex items-center ${gradientTextStyle} hover:from-gray-800 hover:to-gray-500`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Progress bar */}
        <div className="flex items-center justify-between max-w-3xl mx-auto mb-8">
          <div className="flex items-center flex-1">
            {steps.map((s) => (
              <React.Fragment key={s.number}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    canNavigateToStep(s.number)
                      ? s.number <= step
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={() => handleStepClick(s.number)}
                  role="button"
                  tabIndex={0}
                >
                  {s.number}
                </div>
                {s.number < steps.length && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-all ${
                      s.number < step ? 'bg-gray-900' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step labels */}
        <div className="flex justify-between max-w-3xl mx-auto text-sm mb-12">
          {steps.map((s) => (
            <span
              key={s.number}
              className={`${
                canNavigateToStep(s.number)
                  ? s.number <= step
                    ? gradientTextStyle + ' cursor-pointer'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
              onClick={() => handleStepClick(s.number)}
              role="button"
              tabIndex={0}
            >
              {s.label}
            </span>
          ))}
        </div>

        {/* Current step content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto"
          >
            <CurrentStepComponent {...componentProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 