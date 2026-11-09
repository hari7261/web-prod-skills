# Web security baseline

Apply the OWASP Web Top 10, API Security Top 10, and relevant LLM application threats as concrete engineering controls.

- **Access control / BOLA:** authorize each action against the specific resource; scope queries by trusted tenant identity.
- **Injection / XSS:** use context-aware output encoding; prohibit unsafe HTML sinks for untrusted data; sanitize with a maintained allowlist sanitizer when HTML is an explicit product requirement.
- **Authentication:** use established identity libraries, secure session cookies, rotation and revocation; rate-limit credential flows.
- **SSRF:** allowlist outbound destinations where possible; block loopback, link-local, private and metadata ranges; revalidate redirects and DNS resolution.
- **Security configuration:** ship restrictive CSP, HSTS, frame protections, MIME sniffing protection, and a deliberate permissions policy.
- **CSRF:** use SameSite cookies plus anti-CSRF tokens or equivalent origin validation for state-changing cookie-authenticated requests.
- **CORS:** exact allowlists; never combine credentialed requests with wildcard origins.
- **Input validation:** strict server-side schemas, unknown-field rejection, size limits, content-type checks.
- **Secrets:** secret manager or deployment secret store; scan source, history, artifacts and logs; rotate exposed credentials.
- **LLM-specific:** treat prompts, retrieved documents and model output as untrusted; defend against indirect prompt injection; validate tool arguments and enforce server-side tool authorization.
- **Tenant isolation:** tenant context comes from authenticated identity, not request payload; test cross-tenant access.
- **Supply chain:** pin dependencies, review provenance, scan vulnerabilities, generate an SBOM.

Security controls must be tested at runtime. Static pattern checks are only triage signals.
