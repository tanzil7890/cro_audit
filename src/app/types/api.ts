export interface WebsiteInfo {
  title: string;
  description: string;
  metaDescription?: string;
  mainHeadings: string[];
  mainContent: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

export interface ScrapeResponse {
  websiteInfo: WebsiteInfo;
  aiDescription: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export interface Agent {
  id: string;
  name: string;
  title: string;
  description: string;
  imageUrl: string;
  status?: 'beta' | 'stable';
  capabilities: string[];
}

export type MetricType = {
  [key: string]: number;
};

export interface OptimizationResult {
  suggestions: Array<{
    type: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    implementation: string;
  }>;
  optimizedDescription: string;
  performanceMetrics: MetricType;
} 