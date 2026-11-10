---
name: file-uploads
version: 2.0.0
description: Handle user file uploads safely with size caps, magic-byte validation, isolation, and non-executable serving.
applies_to: [backend, security]
triggers:
  - implementing file upload endpoints or presigned URLs
  - parsing multipart forms, CSVs, PDFs, or images
requires_gate: gates/pre-merge/input-validation
resources: []
scripts: []
---

## 1. When to use / when not to use

Use for all file upload, import, avatar, attachment, and presigned-URL flows.

## 2. Non-negotiables

- Enforce strict per-file byte-size limits and per-tenant storage quotas before buffering/streaming.
- Verify file type by magic bytes/content inspection against a strict allowlist — never trust filename extensions or client `Content-Type` alone.
- Generate server-side UUID object keys; never use client filenames in filesystem or S3 paths (prevent path traversal).
- Scan untrusted uploads for malware when required and serve user-uploaded files from an isolated origin/domain with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.

## 3. Rejection criteria

Fail the task if uploads have no size cap, trust client MIME/extension, store files under user-supplied paths, or serve active SVG/HTML inline on the app origin.

## 4. Step-by-step procedure

1. Enforce size limit and allowlisted MIME/magic-byte validation.
2. Store under `tenants/<tenantId>/<uuid>` in isolated object storage (never local ephemeral disk in multi-pod prod).
3. Strip EXIF metadata from user images where privacy applies.
4. Test oversized files, spoofed extensions (`.png` containing `<script>`), and `../../` filename traversal.
5. Run `gates/pre-merge/input-validation` and `gates/pre-merge/sast`.

## 5. Evidence required

Passing `gates/pre-merge/input-validation` output plus upload negative tests (oversized, spoofed MIME, path traversal).

## 6. Anti-patterns

- **REJECT:** Serving user-uploaded `.svg` or `.html` files inline on your primary origin (stored XSS).
- **REJECT:** `path.join(UPLOAD_DIR, file.originalname)`.

## 7. References

- [Web security baseline](../../../knowledge/web-security-baseline.md)
- [Input validation gate](../../../gates/pre-merge/input-validation/README.md)
