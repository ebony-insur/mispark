import DashboardSidebar from "@/components/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* This sidebar stays visible and doesn't reload when navigating the dashboard */}
      <DashboardSidebar /> 
      
      {/* This is where your page content gets injected */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}