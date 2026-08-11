# Phase 10 — QA & Launch

> Run end-to-end tests, fix critical issues, and launch Embark 2.0.0.

## Goal

The platform is stable, secure, performant, accessible, and launched to users. All critical user journeys work on production.

## Output

- Production app with no critical bugs.
- Automated and manual test results documented.
- Performance and accessibility audits passing.
- Security review completed.
- Public launch announced.
- Documentation and memory files updated.

## Steps

1. **End-to-end manual testing**
   - Test every user journey on staging and production:
     - Student: register → complete profile → browse experts → book 1:1 → pay → attend → review.
     - Student: register → join hackathon → create team → submit → view results → download certificate.
     - Student: buy package → use sessions from package.
     - Expert: apply → verification → create services → receive booking → complete → view earnings.
     - Admin: verify expert → view dashboard → process refund → publish hackathon results.
     - Judge: evaluate assigned submissions.
   - Track each flow in a spreadsheet or Notion checklist.

2. **Automated testing**
   - Add Playwright tests for critical paths:
     - Auth (register, login, logout)
     - Student profile completion
     - Expert application
     - Service booking with mock Razorpay
     - Hackathon registration and submission
     - Certificate verification
   - Add Jest unit tests for:
     - Commission calculation
     - Evaluation score aggregation
     - Permission helpers
   - Run tests in CI on every push to `main`.

3. **Performance and accessibility audit**
   - Run Lighthouse on `/`, `/experts`, `/hackathons`, `/expert/[id]`, `/booking/[id]`, `/admin/dashboard`.
   - Target: 90+ on performance, accessibility, best practices, SEO.
   - Fix image optimization, unused CSS, missing alt text, focus states.
   - Test keyboard navigation for nav, forms, modals, tables.
   - Test on mobile Safari and Chrome.
   - Verify reduced-motion preference is honored.

4. **Security review**
   - Verify all admin/API routes enforce RBAC.
   - Verify file uploads restricted by type, size, and signature.
   - Verify Razorpay signature and webhook verification.
   - Verify no secrets in client bundle or logs.
   - Run `npm audit` and fix high/critical vulnerabilities.
   - Review CORS, CSP, and secure cookie settings.
   - Penetration test common endpoints for IDOR and injection.

5. **Bug triage and fix**
   - Triage issues into P0 (launch blocker), P1 (fix before launch), P2 (post-launch).
   - Fix all P0s and P1s.
   - Document P2s in backlog.

6. **Soft launch**
   - Deploy to production domain.
   - Announce to small trusted group (students, experts, college contacts).
   - Monitor for 48 hours: errors, support requests, payment failures.

7. **Hard launch**
   - Announce publicly (email, LinkedIn, WhatsApp groups, campus channels).
   - Verify all critical flows one final time.

8. **Documentation and memory update**
   - Update `README.md` with 2.0.0 architecture and URLs.
   - Update `CLAUDE.md` and `memory/conversation-log.md` with new stack.
   - Update `Agentic config/version2.0.0/README.md` with any phase deviations.

9. **Post-launch monitoring**
   - Sentry error tracking live.
   - Vercel Analytics and PostHog (if configured).
   - Monitor Razorpay transactions, disputes, refunds.
   - Monitor admin dashboard for pending expert verifications, bookings, hackathons.

10. **Verification checklist**
    - [ ] Every critical user journey tested on production.
    - [ ] Playwright/Jest tests pass in CI.
    - [ ] Lighthouse scores ≥ 90 for critical pages.
    - [ ] No P0 or P1 bugs remain open.
    - [ ] Security review completed with no critical findings.
    - [ ] App is announced and accessible.
    - [ ] Documentation and memory files updated.
    - [ ] Rollback plan documented and verified.

## Risks / notes

- Launch day traffic may spike. Ensure Vercel plan, database, and Redis limits can handle it.
- Have a rollback plan: keep the previous deploy tagged and a database snapshot ready.
- Do not add new features during QA week. Focus only on bugs, stability, and polish.
- Keep monitoring for at least one week after launch before declaring success.
