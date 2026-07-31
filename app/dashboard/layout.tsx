// Change this import to match the exact name of your header file
import SiteHeader from "@/components/SiteHeader"; 

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Note the "flex-col" here so the header sits on top of the content, not next to it
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {/* Your persistent top navigation */}
      <div className="w-full px-6 pt-6 flex justify-center bg-white border-b border-slate-200 pb-4">
        <SiteHeader /> 
      </div>
      
      {/* The main dashboard content injects here */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
      
    </div>
  );
}