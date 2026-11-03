import Link from "@/components/Link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Icon } from "@/components/Icon";
import { REGION_LIST } from "@/lib/regions";

export default function NotFound() {
  return (
    <>
      <Header region={null} />
      <main id="main" className="page flex-1 py-16">
        <div className="card mx-auto max-w-xl px-6 py-10 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sold-soft text-sold" aria-hidden="true">
            <Icon name="search" size={22} />
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">That page isn&rsquo;t here</h1>
          <p className="mt-3 text-muted">The product may no longer be listed by any store we compare.</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-2">
            {REGION_LIST.map((r) => (
              <li key={r.region}>
                <Link href={`/${r.region}`} className="chip min-h-10">
                  {r.short} prices
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer region={null} />
    </>
  );
}
