import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SoftEbayBox } from "@/components/SoftEbayBox";
import { SoftSideNav } from "@/components/SideNav";
import { navGroups } from "@/lib/nav";
import { X_DEFAULT_REGION } from "@/lib/regions";

// The pages with no region of their own (the landing page, About, the legal pages) get the whole navigation too (owner,
// 2026-10-28): the header, the phone menu and, from xl, the sidebar, for the visitor's region (built for the US on the server
// and retargeted in the browser: SideNav.tsx SoftSideNav).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header region={null} />
      <div className="mx-auto flex w-full max-w-shell flex-1">
        <SoftSideNav built={X_DEFAULT_REGION} groups={navGroups(X_DEFAULT_REGION)} />
        <main id="main" className="min-w-0 flex-1">
          {children}
          <div className="page mt-12">
            <SoftEbayBox />
          </div>
        </main>
      </div>
      <Footer region={null} />
    </>
  );
}
