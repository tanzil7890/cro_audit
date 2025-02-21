# CRO Box - Website Optimization Platform

CRO Box is a application that provides automated website optimization and conversion rate optimization (CRO) analysis. The platform uses AI-powered agents to analyze websites and provide actionable insights for improvement.

## Features

### 1. Website Analysis
- Real-time website scanning and structure analysis
- Content strategy evaluation
- Performance metrics assessment
- SEO optimization opportunities identification
- Personalized enhancement suggestions

### 2. AI-Powered Agents
- **Liv (Personalization Agent)**: Creates tailored web experiences
- **Max (Experimentation Agent)**: Focuses on A/B testing and data analysis
- **Aya (Web Performance Agent)**: Optimizes website speed and reliability

### 3. Optimization Process
1. URL Input & Analysis
2. Agent Selection
3. Site Context Analysis
4. Questionnaire Flow
5. Optimization Results

### 4. Key Capabilities
- Content Structure Analysis
- SEO Score Calculation
- Conversion Rate Optimization
- Performance Metrics Tracking
- Enhanced Copy Suggestions
- Call-to-Action Optimization

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma
- **AI Integration**: OpenAI API
- **Type Safety**: TypeScript

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd cro-box
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   OPENAI_API_KEY="your_openai_api_key"
   DATABASE_URL="your_postgresql_database_url"
   ```

4. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── db/           # Database configurations
│   ├── lib/          # Utility libraries
│   ├── services/     # Business logic services
│   ├── types/        # TypeScript type definitions
│   └── utils/        # Helper functions
├── prisma/           # Database schema
└── public/           # Static assets
```

## Key Components

### WizardContext
Manages the application state and flow through different optimization stages.

### OptimizedPage
Handles the website analysis process and displays optimization results:
- Progress tracking
- Content analysis
- Insight generation
- Enhancement suggestions

### MultiSelectQuestion
Manages user input for optimization preferences and requirements.

## Development

### Available Scripts

- `npm run dev`: Starts development server
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run lint`: Runs ESLint
- `npm run test`: Runs tests (when implemented)

### Adding New Features

1. Create new components in `src/app/components`
2. Add API routes in `src/app/api`
3. Update database schema in `prisma/schema.prisma`
4. Add types in `src/app/types`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

MIT


