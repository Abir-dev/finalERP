import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  DollarSign,
  FileText,
  HardHat,
  Home,
  Monitor,
  Package,
  PaintBucket,
  Settings,
  Users,
  Warehouse,
  LogOut,
  ShoppingCart,
  Receipt,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("/");
  const { state, toggleSidebar } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
      allowedRoles: ["admin", "md"],
    },
    {
      title: "Managing Director",
      url: "/md-dashboard",
      icon: BarChart3,
      allowedRoles: ["admin", "md"],
    },
    {
      title: "Admin & IT",
      url: "/admin-dashboard",
      icon: Monitor,
      allowedRoles: ["admin"],
    },
    {
      title: "Design Dashboard",
      url: "/design-dashboard",
      icon: PaintBucket,
      allowedRoles: ["admin", "md", "client-manager", "site"],
    },
    {
      title: "Client Dashboard",
      url: "/client-manager",
      icon: Users,
      allowedRoles: ["admin", "md", "client-manager"],
    },
    {
      title: "Store Dashboard",
      url: "/store-manager",
      icon: Package,
      allowedRoles: ["admin", "md", "store"],
    },
    {
      title: "Accounts Dashboard",
      url: "/accounts-manager",
      icon: DollarSign,
      allowedRoles: ["admin", "md", "accounts"],
    },
    {
      title: "Site Dashboard",
      url: "/site-manager",
      icon: HardHat,
      allowedRoles: ["admin", "md", "site"],
    },
    {
      title: "Client Portal",
      url: "/client-portal",
      icon: Building2,
      allowedRoles: ["admin", "client"],
    },
    {
      title: "Project Management",
      url: "/projects",
      icon: ClipboardList,
      allowedRoles: ["admin", "md", "site"],
    },
    {
      title: "Tender Management",
      url: "/tender-management",
      icon: FileText,
      allowedRoles: ["admin", "md", "client-manager"],
    },
    {
      title: "Billing Management",
      url: "/billing-management",
      icon: Receipt,
      allowedRoles: ["admin", "md", "accounts", "site"],
    },
    {
      title: "Purchase Management",
      url: "/purchase-management",
      icon: ShoppingCart,
      allowedRoles: ["admin", "md", "store", "site", "accounts"],
    },
    {
      title: "Human Resources",
      url: "/hr",
      icon: Users,
      allowedRoles: ["admin", "md"],
    },
    {
      title: "Inventory",
      url: "/inventory",
      icon: Warehouse,
      allowedRoles: ["admin", "md", "store", "site"],
    },
    {
      title: "Documents",
      url: "/documents",
      icon: FileText,
      allowedRoles: [
        "admin",
        "md",
        "client-manager",
        "store",
        "accounts",
        "site",
        "client",
      ],
    },
    {
      title: "Calendar",
      url: "/calendar",
      icon: Calendar,
      allowedRoles: [
        "admin",
        "md",
        "client-manager",
        "store",
        "accounts",
        "site",
        "client",
      ],
    },
    {
      title: "System Settings",
      url: "/settings",
      icon: Settings,
      allowedRoles: ["admin"],
    },
  ];

  const filteredItems = user
    ? items.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  const handleMenuItemClick = (url: string) => {
    setActiveItem(url);
    navigate(url);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      console.log("Starting logout process...");
      await logout();
      console.log("Logout completed, navigating to login...");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="sidebar" className="border-r" collapsible="icon">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {isCollapsed ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={toggleSidebar}
              >
                <PanelLeft className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <Building2 className="h-6 w-6 flex-shrink-0" />
                <span className="text-lg font-semibold truncate">
                  ConstructFlow
                </span>
              </>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>ERP Modules</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className={cn(
                      activeItem === item.url ? "bg-accent" : "",
                      isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-4 w-4" : "h-4 w-4"
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-base">{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className={cn("border-t", isCollapsed ? "p-2" : "p-4")}>
        <div className="flex flex-col gap-4">
          {!isCollapsed && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-2 h-auto",
                  isCollapsed && "w-full flex justify-center"
                )}
              >
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isCollapsed && "justify-center"
                  )}
                >
                  <Avatar
                    className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "h-6 w-6" : "h-6 w-6"
                    )}
                  >
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {user.role}
                      </span>
                    </div>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/notifications")}>
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive"
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
