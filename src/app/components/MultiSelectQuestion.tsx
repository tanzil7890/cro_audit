'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectQuestionProps {
  title: string;
  description: string;
  suggestions: string[];
  onSelectionChange: (selections: string[]) => void;
  initialSelections?: string[];
  questionType: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export function MultiSelectQuestion({
  title,
  description,
  suggestions,
  onSelectionChange,
  initialSelections = [],
  questionType
}: MultiSelectQuestionProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelections);
  const [customInput, setCustomInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customOptionsMap, setCustomOptionsMap] = useState<Record<string, string[]>>({});
  const [error, setError] = useState('');

  const customOptions = customOptionsMap[questionType] || [];
  
  const allOptions = [...suggestions, ...customOptions];

  const handleSelect = (item: string) => {
    const newSelection = selectedItems.includes(item)
      ? selectedItems.filter(i => i !== item)
      : [...selectedItems, item];
    
    setSelectedItems(newSelection);
    onSelectionChange(newSelection);
  };

  const validateCustomOption = (option: string): boolean => {
    if (option.trim().length < 2) {
      setError('Option must be at least 2 characters long');
      return false;
    }
    if (allOptions.includes(option.trim())) {
      setError('This option already exists');
      return false;
    }
    return true;
  };

  const handleAddCustomOption = () => {
    const trimmedInput = customInput.trim();
    if (!trimmedInput) return;

    if (validateCustomOption(trimmedInput)) {
      setCustomOptionsMap(prev => ({
        ...prev,
        [questionType]: [...(prev[questionType] || []), trimmedInput]
      }));
      setSelectedItems(prev => [...prev, trimmedInput]);
      onSelectionChange([...selectedItems, trimmedInput]);
      setCustomInput('');
      setIsAddingCustom(false);
      setError('');
    }
  };

  const handleCustomInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCustomOption();
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold mb-2 text-gray-900">{title}</h2>
        <p className="text-gray-900 mb-4 font-medium">{description}</p>
      </motion.div>

      <motion.div 
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {allOptions.map((item, index) => (
          <motion.div
            key={item}
            custom={index}
            variants={itemVariants}
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              selectedItems.includes(item)
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-orange-200'
            } ${customOptions.includes(item) ? 'border-dashed' : ''}`}
            onClick={() => handleSelect(item)}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedItems.includes(item)}
                onChange={() => handleSelect(item)}
                className="h-5 w-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
              />
              <div className="flex-1 flex items-center gap-2">
                <span className="text-gray-900 font-medium">{item}</span>
                {customOptions.includes(item) && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Custom</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {isAddingCustom ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-2"
          >
            <div className="space-y-2">
              <motion.input
                type="text"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  setError('');
                }}
                onKeyPress={handleCustomInputKeyPress}
                placeholder="Enter your custom option"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 font-medium"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                autoFocus
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-sm font-medium"
                >
                  {error}
                </motion.p>
              )}
            </div>
            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleAddCustomOption}
                disabled={!customInput.trim()}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsAddingCustom(false);
                  setCustomInput('');
                  setError('');
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-900 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsAddingCustom(true)}
            className="mt-4 text-orange-600 hover:text-orange-700 flex items-center gap-2 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add your own option
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 