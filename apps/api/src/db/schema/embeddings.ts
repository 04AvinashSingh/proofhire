import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { projectEvidence } from "./projectEvidence";
import { candidateProfiles } from "./candidateProfiles";
import { jobRequirements } from "./jobRequirements";
import { vector } from "./customTypes";

export const evidenceEmbeddings = pgTable(
  "evidence_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evidenceId: uuid("evidence_id")
      .notNull()
      .references(() => projectEvidence.id, { onDelete: "cascade" }),
    candidateId: uuid("candidate_id")
      .notNull()
      .references(() => candidateProfiles.id, { onDelete: "cascade" }),
    chunkText: text("chunk_text").notNull(),
    metadata: jsonb("metadata").notNull().default({}),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_evidence_embeddings_candidate_id").on(table.candidateId),
    index("idx_evidence_embeddings_evidence_id").on(table.evidenceId),
  ]
);

export const requirementEmbeddings = pgTable(
  "requirement_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requirementId: uuid("requirement_id")
      .notNull()
      .references(() => jobRequirements.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_requirement_embeddings_req_id").on(table.requirementId),
  ]
);
