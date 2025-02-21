'use client';

import React from 'react';
import { useWizard } from './WizardContext';
import { Agent } from '../types/api';

const agents: Agent[] = [
  {
    id: 'liv',
    name: 'Liv',
    title: 'Personalization Agent',
    description: 'Liv creates tailored web experiences for every visitor, leveraging insights from ads and user behavior to deliver truly personalized pages that boost conversion.',
    imageUrl: '/agents/liv.jpg',
    capabilities: ['Personalization', 'User Behavior Analysis', 'Conversion Optimization']
  },
  {
    id: 'max',
    name: 'Max',
    title: 'Experimentation Agent',
    description: 'Max drives results through continuous A/B testing and data analysis, fine-tuning every element of your website to maximize conversions.',
    imageUrl: '/agents/max.jpg',
    capabilities: ['A/B Testing', 'Data Analysis', 'Conversion Rate Optimization']
  },
  {
    id: 'aya',
    name: 'Aya',
    title: 'Web Performance Agent',
    description: 'Aya ensures your website runs at peak performance, proactively monitoring speed, and reliability to deliver a seamless user experience.',
    imageUrl: '/agents/aya.jpg',
    status: 'beta',
    capabilities: ['Performance Monitoring', 'Speed Optimization', 'Reliability Analysis']
  }
];

const gradientTextStyle = "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent";

export function AgentSelection() {
  const { setSelectedAgent, setStep, selectedAgent } = useWizard();

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleNext = () => {
    if (selectedAgent) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className={`text-2xl font-bold mb-2 ${gradientTextStyle}`}>
            Take Fibr&apos;s Agents for a Test Drive
          </h1>
          <p className="text-gray-800 font-medium">
            Explore how Fibr&apos;s agents optimize websites in this quick demo. See the impact before you sign up.
          </p>
        </div>
        <div className="text-right">
          <h2 className={`text-xl font-semibold mb-2 ${gradientTextStyle}`}>What&apos;s Next?</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <span className="inline-block mb-2">👥</span>
              <p className="text-sm text-gray-800 font-medium">Pick the perfect agent to solve your website challenges</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedAgent?.id === agent.id
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => handleAgentSelect(agent)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 overflow-hidden relative" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${gradientTextStyle}`}>{agent.name} - {agent.title}</h3>
                  {agent.status === 'beta' && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded font-medium">Beta</span>
                  )}
                </div>
                <p className="text-gray-800 text-sm mt-1 font-medium">{agent.description}</p>
              </div>
              {selectedAgent?.id === agent.id && (
                <div className="text-gray-900">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-50 text-gray-800 font-medium"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-lg hover:from-gray-800 hover:to-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          disabled={!selectedAgent}
        >
          Next
        </button>
      </div>
    </div>
  );
} 