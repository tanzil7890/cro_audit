import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface QuestionSuggestions {
  suggestions: string[];
}

export type QuestionType = 
  | 'benefits'
  | 'audience'
  | 'competitors'
  | 'objections'
  | 'keywords';

async function getCompetitorSuggestions(context: {
  url: string;
  websiteInfo?: {
    title: string;
    description: string;
    mainContent: string;
  };
}): Promise<string[]> {
  try {
    const prompt = `Analyze this business description and identify exactly 3 main direct competitors.

Business Description:
${context.websiteInfo?.description || ''}

Website: ${context.url}
Industry Focus: ${context.websiteInfo?.title || ''}
Additional Context: ${context.websiteInfo?.mainContent || ''}

Requirements:
1. List EXACTLY 3 direct competitors
2. Each competitor must be a real company name
3. Focus on companies offering similar core services
4. Consider market size and target audience overlap
5. Prioritize well-known companies in the same space

Format: Return ONLY the company names, one per line, no numbers or additional text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert business analyst specializing in competitive market analysis. Your task is to identify direct competitors based on business model similarity, market overlap, and service offerings. Provide only the competitor names, one per line, no additional text."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5, // Reduced for more focused responses
      max_tokens: 50,
      presence_penalty: 0.1, // Slight penalty for repetition
      frequency_penalty: 0.1 // Slight penalty for common responses
    });

    const competitors = completion.choices[0].message.content
      ?.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.includes('.'))
      .slice(0, 3) || [];

    // If AI doesn't return exactly 3 competitors, return empty array
    return competitors.length === 3 ? competitors : [];
  } catch (error) {
    console.error('Error analyzing competitors:', error);
    return []; // Return empty array instead of defaults
  }
}

export async function getSuggestions(
  questionType: QuestionType,
  context: {
    url: string;
    websiteInfo?: {
      title: string;
      description: string;
      mainContent: string;
    };
  }
): Promise<QuestionSuggestions> {
  try {
    // Special handling for competitors
    if (questionType === 'competitors') {
      const competitors = await getCompetitorSuggestions(context);
      return { suggestions: competitors };
    }

    const prompts: Record<QuestionType, string> = {
      benefits: `Analyze this business and list exactly 3 key benefits:
        
        Business: ${context.websiteInfo?.description || ''}
        Website: ${context.url}
        Context: ${context.websiteInfo?.mainContent || ''}
        
        Format: One benefit per line, be specific and concise.`,
      
      audience: `Identify exactly 3 primary target audience segments:
        
        Business: ${context.websiteInfo?.description || ''}
        Website: ${context.url}
        Context: ${context.websiteInfo?.mainContent || ''}
        
        Format: One audience segment per line, be specific.`,
      
      competitors: `Analyze this business description and identify exactly 3 main direct competitors:
        
        Business: ${context.websiteInfo?.description || ''}
        Website: ${context.url}
        Context: ${context.websiteInfo?.mainContent || ''}
        
        Format: Return ONLY the company names, one per line.`,
      
      objections: `List exactly 3 main customer objections or concerns:
        
        Business: ${context.websiteInfo?.description || ''}
        Website: ${context.url}
        Context: ${context.websiteInfo?.mainContent || ''}
        
        Format: One objection per line, be specific.`,
      
      keywords: `Identify exactly 3 primary keyword groups for SEO:
        
        Business: ${context.websiteInfo?.description || ''}
        Website: ${context.url}
        Context: ${context.websiteInfo?.mainContent || ''}
        
        Format: One keyword group per line, be specific.`
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a business analyst providing concise, specific insights. Return exactly 3 items, one per line, no numbers or additional text."
        },
        {
          role: "user",
          content: prompts[questionType]
        }
      ],
      temperature: 0.5,
      max_tokens: 150,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const suggestions = completion.choices[0].message.content
      ?.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.includes('.'))
      .slice(0, 3) || [];

    // Return empty array if we don't get exactly 3 suggestions
    return {
      suggestions: suggestions.length === 3 ? suggestions : []
    };
  } catch (error) {
    console.error('Error getting suggestions:', error);
    return { suggestions: [] }; // Return empty array instead of defaults
  }
} 