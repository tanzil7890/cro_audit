import { NextResponse } from 'next/server';
import {
  createSession,
  updateSessionStep,
  getSessionData,
  getSessionHistory,
  saveOptimizationResults,
  StepData
} from '@/app/db/database';

export async function POST(request: Request) {
  try {
    const { domain, stepNumber, stepData } = await request.json();

    if (!domain) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Domain is required',
          code: 'MISSING_DOMAIN'
        }
      }, { status: 400 });
    }

    // Get existing session or create new one
    let sessionData = await getSessionData(domain);
    let sessionId: number;

    if (!sessionData) {
      sessionId = await createSession(domain);
    } else {
      sessionId = sessionData.id;
    }

    // Update step data if provided
    if (typeof stepNumber === 'number' && stepData) {
      await updateSessionStep(sessionId, stepNumber, stepData as StepData);
    }

    // Get updated session data
    sessionData = await getSessionData(domain);

    return NextResponse.json({
      success: true,
      data: sessionData
    });
  } catch (error) {
    console.error('Error handling session:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to handle session',
        code: 'SESSION_ERROR'
      }
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Domain is required',
          code: 'MISSING_DOMAIN'
        }
      }, { status: 400 });
    }

    const sessionData = await getSessionData(domain);
    const sessionHistory = await getSessionHistory(domain);

    return NextResponse.json({
      success: true,
      data: {
        currentSession: sessionData,
        history: sessionHistory
      }
    });
  } catch (error) {
    console.error('Error getting session data:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get session data',
        code: 'SESSION_ERROR'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { domain, agentId, suggestions, metrics } = await request.json();

    if (!domain || !agentId) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Domain and agent ID are required',
          code: 'MISSING_PARAMS'
        }
      }, { status: 400 });
    }

    const sessionData = await getSessionData(domain);
    if (!sessionData) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Session not found',
          code: 'SESSION_NOT_FOUND'
        }
      }, { status: 404 });
    }

    await saveOptimizationResults(sessionData.id, agentId, suggestions, metrics);

    const updatedSession = await getSessionData(domain);

    return NextResponse.json({
      success: true,
      data: updatedSession
    });
  } catch (error) {
    console.error('Error saving optimization results:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to save optimization results',
        code: 'OPTIMIZATION_ERROR'
      }
    }, { status: 500 });
  }
} 