CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evidence_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"evidence_id" uuid NOT NULL,
	"candidate_id" uuid NOT NULL,
	"chunk_text" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "requirement_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requirement_id" uuid NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_assessments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"requirement_id" uuid NOT NULL,
	"support_level" text NOT NULL,
	"confidence" real NOT NULL,
	"citations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"limitations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"advisory_notes" text NOT NULL,
	"is_self_reported" boolean DEFAULT true NOT NULL,
	"security_warnings" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_embeddings" ADD CONSTRAINT "evidence_embeddings_evidence_id_project_evidence_id_fk" FOREIGN KEY ("evidence_id") REFERENCES "public"."project_evidence"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "evidence_embeddings" ADD CONSTRAINT "evidence_embeddings_candidate_id_candidate_profiles_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "requirement_embeddings" ADD CONSTRAINT "requirement_embeddings_requirement_id_job_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."job_requirements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_assessments" ADD CONSTRAINT "ai_assessments_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_assessments" ADD CONSTRAINT "ai_assessments_requirement_id_job_requirements_id_fk" FOREIGN KEY ("requirement_id") REFERENCES "public"."job_requirements"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evidence_embeddings_candidate_id" ON "evidence_embeddings" USING btree ("candidate_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evidence_embeddings_evidence_id" ON "evidence_embeddings" USING btree ("evidence_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_requirement_embeddings_req_id" ON "requirement_embeddings" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_assessments_application_id" ON "ai_assessments" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_ai_assessments_requirement_id" ON "ai_assessments" USING btree ("requirement_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_evidence_embeddings_hnsw" ON "evidence_embeddings" USING hnsw ("embedding" vector_cosine_ops);