-- Create sessions table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  domain VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create session_steps table to track progress
CREATE TABLE session_steps (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create optimization_results table
CREATE TABLE optimization_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  agent_id VARCHAR(50) NOT NULL,
  suggestions JSONB NOT NULL,
  metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indices
CREATE INDEX idx_sessions_domain ON sessions(domain);
CREATE INDEX idx_session_steps_session_id ON session_steps(session_id);
CREATE INDEX idx_optimization_results_session_id ON optimization_results(session_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_steps_updated_at
  BEFORE UPDATE ON session_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 