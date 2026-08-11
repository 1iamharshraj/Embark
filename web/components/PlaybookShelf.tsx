"use client";

import Link from "next/link";
import { SHELF_BOOKS, type ShelfBook } from "@/lib/playbookStaticData";

interface StreamMeta {
  slug: string;
  name: string;
  soon?: boolean;
}

interface PlaybookShelfProps {
  streams?: StreamMeta[];
}

function getBookHref(book: ShelfBook): string | undefined {
  if (book.soon) return undefined;
  return `/playbook/${book.slug}`;
}

export default function PlaybookShelf({ streams }: PlaybookShelfProps) {
  const soonSlugs = new Set(streams?.filter((s) => s.soon).map((s) => s.slug) ?? []);

  return (
    <main className="stage" id="shelf">
      <h1 className="stage-title">
        Play<span className="accent">books</span>
      </h1>
      <p className="stage-sub">One book per MBA stream. Pull yours off the shelf.</p>

      <div className="shelf" role="list" aria-label="Stream playbooks shelf">
        {SHELF_BOOKS.map((book, i, all) => {
          const href = getBookHref(book);
          const isSoon = book.soon || soonSlugs.has(book.slug);
          const zIndex = all.length - i;
          const body = (
            <>
              <span className="bk-back" aria-hidden="true" />
              <span className="bk-face" aria-hidden={isSoon ? undefined : "true"}>
                <span className="bk-cover">
                  <span className="bk-kicker">{isSoon ? "Coming soon" : "Stream playbook"}</span>
                  <span className="bk-title">
                    <b>
                      {book.displayName.split("\n").map((line, idx, arr) => (
                        <span key={idx}>
                          {line.includes("Manage­ment") ? (
                            <span dangerouslySetInnerHTML={{ __html: line.replace("Manage­ment", "Manage&shy;ment") }} />
                          ) : (
                            line
                          )}
                          {idx < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </b>
                    {book.subtitle && <i>{book.subtitle}</i>}
                  </span>
                  <span className="bk-foot">Embark India</span>
                </span>
              </span>
              <span className="bk-spine" aria-hidden="true">
                <span>{book.spineLabel}</span>
              </span>
            </>
          );

          const className = `book ${book.coverClass} ${book.size} ${isSoon ? "soon" : ""}`;

          return isSoon ? (
            <span
              key={book.slug}
              className={className}
              style={{ zIndex }}
              role="listitem"
              aria-label={`${book.name} playbook — coming soon`}
            >
              {body}
            </span>
          ) : (
            <Link
              key={book.slug}
              href={href!}
              className={className}
              style={{ zIndex }}
              role="listitem"
              aria-label={`${book.name} playbook`}
            >
              {body}
            </Link>
          );
        })}
      </div>
      <div className="ground" aria-hidden="true" />

      <nav className="pill-row" aria-label="Streams">
        {SHELF_BOOKS.filter((b) => !b.soon && !soonSlugs.has(b.slug)).map((book) => (
          <Link key={book.slug} className="pill" href={`/playbook/${book.slug}`}>
            {book.pillLabel}
          </Link>
        ))}
      </nav>
    </main>
  );
}
