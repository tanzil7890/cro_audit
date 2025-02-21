'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiSelectQuestionProps {
  title: string;
  description: string;
  suggestions: string[];
  onSelectionChange: (selections: string[]) => void;
  initialSelections?: string[];
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
  initialSelections = []
}: MultiSelectQuestionProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelections);
  const [customInput, setCustomInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Combine suggestions with custom options
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
      setCustomOptions(prev => [...prev, trimmedInput]);
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
        className="space-y-3"
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
            onHoverStart={() => setHoveredItem(item)}
            onHoverEnd={() => setHoveredItem(null)}
            className={`p-4 border rounded-lg cursor-pointer transition-all relative ${
              selectedItems.includes(item)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            } ${customOptions.includes(item) ? 'border-dashed' : ''}`}
            onClick={() => handleSelect(item)}
          >
            <div className="flex items-center gap-3">
              <motion.div
                initial={false}
                animate={{
                  scale: selectedItems.includes(item) ? 1 : 0.8,
                  opacity: selectedItems.includes(item) ? 1 : 0.5
                }}
                className="relative"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item)}
                  onChange={() => handleSelect(item)}
                  className="h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                />
                {selectedItems.includes(item) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-blue-500" viewBox="0 0 12 12">
                      <path
                        d="M3.5 6.5L5 8L8.5 4.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
              <div className="flex-1 flex items-center gap-2">
                <label className="cursor-pointer text-gray-900 font-medium">{item}</label>
                {customOptions.includes(item) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Custom</span>
                )}
              </div>
            </div>

            <AnimatePresence>
              {hoveredItem === item && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-full left-0 mt-2 p-2 bg-gray-900 text-white text-sm rounded shadow-lg z-10 font-medium"
                >
                  Click to {selectedItems.includes(item) ? 'deselect' : 'select'} this option
                </motion.div>
              )}
            </AnimatePresence>
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
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium"
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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
            className="mt-4 text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
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