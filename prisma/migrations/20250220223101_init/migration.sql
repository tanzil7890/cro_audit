-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "domain" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_steps" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "step_number" INTEGER NOT NULL,
    "step_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "optimization_results" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "agent_id" TEXT NOT NULL,
    "suggestions" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "optimization_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sessions_domain_idx" ON "sessions"("domain");

-- CreateIndex
CREATE INDEX "session_steps_session_id_idx" ON "session_steps"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_steps_session_id_step_number_key" ON "session_steps"("session_id", "step_number");

-- CreateIndex
CREATE INDEX "optimization_results_session_id_idx" ON "optimization_results"("session_id");

-- AddForeignKey
ALTER TABLE "session_steps" ADD CONSTRAINT "session_steps_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "optimization_results" ADD CONSTRAINT "optimization_results_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
