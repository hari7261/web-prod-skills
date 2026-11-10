---
name: rag-pipeline
version: 2.0.0
description: Build tenant-isolated, citation-grounded RAG pipelines with freshness and abstention guarantees.
applies_to: [ai, backend, database]
triggers:
  - implementing vector search, chunking, or retrieval-augmented generation
  - indexing customer or knowledge-base documents
requires_gate: gates/pre-merge/prompt-evals
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all document ingestion, embedding, retrieval, reranking, and grounded answer generation flows.

## 2. Non-negotiables

- Enforce ACL and `tenant_id` filtering inside the retrieval query itself *before* top-K selection and LLM context assembly.
- Bound chunk count, retrieved context tokens, and ingestion file sizes.
- Require verifiable chunk citations (`docId`, `version`) and explicit abstention when authorized context does not answer the query.
- Evaluate retrieval accuracy and cross-tenant isolation via `evals/golden-sets/rag-accuracy/`.

## 3. Rejection criteria

Fail the task if tenant/ACL filtering occurs post-generation, citations are fabricated, missing-context queries hallucinate answers, or `gates/pre-merge/prompt-evals` fails.

## 4. Step-by-step procedure

1. Index documents with `tenant_id`, `acl`, `doc_id`, `version`, and `updated_at` metadata.
2. Apply mandatory pre-filter `{ tenant_id, acl }` on every vector/hybrid query.
3. Instruct and schema-validate outputs to return source chunk IDs or explicit abstention.
4. Run `gates/pre-merge/prompt-evals` and cross-tenant retrieval tests.

## 5. Evidence required

Passing `gates/pre-merge/prompt-evals` (`rag-accuracy >= 0.90`) and integration tests proving pre-retrieval tenant isolation.

## 6. Anti-patterns

- **REJECT:** Querying global top-10 vectors and filtering out unauthorized tenants in JS afterwards.
- **REJECT:** Answering out-of-scope questions from model parametric memory when grounding is required.

## 7. References

- [AI feature baseline](../../../knowledge/ai-feature-baseline.md)
- [Prompt evals gate](../../../gates/pre-merge/prompt-evals/README.md)

