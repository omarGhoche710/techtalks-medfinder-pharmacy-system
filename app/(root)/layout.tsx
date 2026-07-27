import SiteFooter from "@/components/layout/SiteFooter";
import SiteNavbar from "@/components/layout/SiteNavbar";

export default function RootGroupLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <main className="root">
      {modal}
      <SiteNavbar />
      <div className="root-container">
        <div className="wrapper">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}
