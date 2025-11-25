import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  Bell,
  User,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/logo.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Statistik", href: "/analytics", icon: BarChart3 },
    { name: "Kalender", href: "/calendar", icon: Calendar },
    { name: "AI-Chat", href: "/ai-chat", icon: MessageSquare },
    { name: "Inställningar", href: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
            <img src={logo} alt="Promotley" className="w-10 h-10" />
            <span className="font-bold text-xl text-foreground">Promotley</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              Logga ut
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Promotley" className="w-10 h-10" />
              <span className="font-bold text-xl text-foreground">Promotley</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-gradient-primary text-white shadow-soft"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={signOut}
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              Logga ut
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
