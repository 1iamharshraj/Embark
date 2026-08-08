# Phase 7 — QA + launch

> Run end-to-end tests, fix critical issues, and launch the new platform.

## Goal

The app is stable, accessible, performant, and launched to users.

## Output

- A production app with no critical bugs.
- Updated documentation and memory files.
- A public launch.

## Steps

1. **End-to-end testing**
   - Test every user journey on the production URL:
     - Sign up → verify email/login → update profile.
     - Browse competitions → register → submit file → check “My competitions”.
     - Admin: create competition → publish → register a test team → advance → set winners → download certificates.
     - Buy a playbook with Razorpay test card → access detail → update checklist.
     - Submit mentorship booking → admin confirms → pay → complete.
     - Submit speaker application and lecture request → admin updates statuses.
   - Use a spreadsheet or Notion checklist to track each flow.

2. **Automated testing (optional but recommended)**
   - Add Playwright tests for the critical paths:
     - auth flow
     - competition registration and submission
     - playbook purchase (mock Razorpay)
   - Run tests in CI on every push to `main`.

3. **Performance and accessibility audit**
   - Run Lighthouse on every major page.
   - Fix low scores:
     - Image optimization (use `<Image>` with proper sizes).
     - Reduce unused CSS.
     - Add proper alt text, aria labels, focus states.
   - Ensure keyboard navigation works for the nav, forms, modals, and checkout.
   - Test on mobile Safari and Chrome.

4. **Security review**
   - Verify all admin routes are protected.
   - Verify file uploads are restricted by type and size.
   - Verify Razorpay signature verification is correct.
   - Ensure no secrets are logged or committed.
   - Run `npm audit` and fix high/critical vulnerabilities.

5. **Bug fixing**
   - Triage all issues found in QA into P0 (launch blocker), P1 (fix before launch), P2 (post-launch).
   - Fix all P0s and P1s before launch.
   - Document P2s in the backlog.

6. **Soft launch**
   - Deploy to the live domain.
   - Announce to a small group of trusted users (students, mentors, college contacts).
   - Monitor for 24–48 hours for errors and support requests.

7. **Hard launch + documentation**
   - Announce publicly (email, LinkedIn, WhatsApp groups).
   - Update `README.md`, `CLAUDE.md`, and `memory/conversation-log.md` with the new stack and URLs.
   - Archive the old static site files or move them to an `archive/` directory.

8. **Post-launch monitoring**
   - Set up Vercel analytics and error tracking (Sentry or LogRocket).
   - Monitor Razorpay transactions and disputes.
   - Watch the admin dashboard for pending mentorship/lecture requests.

9. **Verification checklist**
   - [ ] Every critical user flow has been tested on the live domain.
   - [ ] Lighthouse scores are green for performance, accessibility, best practices, SEO.
   - [ ] No P0 or P1 bugs remain open.
   - [ ] The app is announced and accessible to users.
   - [ ] Old static site files are archived or removed.
   - [ ] Documentation and memory files are updated.

## Risks / notes

- Launch day traffic may spike. Ensure Vercel’s plan and Neon’s limits can handle it, or put the app behind a simple waitlist if needed.
- Have a rollback plan: keep the old static site deployable on a subdomain for at least a week after launch.
- Do not add new features during the QA week. Focus only on bugs and stability.
