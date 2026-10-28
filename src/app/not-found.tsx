import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
      <Header region={null} />
      <main id="main" className="page flex-1 py-16">
        <h1 className="font-display text-3xl font-extrabold">That page isn&rsquo;t here</h1>
        <p className="mt-3 text-muted">The product may no longer be listed by any store we compare.</p>
        <p className="mt-6 flex flex-wrap gap-3">
          {["uk", "au", "nz", "ca", "us"].map((r) => (
            <Link key={r} href={`/${r}`} className="chip">
              {r.toUpperCase()} prices
            </Link>
          ))}
        </p>
      </main>
      <Footer region={null} />
    </>
  );
}
