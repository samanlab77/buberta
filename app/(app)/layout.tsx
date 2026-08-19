import NavigationDrawer from "@/components/NavigationDrawer";
import StatusKoneksi from "@/components/StatusKoneksi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <NavigationDrawer />
      <main className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-surface border-b border-outline-variant px-5 h-16 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-surface-on flex-1">
            Buberta Finance
          </h1>
          <StatusKoneksi />
        </header>
        <div className="flex-1 p-6 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
