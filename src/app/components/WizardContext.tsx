'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, OptimizationResult, WebsiteInfo } from '../types/api';
import { SessionData, StepData } from '../db/database';
import { QuestionType } from '../services/suggestions';

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

interface WizardContextType {
  step: number;
  userURL: string;
  siteDescription: string;
  selectedAgent: Agent | null;
  optimizationResult: OptimizationResult | null;
  sessionData: SessionData | null;
  websiteInfo: WebsiteInfo | null;
  optimizationContext: Record<QuestionType, string[]> | null;
  setStep: (step: number) => void;
  setUserURL: (url: string) => void;
  setSiteDescription: (description: string) => void;
  setSelectedAgent: (agent: Agent | null) => void;
  setOptimizationResult: (result: OptimizationResult | null) => void;
  setWebsiteInfo: (info: WebsiteInfo | null) => void;
  setOptimizationContext: (context: Record<QuestionType, string[]>) => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

function getDomainFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(1);
  const [userURL, setUserURL] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [websiteInfo, setWebsiteInfo] = useState<WebsiteInfo | null>(null);
  const [optimizationContext, setOptimizationContext] = useState<Record<QuestionType, string[]> | null>(null);

  // Load session data when URL changes
  useEffect(() => {
    const loadSessionData = async () => {
      if (!userURL) return;

      try {
        const domain = getDomainFromURL(userURL);
        const response = await fetch(`/api/session?domain=${encodeURIComponent(domain)}`);
        const data = await response.json();

        if (data.success && data.data.currentSession) {
          const session = data.data.currentSession;
          setSessionData(session);

          // Restore state from session
          session.steps.forEach((step: { stepNumber: number; data: StepData }) => {
            switch (step.stepNumber) {
              case 1:
                if (step.data.url) setUserURL(step.data.url);
                break;
              case 2:
                if (step.data.agentId) {
                  const agent = agents.find(a => a.id === step.data.agentId);
                  if (agent) {
                    setSelectedAgent(agent);
                  }
                }
                break;
              case 3:
                if (step.data.siteDescription) {
                  setSiteDescription(step.data.siteDescription);
                }
                break;
              case 4:
                if (step.data.optimizationContext) {
                  setOptimizationContext(step.data.optimizationContext);
                }
                break;
            }
          });

          if (session.optimizationResults) {
            setOptimizationResult({
              suggestions: session.optimizationResults.suggestions,
              performanceMetrics: session.optimizationResults.metrics,
              optimizedDescription: ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
      }
    };

    loadSessionData();
  }, [userURL]);

  // Save step data when state changes
  useEffect(() => {
    const saveStepData = async () => {
      if (!userURL) return;

      try {
        const domain = getDomainFromURL(userURL);
        let stepData: StepData | undefined;

        switch (step) {
          case 1:
            stepData = { url: userURL };
            break;
          case 2:
            if (selectedAgent) {
              stepData = { agentId: selectedAgent.id };
            }
            break;
          case 3:
            if (siteDescription) {
              stepData = { siteDescription };
            }
            break;
          case 4:
            if (optimizationContext) {
              stepData = { optimizationContext };
            }
            break;
        }

        if (stepData) {
          await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              domain,
              stepNumber: step,
              stepData
            })
          });
        }
      } catch (error) {
        console.error('Error saving step data:', error);
      }
    };

    saveStepData();
  }, [step, userURL, selectedAgent, siteDescription, optimizationContext]);

  // Save optimization results
  useEffect(() => {
    const saveOptimizationResults = async () => {
      if (!userURL || !selectedAgent || !optimizationResult) return;

      try {
        const domain = getDomainFromURL(userURL);
        await fetch('/api/session', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain,
            agentId: selectedAgent.id,
            suggestions: optimizationResult.suggestions,
            metrics: optimizationResult.performanceMetrics
          })
        });
      } catch (error) {
        console.error('Error saving optimization results:', error);
      }
    };

    saveOptimizationResults();
  }, [userURL, selectedAgent, optimizationResult]);

  return (
    <WizardContext.Provider
      value={{
        step,
        userURL,
        siteDescription,
        selectedAgent,
        optimizationResult,
        sessionData,
        websiteInfo,
        optimizationContext,
        setStep,
        setUserURL,
        setSiteDescription,
        setSelectedAgent,
        setOptimizationResult,
        setWebsiteInfo,
        setOptimizationContext,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
} 