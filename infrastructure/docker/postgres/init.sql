-- ProofHire PostgreSQL initialisation script
-- This runs when the container is first created
-- It creates the test database alongside the development database

-- Create test database for integration tests
CREATE DATABASE proofhire_test
  WITH
  OWNER = proofhire
  ENCODING = 'UTF8'
  LC_COLLATE = 'en_US.utf8'
  LC_CTYPE = 'en_US.utf8'
  TEMPLATE = template0;

-- Ensure pgvector extension is available in both databases
-- (Will be enabled per-database in migrations when needed)
-- CREATE EXTENSION IF NOT EXISTS vector;
