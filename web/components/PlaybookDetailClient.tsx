"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Container from "@/components/Container";
import Button from "@/components/Button";
import RazorpayButton from "@/components/RazorpayButton";
import type { PlaybookContent as PlaybookContentType } from "@/lib/playbookContent";
import PlaybookHero from "@/components/PlaybookHero";
import PlaybookContent from "@/components/PlaybookContent";

export type { PlaybookContent as PlaybookContentType } from "@/lib/playbookContent";

interface PlaybookDetailClientProps {
  playbook: {
    id: string;
    slug: string;
    name: string;
    category: string;
    theme: string;
    price: number;
    rating: number;
    meta: string;
    content: PlaybookContentType;
  };
}

function isShopPlaybook(category: string) {
  return category === "interview" || category === "case";
}

export default function PlaybookDetailClient({ playbook }: PlaybookDetailClientProps) {
  const c = playbook.content;
  const { data: session, status: sessionStatus } = useSession();
  const isFree = !isShopPlaybook(playbook.category) || playbook.price === 0;
  const [hasAccess, setHasAccess] = useState(isFree);
  const [accessLoaded, setAccessLoaded] = useState(isFree);
  const [bought, setBought] = useState(false);

  // Load access for paid shop playbooks.
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (isFree) {
      setAccessLoaded(true);
      return;
    }
    if (session?.user?.isAdmin) {
      setHasAccess(true);
      setAccessLoaded(true);
      return;
    }
    fetch(`/api/playbooks/${playbook.slug}/access`)
      .then((r) => r.json())
      .then((data: { hasAccess?: boolean }) => {
        setHasAccess(data.hasAccess === true);
      })
      .catch((e) => console.error("Failed to load access", e))
      .finally(() => setAccessLoaded(true));
  }, [playbook, session, sessionStatus, isFree]);

  const previewBullets = c.forYouIf.slice(0, 3);
  const locked = !accessLoaded || (!hasAccess && isShopPlaybook(playbook.category) && playbook.price > 0);

  return (
    <>
      <PlaybookHero name={playbook.name} theme={playbook.theme} oneLiner={c.oneLiner || c.tagline} />

      {locked ? (
        <section className="bg-white py-16 sm:py-20">
          <Container>
            <div className="max-w-3xl mx-auto">
              <div className="bg-cream rounded-2xl p-8 sm:p-10">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-green mb-3 block">
                  Preview
                </span>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-charcoal mb-4">
                  What&apos;s inside this playbook
                </h2>
                <ul className="grid gap-3 mb-8">
                  {previewBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-charcoal">
                      <svg
                        className="w-5 h-5 text-orange flex-none mt-0.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {bought ? (
                    <Button disabled className="opacity-80">
                      Added to library
                    </Button>
                  ) : (
                    <RazorpayButton
                      playbook={{ slug: playbook.slug, name: playbook.name, price: playbook.price }}
                      label={`Buy for ₹${playbook.price}`}
                      onSuccess={() => {
                        setHasAccess(true);
                        setBought(true);
                      }}
                    />
                  )}
                  <span className="text-sm text-inkSoft">One-time purchase. Instant access after payment.</span>
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : (
        <PlaybookContent playbook={playbook} />
      )}
    </>
  );
}
