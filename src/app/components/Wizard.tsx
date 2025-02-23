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
  { component: URLInput },
  { component: AgentSelection },
  { component: SiteContext },
  { component: QuestionFlow },
  { component: OptimizedPage }
];

export function Wizard() {
  const { 
    step, 
    setStep, 
    userURL,
    setOptimizationContext 
  } = useWizard();

  const handleQuestionComplete = (answers: Record<QuestionType, string[]>) => {
    setOptimizationContext(answers);
    setStep(5);
  };

  const CurrentStepComponent = steps[step - 1].component;
  const componentProps = (CurrentStepComponent === QuestionFlow
    ? {
        url: userURL,
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
            className="mb-6 flex items-center text-gray-900 hover:text-gray-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        {/* Current step content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-[90rem] mx-auto"
          >
            <CurrentStepComponent {...componentProps} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 