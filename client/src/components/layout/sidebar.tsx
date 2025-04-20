import { useLocation, Link } from "wouter";
import { 
  LucideIcon,
  LayoutDashboard, 
  Shield, 
  History, 
  Key, 
  Smartphone, 
  Settings 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isActive?: boolean;
}

function NavItem({ href, icon: Icon, children, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <a
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          isActive
            ? "bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
        }`}
      >
        <Icon
          className={`mr-3 h-5 w-5 ${
            isActive
              ? "text-primary-500 dark:text-primary-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
        {children}
      </a>
    </Link>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-5">
          <span className="text-xl font-semibold text-primary-600 dark:text-primary-400">SecureShield</span>
        </div>
        
        {/* Navigation */}
        <nav className="mt-5 px-2 space-y-1">
          <NavItem href="/" icon={LayoutDashboard} isActive={location === "/"}>
            Dashboard
          </NavItem>
          <NavItem href="/security-status" icon={Shield} isActive={location === "/security-status"}>
            Security Status
          </NavItem>
          <NavItem href="/activity-log" icon={History} isActive={location === "/activity-log"}>
            Activity Log
          </NavItem>
          <NavItem href="/password-manager" icon={Key} isActive={location === "/password-manager"}>
            Password Manager
          </NavItem>
          <NavItem href="/sessions" icon={Smartphone} isActive={location === "/sessions"}>
            Sessions
          </NavItem>
          <NavItem href="/settings" icon={Settings} isActive={location === "/settings"}>
            Settings
          </NavItem>
        </nav>
      </div>
      
      {/* Profile Section */}
      {user && (
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <Avatar>
                  <AvatarImage src={user.avatarUrl} alt="Profile picture" />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.username}</p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">View Profile</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
