import { PortalHeader } from "@/components/layout/PortalHeader";
import { PortalFooter } from "@/components/layout/PortalFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PortalHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <PortalFooter />
    </>
  );
}
