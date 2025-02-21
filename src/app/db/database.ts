import { OptimizationResult } from '../types/api';
import { prisma } from '../lib/prisma';
import { Prisma, Session, SessionStep, OptimizationResult as PrismaOptimizationResult } from '@prisma/client';
import { QuestionType } from '../services/suggestions';

export interface StepData {
  url?: string;
  agentId?: string;
  siteDescription?: string;
  optimizationContext?: Record<QuestionType, string[]>;
}

export interface SessionData {
  id: number;
  domain: string;
  steps: {
    stepNumber: number;
    data: StepData;
  }[];
  optimizationResults?: {
    agentId: string;
    suggestions: OptimizationResult['suggestions'];
    metrics: OptimizationResult['performanceMetrics'];
  };
}

type SessionWithRelations = Session & {
  steps: (SessionStep & { stepData: StepData })[];
  optimizationResult: (PrismaOptimizationResult & {
    suggestions: OptimizationResult['suggestions'];
    metrics: OptimizationResult['performanceMetrics'];
  })[];
}

export async function createSession(domain: string): Promise<number> {
  const session = await prisma.session.create({
    data: { domain }
  });
  return session.id;
}

export async function updateSessionStep(
  sessionId: number,
  stepNumber: number,
  stepData: StepData
): Promise<void> {
  await prisma.sessionStep.upsert({
    where: {
      sessionId_stepNumber: {
        sessionId,
        stepNumber
      }
    },
    create: {
      sessionId,
      stepNumber,
      stepData: stepData as Prisma.InputJsonValue
    },
    update: {
      stepData: stepData as Prisma.InputJsonValue
    }
  });
}

export async function saveOptimizationResults(
  sessionId: number,
  agentId: string,
  suggestions: OptimizationResult['suggestions'],
  metrics: OptimizationResult['performanceMetrics']
): Promise<void> {
  await prisma.optimizationResult.create({
    data: {
      sessionId,
      agentId,
      suggestions: suggestions as Prisma.InputJsonValue,
      metrics: metrics as Prisma.InputJsonValue
    }
  });
}

export async function getSessionData(domain: string): Promise<SessionData | null> {
  const session = await prisma.session.findFirst({
    where: { domain },
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        orderBy: { stepNumber: 'asc' }
      },
      optimizationResult: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  }) as SessionWithRelations | null;

  if (!session) {
    return null;
  }

  return {
    id: session.id,
    domain: session.domain,
    steps: session.steps.map(step => ({
      stepNumber: step.stepNumber,
      data: step.stepData as StepData
    })),
    optimizationResults: session.optimizationResult[0] ? {
      agentId: session.optimizationResult[0].agentId,
      suggestions: session.optimizationResult[0].suggestions as OptimizationResult['suggestions'],
      metrics: session.optimizationResult[0].metrics as OptimizationResult['performanceMetrics']
    } : undefined
  };
}

export async function getSessionHistory(domain: string): Promise<SessionData[]> {
  const sessions = await prisma.session.findMany({
    where: { domain },
    orderBy: { createdAt: 'desc' },
    include: {
      steps: {
        orderBy: { stepNumber: 'asc' }
      },
      optimizationResult: {
        orderBy: { createdAt: 'desc' }
      }
    }
  }) as SessionWithRelations[];

  return sessions.map(session => ({
    id: session.id,
    domain: session.domain,
    steps: session.steps.map(step => ({
      stepNumber: step.stepNumber,
      data: step.stepData as StepData
    })),
    optimizationResults: session.optimizationResult[0] ? {
      agentId: session.optimizationResult[0].agentId,
      suggestions: session.optimizationResult[0].suggestions as OptimizationResult['suggestions'],
      metrics: session.optimizationResult[0].metrics as OptimizationResult['performanceMetrics']
    } : undefined
  }));
} 