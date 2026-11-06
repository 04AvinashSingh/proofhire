# Engineering Glossary

Terms used across ProofHire documentation and codebase.

---

| Term | Definition |
|---|---|
| **Candidate** | A job-seeker using ProofHire; typically a software developer with 0–2 years of professional experience. |
| **Employer** | A hiring stakeholder using ProofHire; a startup founder, engineering manager, or technical recruiter hiring early-career engineers. |
| **Administrator** | An authorised ProofHire operations team member responsible for platform integrity, moderation, and account management. |
| **Organisation** | The employer entity on ProofHire. An employer user belongs to an organisation; jobs are posted by organisations. |
| **Organisation membership** | The relationship between a user and an organisation, with a role (Owner, Admin, Member). |
| **Profile** | A candidate's structured representation of their background, skills, education, experience, and projects. |
| **Project** | A specific piece of work a candidate has done — personal or team — documented with a description, contribution explanation, and optional evidence items. |
| **Evidence** | A specific artefact attached to a project: a URL, GitHub repository link, uploaded file, video, or written explanation. Evidence is always labelled as self-reported unless independently verified. |
| **Evidence item** | A single piece of evidence within a project. |
| **Self-reported** | Information provided by the candidate without independent verification. All candidate-supplied evidence is self-reported by default. |
| **Verified** | Evidence that has been confirmed by an independent source (e.g., a third-party certification body). ProofHire does not perform verification in the MVP. |
| **Job** | A job listing posted by an employer organisation, with a title, description, employment type, location, and structured requirements. |
| **Job requirement** | A single, specific criterion defined by an employer for a job — e.g., "Experience designing and testing a REST API". Each requirement has an importance level (Required or Preferred) and optional skill tags. |
| **Evidence mapping** | The system's output for a given (job requirement, candidate evidence item) pair: the requirement, the evidence, the source, the relevance score, the relevance reason, and a flag for missing evidence. |
| **Missing evidence** | A job requirement for which no candidate evidence with a non-zero relevance score was found. Missing evidence is always shown explicitly; it is never hidden or invented. |
| **Application** | A candidate's formal expression of interest in a specific job. One per candidate per job (database constraint). |
| **Application status** | The current stage of an application in the pipeline: Applied, Screening, Interview, Offer, Hired, or Rejected. |
| **Application status history** | An immutable record of every status transition for an application, including who made the change and when. |
| **Pipeline** | The ordered stages an application moves through during employer review. |
| **Evaluation note** | An internal note written by an employer team member on an application. Never visible to candidates. |
| **Audit event** | An immutable record of a sensitive platform action: account changes, administrative actions, job lifecycle events, and application state changes. |
| **Content report** | A user-submitted report of a job listing, candidate profile, or organisation for abusive content, false information, or impersonation. |
| **Jaccard similarity** | A measure of overlap between two sets: |A ∩ B| / |A ∪ B|. Used for evidence-to-requirement skill tag matching. |
| **Inverted index** | A data structure mapping each skill tag to the set of evidence items that have that tag. Used for efficient evidence matching. |
| **Top-k selection** | Selecting the k highest-scoring items from a set without sorting the entire set. Implemented using a max-heap. |
| **State machine** | A formal model of the application lifecycle: a set of states and a defined set of valid transitions between them. Invalid transitions are rejected by the server. |
| **Optimistic concurrency** | A concurrency control pattern where an update includes the expected current value as a predicate. If the value has changed (another write occurred), the update fails and returns a conflict error. |
| **CSRF** | Cross-Site Request Forgery. An attack where a malicious site causes a user's browser to make an authenticated request to ProofHire. Mitigated with SameSite=Strict cookies and double-submit CSRF tokens. |
| **SSRF** | Server-Side Request Forgery. An attack where an attacker causes the server to make HTTP requests to internal or unintended external addresses. Mitigated by validating and allowlisting user-supplied URLs before fetching. |
| **Argon2id** | A password hashing algorithm that is memory-hard and resistant to GPU-based brute-force attacks. Selected for ProofHire (see ADR-003). |
| **HttpOnly cookie** | A browser cookie that JavaScript cannot read. Used for session tokens to mitigate XSS-based session theft. |
| **SameSite=Strict** | A cookie attribute that prevents the browser from sending the cookie with cross-site requests. Mitigates CSRF attacks. |
| **Modular monolith** | A single deployable application unit organised into well-defined, encapsulated modules. Modules communicate through function calls, not network calls. Selected for the ProofHire core backend (see ADR-001). |
| **ADR** | Architecture Decision Record. A document capturing a significant technical decision: context, options, decision, consequences, and revisit conditions. |
| **DPDP Act** | Digital Personal Data Protection Act 2023 (India). The primary data protection legislation applicable to ProofHire's operations in India. |
| **RAG** | Retrieval-Augmented Generation. An AI pattern where relevant documents are retrieved from a knowledge base and provided as context to a language model before it generates a response. Planned for Milestone 5. |
| **pgvector** | A PostgreSQL extension that provides vector similarity search. Used (in Milestone 5) to store and query embedding vectors for RAG. |
| **LLM** | Large Language Model. A language model (e.g., GPT-4, Claude, Gemini) used in the AI service for evidence summarisation and relevance explanation. ProofHire integrates LLMs through a provider-agnostic abstraction. |
| **Feature flag** | An environment variable (`FEATURE_AI_ENABLED`, `FEATURE_EMAIL_ENABLED`) that enables or disables a feature at runtime without code changes. |
| **VALIDATED** | A classification label indicating a claim is supported by actual evidence gathered by ProofHire. |
| **ASSUMPTION** | A classification label indicating a claim is plausible but not yet verified by ProofHire's own research. |
| **PROPOSED** | A classification label indicating a recommendation awaiting approval. |
| **DECIDED** | A classification label indicating an explicit product or engineering decision has been made. |
| **DEFERRED** | A classification label indicating a decision or feature has been intentionally postponed. |
