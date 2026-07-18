import SideNav from "../ui/dashboard/sidnav";
import { TopNavbar } from "@/app/ui/dashboard/top-navbar";
import { getCurrentUserRole } from "@/app/lib/data"; 
// Note: If you don't have a getCurrentUser() helper yet, you can pass a combined profile object from your session backend.

export default async function Layout({ children }: { children: React.ReactNode }) {
  // 1. Fetch the user role and profile details server-side securely
  const role = await getCurrentUserRole();
  
  // Example fallback profile object. Replace this with your actual database user fetch if available!
  const currentUser = {
    name: role === "admin" ? "Olivia Kim" : "Yad Developer",
    email: role === "admin" ? "olivia.kim@company.com" : "yad@company.com",
    role: role,
    image_url: null, // Triggers your custom initials fallback circle badge
  };

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-slate-50/50">
      
      {/* 2. Side Navigation Panel */}
      <div className="w-full flex-none md:w-64">
        <SideNav role={'employee'} />
      </div>
      
      {/* 3. Main Workspace Area: Stacked Vertically to include the Top Navbar */}
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