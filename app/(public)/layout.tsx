// app/(public)/layout.tsx

import Navbar from "./_components/(navbar_group)/Navbar";
import Footer from "./_components/(footer)/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-white dark:bg-gradient-to-br dark:from-burgundy-dark dark:via-burgundy-light dark:to-burgundy-dark pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-shine opacity-20 animate-shine-fast"></div>
        <div className="absolute inset-0 bg-gradient-radial from-burgundy-shine/10 via-transparent to-transparent"></div>
        {children}
      </main>
      <Footer />
    </div>
  );
}