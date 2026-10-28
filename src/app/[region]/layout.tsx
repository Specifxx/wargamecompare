import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { isRegion } from "@/lib/regions";

export default function RegionLayout({ children, params }: { children: React.ReactNode; params: { region: string } }) {
  if (!isRegion(params.region)) notFound();
  return (
    <>
      <Header region={params.region} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer region={params.region} />
    </>
  );
}
