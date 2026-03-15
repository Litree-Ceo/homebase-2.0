import OSDesktop from "@/components/OSDesktop";

export default function Home() {
  return (
    <main className="h-screen w-screen relative bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>
      
      {/* Desktop Environment */}
      <div className="relative z-10 h-full w-full">
        <OSDesktop />
      </div>
    </main>
  );
}
