import {
  assert,
  CookieJar,
  cleanupBookingRequest,
  cleanupLectureRequest,
  cleanupSpeakerApplication,
  disconnectPrisma,
  fetchJson,
  fetchJsonBody,
  getSession,
  nextAuthSignIn,
  startServer,
  stopServer,
  waitForServer,
} from "./verify-lib";
import { prisma } from "../lib/prisma";
import type { ChildProcess } from "node:child_process";

async function main() {
  let server: ChildProcess | null = null;
  if (!process.env.SKIP_SERVER_START) {
    console.log("Starting Next.js dev server...");
    server = startServer();
    await waitForServer();
    console.log("Server ready.");
  }

  let bookingId: string | undefined;
  let orderId: string | undefined;
  let speakerAppId: string | undefined;
  let lectureReqId: string | undefined;

  try {
    // 1. Login as student
    const studentJar = new CookieJar();
    await nextAuthSignIn("student@embark.local", "student123", studentJar);
    const studentSession = await getSession(studentJar);
    assert(studentSession.user?.email === "student@embark.local", "Student session mismatch");
    console.log("✅ Student login succeeded");

    // 2. Submit mentorship booking
    const bookingRes = await fetchJsonBody<{ ok?: boolean; bookingRequest?: { id: string } }>(
      "/api/mentorship/book",
      {
        method: "POST",
        body: JSON.stringify({
          mentorSlug: "kavitha-venkat",
          name: studentSession.user!.name,
          email: studentSession.user!.email,
          topic: "Mock interview prep for FMCG brand management roles",
          message: "Prefer weekend slots",
        }),
        jar: studentJar,
      }
    );
    assert(bookingRes.res.status === 200, `Booking failed: ${JSON.stringify(bookingRes.body)}`);
    assert(bookingRes.body?.bookingRequest?.id, "Booking request id missing");
    bookingId = bookingRes.body.bookingRequest.id;
    console.log("✅ Mentorship booking submitted");

    // 3. Verify booking in DB
    const booking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
    assert(booking, "Booking not found in DB");
    assert(booking.status === "pending", "Booking status should be pending");
    assert((booking.amount ?? 0) > 0, "Booking amount should be > 0");
    console.log("✅ Booking is pending in DB with amount", booking.amount);

    // 4. Login as admin and confirm booking
    const adminJar = new CookieJar();
    await nextAuthSignIn("ajay.san36@gmail.com", "admin123", adminJar);
    const adminSession = await getSession(adminJar);
    assert(adminSession.user?.isAdmin, "Admin session should be admin");
    console.log("✅ Admin login succeeded");

    const confirmRes = await fetchJsonBody<{ ok?: boolean }>(`/api/admin/mentorship/${bookingId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
      jar: adminJar,
    });
    assert(confirmRes.res.status === 200, `Confirm booking failed: ${JSON.stringify(confirmRes.body)}`);
    assert(confirmRes.body?.ok === true, "Confirm booking should return ok");
    console.log("✅ Booking confirmed by admin");

    const confirmedBooking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
    assert(confirmedBooking?.status === "confirmed", "Booking status should be confirmed in DB");

    // 5. Student creates a mentorship order
    const createOrderRes = await fetchJsonBody<{
      orderId?: string;
      keyId?: string;
      amount?: number;
      dbOrderId?: string;
      type?: string;
      error?: string;
    }>("/api/orders/create", {
      method: "POST",
      body: JSON.stringify({ type: "mentorship", bookingRequestId: bookingId }),
      jar: studentJar,
    });
    assert(createOrderRes.res.status === 200, `Order creation failed: ${JSON.stringify(createOrderRes.body)}`);
    assert(createOrderRes.body?.orderId, "orderId missing");
    assert(createOrderRes.body?.dbOrderId, "dbOrderId missing");
    assert(createOrderRes.body?.type === "mentorship", "Order type should be mentorship");
    orderId = createOrderRes.body.dbOrderId;
    console.log("✅ Mentorship order created");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    assert(order, "Order not found in DB");
    assert(order.type === "mentorship", "Order type should be mentorship in DB");
    assert(order.playbookId === null, "Order playbookId should be null");
    assert(order.bookingRequestId === bookingId, "Order bookingRequestId should match");
    assert(order.status === "pending", "Order status should be pending");
    console.log("✅ Order is mentorship with playbookId null");

    // 6. Verify payment in test mode
    const verifyRes = await fetchJsonBody<{ ok?: boolean; error?: string }>("/api/orders/verify", {
      method: "POST",
      body: JSON.stringify({
        razorpay_payment_id: "test_payment_mentorship_123",
        razorpay_order_id: createOrderRes.body.orderId,
        razorpay_signature: "test_signature_mentorship_123",
        dbOrderId: orderId,
      }),
      jar: studentJar,
    });
    assert(verifyRes.res.status === 200, `Payment verification failed: ${JSON.stringify(verifyRes.body)}`);
    assert(verifyRes.body?.ok === true, "Verification should return ok: true");
    console.log("✅ Mentorship payment verified in test mode");

    const paidOrder = await prisma.order.findUnique({ where: { id: orderId } });
    assert(paidOrder?.status === "paid", "Order should be paid in DB");
    const paidBooking = await prisma.bookingRequest.findUnique({ where: { id: bookingId } });
    assert(paidBooking?.status === "paid", "Booking request should be paid after order verification");
    console.log("✅ Booking request status is paid");

    // 7. Submit speaker application (as student)
    const speakerRes = await fetchJsonBody<{ ok?: boolean }>("/api/speaker-applications", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Speaker",
        email: "speaker-test@embark.local",
        role: "Senior Manager",
        company: "TestCo",
        linkedIn: "https://linkedin.com/in/testspeaker",
        experience: "6–10 years",
        vertical: "Marketing",
        city: "Mumbai",
        format: "Both",
        topics: "FMCG marketing, brand management, and rural go-to-market strategy",
      }),
      jar: studentJar,
    });
    assert(speakerRes.res.status === 200, `Speaker application failed: ${JSON.stringify(speakerRes.body)}`);
    assert(speakerRes.body?.ok === true, "Speaker application should return ok");
    console.log("✅ Speaker application submitted");

    const speakerApp = await prisma.speakerApplication.findFirst({
      where: { email: "speaker-test@embark.local" },
      orderBy: { createdAt: "desc" },
    });
    assert(speakerApp, "Speaker application not found in DB");
    assert(speakerApp.status === "pending", "Speaker application status should be pending");
    speakerAppId = speakerApp.id;

    // 8. Submit lecture request (as student)
    const lectureRes = await fetchJsonBody<{ ok?: boolean }>("/api/lecture-requests", {
      method: "POST",
      body: JSON.stringify({
        institute: "IIM Test",
        name: "Prof. Test",
        email: "lecture-test@embark.local",
        phone: "+91 9876543210",
        vertical: "Strategy",
        engagement: "Guest lecture",
        format: "Offline",
        dates: "Next month",
        audienceSize: "60–150",
        budget: "To be discussed",
        message: "Looking for a practical session on market entry strategy.",
      }),
      jar: studentJar,
    });
    assert(lectureRes.res.status === 200, `Lecture request failed: ${JSON.stringify(lectureRes.body)}`);
    assert(lectureRes.body?.ok === true, "Lecture request should return ok");
    console.log("✅ Lecture request submitted");

    const lectureReq = await prisma.lectureRequest.findFirst({
      where: { email: "lecture-test@embark.local" },
      orderBy: { createdAt: "desc" },
    });
    assert(lectureReq, "Lecture request not found in DB");
    assert(lectureReq.status === "pending", "Lecture request status should be pending");
    lectureReqId = lectureReq.id;

    // 9. Admin fetches lists and verifies records
    const speakerListRes = await fetchJsonBody<{ applications?: { id: string }[] }>("/api/speaker-applications", {
      jar: adminJar,
    });
    assert(speakerListRes.res.status === 200, `Speaker list failed: ${JSON.stringify(speakerListRes.body)}`);
    assert(
      speakerListRes.body?.applications?.some((a) => a.id === speakerAppId),
      "Admin speaker list should include new application"
    );
    console.log("✅ Admin speaker list includes new application");

    const lectureListRes = await fetchJsonBody<{ requests?: { id: string }[] }>("/api/lecture-requests", {
      jar: adminJar,
    });
    assert(lectureListRes.res.status === 200, `Lecture list failed: ${JSON.stringify(lectureListRes.body)}`);
    assert(
      lectureListRes.body?.requests?.some((r) => r.id === lectureReqId),
      "Admin lecture list should include new request"
    );
    console.log("✅ Admin lecture list includes new request");

    // 10. Admin updates statuses
    const verifySpeakerRes = await fetchJsonBody<{ ok?: boolean }>(`/api/admin/speaker-applications/${speakerAppId}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "verified" }),
      jar: adminJar,
    });
    assert(verifySpeakerRes.res.status === 200, `Verify speaker failed: ${JSON.stringify(verifySpeakerRes.body)}`);
    assert(verifySpeakerRes.body?.ok === true, "Speaker verify should return ok");
    const verifiedSpeaker = await prisma.speakerApplication.findUnique({ where: { id: speakerAppId } });
    assert(verifiedSpeaker?.status === "verified", "Speaker application should be verified in DB");
    console.log("✅ Speaker application verified");

    const shortlistLectureRes = await fetchJsonBody<{ ok?: boolean }>(
      `/api/admin/lecture-requests/${lectureReqId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: "shortlisted" }),
        jar: adminJar,
      }
    );
    assert(shortlistLectureRes.res.status === 200, `Shortlist lecture failed: ${JSON.stringify(shortlistLectureRes.body)}`);
    assert(shortlistLectureRes.body?.ok === true, "Lecture shortlist should return ok");
    const shortlistedLecture = await prisma.lectureRequest.findUnique({ where: { id: lectureReqId } });
    assert(shortlistedLecture?.status === "shortlisted", "Lecture request should be shortlisted in DB");
    console.log("✅ Lecture request shortlisted");

    // 11. Account pages render for student
    const accountMentorshipRes = await fetchJson("/account/mentorship", {
      redirect: "manual",
      headers: { Cookie: studentJar.header() },
    });
    assert(accountMentorshipRes.status === 200, `Account mentorship page should return 200, got ${accountMentorshipRes.status}`);
    const mentorshipHtml = await accountMentorshipRes.text();
    assert(mentorshipHtml.includes("Kavitha Venkat"), "Account mentorship page should list Kavitha Venkat");
    console.log("✅ Account mentorship page renders with booking");

    const accountRequestsRes = await fetchJson("/account/requests", {
      redirect: "manual",
      headers: { Cookie: studentJar.header() },
    });
    assert(accountRequestsRes.status === 200, `Account requests page should return 200, got ${accountRequestsRes.status}`);
    const requestsHtml = await accountRequestsRes.text();
    assert(
      requestsHtml.includes("Speaker applications") && requestsHtml.includes("Lecture requests"),
      "Account requests page should list both sections"
    );
    console.log("✅ Account requests page renders");

    console.log("\n✅ Phase 5 verification passed.");
  } finally {
    if (orderId) await prisma.order.deleteMany({ where: { id: orderId } });
    if (bookingId) await cleanupBookingRequest(bookingId);
    if (speakerAppId) await cleanupSpeakerApplication(speakerAppId);
    if (lectureReqId) await cleanupLectureRequest(lectureReqId);
    await stopServer(server);
    await disconnectPrisma();
  }
}

main().catch(async (e) => {
  console.error(e);
  await disconnectPrisma();
  process.exit(1);
});
