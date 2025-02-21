'use client';

import React, { useState } from 'react';
import { useWizard } from './WizardContext';

const gradientTextStyle = "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent";

export function URLInput() {
  const { setUserURL, setStep } = useWizard();
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const validateURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add https:// if no protocol is specified
    let urlToValidate = inputValue;
    if (!urlToValidate.startsWith('http://') && !urlToValidate.startsWith('https://')) {
      urlToValidate = `https://${urlToValidate}`;
    }

    if (validateURL(urlToValidate)) {
      setUserURL(urlToValidate);
      setError('');
      setStep(2); // Move to next step
    } else {
      setError('Please enter a valid URL');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className={`text-2xl font-bold mb-4 ${gradientTextStyle}`}>
        Enter Your Website URL to Get Started
      </h1>
      <p className="text-gray-800 mb-6 font-medium">
        We&apos;ll create an optimized version of your site tailored to your needs
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="www.example.com"
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-gray-900 placeholder-gray-500 font-medium"
          />
          {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}
        </div>
        
        <button
          type="submit"
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-lg hover:from-gray-800 hover:to-gray-600 transition-all font-medium"
        >
          Free CRO Audit
        </button>
      </form>
    </div>
  );
} 