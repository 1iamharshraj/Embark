import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Container from "@/components/Container";
import Eyebrow from "@/components/Eyebrow";
import { certificateTypeLabel } from "@/lib/certificate";

export default async function CertificateVerificationPage({
  params,
}: {
  params: { certificateId: string };
}) {
  const certificate = await prisma.certificate.findUnique({
    where: { certificateId: params.certificateId },
    include: {
      hackathon: { select: { title: true, slug: true } },
      user: { select: { name: true } },
    },
  });

  if (!certificate || certificate.status !== "VALID") {
    notFound();
  }

  const isValid = certificate.status === "VALID";

  return (
    <section className="bg-cream py-16 sm:py-24">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <Eyebrow>Certificate verification</Eyebrow>
          <h1 className="font-display font-bold text-3xl text-charcoal mb-4">
            {isValid ? "Certificate is valid" : "Certificate is not valid"}
          </h1>

          <div className="bg-white rounded-2xl border border-charcoal/8 p-6 sm:p-10 text-left space-y-6 mt-8">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Recipient</p>
                <p className="text-lg font-semibold text-charcoal">{certificate.user.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Hackathon</p>
                <p className="text-lg font-semibold text-charcoal">{certificate.hackathon.title}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Award</p>
                <p className="text-lg font-semibold text-charcoal">{certificateTypeLabel(certificate.type)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Issued on</p>
                <p className="text-lg font-semibold text-charcoal">
                  {new Date(certificate.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-charcoal/8 pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-inkSoft">Certificate ID</p>
              <p className="text-sm font-mono text-charcoal break-all">{certificate.certificateId}</p>
            </div>

            {certificate.pdfUrl && (
              <div className="border-t border-charcoal/8 pt-6">
                <a
                  href={certificate.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full font-semibold bg-orangeDeep text-white px-6 py-2.5 hover:bg-[#1740A8] transition"
                >
                  View certificate
                </a>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
