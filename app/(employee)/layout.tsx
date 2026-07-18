import SideNav from "../ui/dashboard/sidnav";
import { TopNavbar } from "@/app/ui/dashboard/top-navbar";
import { auth } from "@/app/auth"; // 👈 Pull sessions securely via Auth.js

export default async function Layout({ children }: { children: React.ReactNode }) {
  // 1. Fetch the live user session server-side
  const session = await auth();
  
  // 2. Map the active employee parameters directly from the token payload
  const currentUser = {
    name: session?.user?.name || "Yad Developer",
    email: session?.user?.email || "yad@company.com",
    role: session?.user?.role || "employee",
    image_url: session?.user?.image || null, // Triggers your custom initials fallback circle badge
  };

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/50">
      
      {/* 3. Side Navigation Panel */}
      <div className="w-full flex-none md:w-64">
        <SideNav role="employee" />
      </div>
      
      {/* 4. Main Workspace Area: Stacked Vertically to include the Top Navbar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* The new interactive Top Navbar */}
        <TopNavbar user={currentUser} />
        
        {/* Dynamic page contents block rendered safely with standard padding */}
        <div className="grow p-6 md:overflow-y-auto md:p-12 bg-white">
          {children}
        </div>
      </div>

    </div>
  );
}