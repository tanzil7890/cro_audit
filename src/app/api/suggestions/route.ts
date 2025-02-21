import { NextResponse } from 'next/server';
import { getSuggestions, QuestionType } from '@/app/services/suggestions';
import { APIResponse } from '@/app/types/api';

export async function POST(request: Request) {
  try {
    const { questionType, url, websiteInfo } = await request.json();

    if (!questionType || !url) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Question type and URL are required',
          code: 'MISSING_PARAMS'
        }
      }, { status: 400 });
    }

    if (!Object.values(['benefits', 'audience', 'competitors', 'objections', 'keywords']).includes(questionType)) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'Invalid question type',
          code: 'INVALID_QUESTION_TYPE'
        }
      }, { status: 400 });
    }

    const suggestions = await getSuggestions(questionType as QuestionType, {
      url,
      websiteInfo
    });

    return NextResponse.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to get suggestions',
        code: 'SUGGESTIONS_ERROR'
      }
    }, { status: 500 });
  }
} 