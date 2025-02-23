'use client';

import React, { useState, useEffect } from 'react';
import { MultiSelectQuestion } from './MultiSelectQuestion';
import { QuestionType } from '../services/suggestions';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionFlowProps {
  url: string;
  websiteInfo?: {
    title: string;
    description: string;
    mainContent: string;
  };
  onComplete: (answers: Record<QuestionType, string[]>) => void;
}

const questions: Array<{
  type: QuestionType;
  title: string;
  description: string;
}> = [
  {
    type: 'benefits',
    title: 'What are the key benefits your website offers?',
    description: "Let's emphasize the benefits that matter most to your audience"
  },
  {
    type: 'audience',
    title: 'Who is your ideal target audience?',
    description: "Ensures the page resonates deeply with your audience's needs"
  },
  {
    type: 'competitors',
    title: 'Who would you consider your main competitors?',
    description: 'Helps us position your site uniquely against competitors'
  },
  {
    type: 'objections',
    title: 'What common objections do potential customers have?',
    description: 'Helps address concerns and build trust with your audience'
  },
  {
    type: 'keywords',
    title: 'Which keywords are you currently targeting or aiming to rank for?',
    description: 'Optimizes your content to improve rankings and conversions'
  }
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function QuestionFlow({ url, websiteInfo, onComplete }: QuestionFlowProps) {
  const [[currentStep, direction], setCurrentStep] = useState([0, 0]);
  const [answers, setAnswers] = useState<Record<QuestionType, string[]>>({
    benefits: [],
    audience: [],
    competitors: [],
    objections: [],
    keywords: []
  });
  const [suggestions, setSuggestions] = useState<Record<QuestionType, string[]>>({
    benefits: [],
    audience: [],
    competitors: [],
    objections: [],
    keywords: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch('/api/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionType: questions[currentStep].type,
            url,
            websiteInfo
          }),
        });

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to load suggestions');
        }

        setSuggestions(prev => ({
          ...prev,
          [questions[currentStep].type]: result.data.suggestions
        }));
      } catch (error) {
        console.error('Error loading suggestions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load suggestions');
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestions();
  }, [currentStep, url, websiteInfo]);

  const paginate = (newDirection: number) => {
    if (
      (currentStep === 0 && newDirection === -1) ||
      (currentStep === questions.length - 1 && newDirection === 1)
    ) {
      return;
    }
    setCurrentStep([currentStep + newDirection, newDirection]);
  };

  const handleSelectionChange = (selections: string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].type]: selections
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      paginate(1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      paginate(-1);
    }
  };

  const currentQuestion = questions[currentStep];

  return (
    <div className="space-y-6">
      {/* Progress indicator with animation */}
      <motion.div 
        className="flex items-center justify-between mb-8"
        initial={false}
        animate={{ opacity: 1 }}
      >
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-2 bg-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep + 1) / questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <motion.div 
            className="mt-2 text-sm text-gray-900 font-medium"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Step {currentStep + 1} of {questions.length}
          </motion.div>
        </div>
      </motion.div>

      {/* Question content with animations */}
      <AnimatePresence mode="wait" initial={false} custom={direction}>
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-64"
          >
            <motion.div
              className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p className="text-red-700 font-medium">{error}</p>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                handleNext();
              } else if (swipe > swipeConfidenceThreshold) {
                handleBack();
              }
            }}
          >
            <MultiSelectQuestion
              title={currentQuestion.title}
              description={currentQuestion.description}
              suggestions={suggestions[currentQuestion.type]}
              onSelectionChange={handleSelectionChange}
              initialSelections={answers[currentQuestion.type]}
              questionType={currentQuestion.type}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons with animations */}
      <motion.div 
        className="flex justify-between pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={handleBack}
          className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition-colors text-gray-900 font-medium"
          disabled={currentStep === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={handleNext}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {currentStep === questions.length - 1 ? 'Complete' : 'Next'}
        </motion.button>
      </motion.div>
    </div>
  );
} 