# Technical Details

## Component Architecture

### 1. WizardContext
```typescript
interface WizardContextType {
  step: number;
  userURL: string;
  siteDescription: string;
  selectedAgent: Agent | null;
  optimizationResult: OptimizationResult | null;
  websiteInfo: WebsiteInfo | null;
  // ... other state properties
}
```
- **Purpose**: Central state management for the optimization flow
- **Key Features**:
  - Step progression management
  - Data persistence between steps
  - Session handling
  - Agent selection state
  - Optimization results storage

### 2. OptimizedPage Component
```typescript
interface ContentAnalysis {
  headings: string[];
  description: string;
  keywords: string[];
  seoScore: number;
}

interface Enhancement {
  title: string;
  before: string;
  after: string;
  type: 'heading' | 'description' | 'cta' | 'seo';
}
```

#### Analysis Process
1. **Content Analysis**
   ```typescript
   const analyzeContent = async () => {
     // Extract headings
     const headings = websiteInfo.mainHeadings || [];
     
     // Get description
     const description = websiteInfo.description || '';
     
     // Extract keywords
     const keywords = websiteInfo.mainContent
       .split(/\s+/)
       .filter(word => word.length > 4)
       .slice(0, 10);

     // Calculate SEO score
     const seoScore = calculateSEOScore(headings, description, keywords);
     
     return { headings, description, keywords, seoScore };
   };
   ```

2. **Progress Tracking**
   ```typescript
   interface ScanningPhase {
     message: string;
     progress: number;
   }

   const scanningPhases = [
     { message: "Analyzing structure...", progress: 6 },
     { message: "Evaluating strategy...", progress: 8 },
     // ... other phases
   ];
   ```

3. **Enhancement Generation**
   ```typescript
   const generateInsights = (analysis: ContentAnalysis) => {
     // Problem identification
     const problems = identifyProblems(analysis);
     
     // Enhancement suggestions
     const enhancements = generateEnhancements(analysis, websiteInfo);
     
     return { problems, enhancements };
   };
   ```

### 3. MultiSelectQuestion Component
```typescript
interface MultiSelectQuestionProps {
  title: string;
  description: string;
  suggestions: string[];
  onSelectionChange: (selections: string[]) => void;
  initialSelections?: string[];
}
```

#### Features
- Custom option addition
- Validation rules
- Animation states
- Selection management

### 4. API Integration

#### Website Analysis API
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

interface ScrapeResponse {
  websiteInfo: WebsiteInfo;
  aiDescription: string;
}
```

#### OpenAI Integration
```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [
    {
      role: "system",
      content: "You are a professional website analyzer..."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.7,
  max_tokens: 100
});
```

## Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Optimization Results
```sql
CREATE TABLE optimization_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  agent_id VARCHAR(50) NOT NULL,
  suggestions JSONB NOT NULL,
  metrics JSONB NOT NULL
);
```

## State Management

### Session Flow
1. URL Input → Session Creation
2. Agent Selection → Session Update
3. Analysis → Results Storage
4. Enhancement Generation → Final Update

### Data Persistence
- PostgreSQL for session data
- Context API for runtime state
- Local storage for temporary data

## Performance Optimizations

1. **Lazy Loading**
   ```typescript
   const OptimizedPage = dynamic(() => import('./components/OptimizedPage'), {
     loading: () => <LoadingSpinner />
   });
   ```

2. **Memoization**
   ```typescript
   const memoizedAnalysis = useMemo(() => 
     analyzeContent(websiteInfo),
     [websiteInfo]
   );
   ```

3. **Debounced Updates**
   ```typescript
   const debouncedUpdate = useCallback(
     debounce((value) => updateContent(value), 300),
     []
   );
   ```

## Error Handling

### Error Boundary
```typescript
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }
}
```

### API Error Handling
```typescript
try {
  const response = await fetch('/api/analyze');
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error.message);
  }
} catch (error) {
  handleError(error);
}
```

## Testing Strategy

1. **Unit Tests**
   ```typescript
   describe('analyzeContent', () => {
     it('should calculate correct SEO score', () => {
       const result = analyzeContent(mockWebsiteInfo);
       expect(result.seoScore).toBe(expectedScore);
     });
   });
   ```

2. **Integration Tests**
   ```typescript
   describe('OptimizedPage', () => {
     it('should complete analysis flow', async () => {
       render(<OptimizedPage />);
       // Test complete flow
     });
   });
   ```

3. **E2E Tests**
   ```typescript
   describe('Optimization Flow', () => {
     it('should complete end-to-end process', () => {
       cy.visit('/');
       cy.get('input[name="url"]').type('example.com');
       // Complete flow testing
     });
   });
   ``` 