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
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUser } from "@/contexts/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AppSidebarMobileProps {
  className?: string;
}

export function AppSidebarMobile({ className }: AppSidebarMobileProps) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("/");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHROpen, setIsHROpen] = useState(false);

  // Update active item when location changes
  useEffect(() => {
    setActiveItem(location.pathname);
    
    // Auto-open HR dropdown if on HR pages
    if (location.pathname.startsWith("/hr")) {
      setIsHROpen(true);
    }
  }, [location.pathname]);

  // Close sidebar when route changes (mobile UX improvement)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open (mobile UX improvement)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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
      allowedRoles: ["admin", "md", "project"],
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
      allowedRoles: ["admin", "md", "accounts"],
    },
    {
      title: "Purchase Management",
      url: "/purchase-management",
      icon: ShoppingCart,
      allowedRoles: ["admin", "md", "site", "store", "accounts"],
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
        "hr",
        "project"
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
        "hr",
        "project"
      ],
    },
    {
      title: "System Settings",
      url: "/settings",
      icon: Settings,
      allowedRoles: ["admin"],
    },
  ];

  // HR menu items with subitems
  const hrItems = {
    title: "Human Resources",
    icon: Users,
    allowedRoles: ["admin", "md", "hr"],
    subitems: [
      {
        title: "Employees",
        url: "/hr/employees",
      },
      {
        title: "Salary Management",
        url: "/hr/salaries",
      },
    ],
  };

  const filteredItems = user
    ? items.filter((item) => item.allowedRoles.includes(user.role))
    : [];

  const showHR = user && hrItems.allowedRoles.includes(user.role);

  const handleMenuItemClick = (url: string) => {
    setActiveItem(url);
    navigate(url);
    setIsOpen(false); // Close the sheet after navigation
    
    // Auto-open HR dropdown if navigating to HR pages
    if (url.startsWith("/hr")) {
      setIsHROpen(true);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      console.log("Starting logout process...");
      await logout();
      console.log("Logout completed, navigating to login...");
      navigate("/login");
      setIsOpen(false);
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "md:hidden h-10 w-10 touch-manipulation",
            "hover:bg-accent hover:text-accent-foreground",
            "active:scale-95 transition-all duration-150",
            className
          )}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-80 p-0 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <SheetHeader className="border-b p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-7 w-7 text-primary" />
              <SheetTitle className="text-lg font-semibold text-foreground">
                ConstructFlow
              </SheetTitle>
            </div>
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "h-8 w-8 touch-manipulation",
                  "hover:bg-accent hover:text-accent-foreground",
                  "active:scale-95 transition-all duration-150"
                )}
              >
                {/* <X className="h-4 w-4" /> */}
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                ERP Modules
              </h3>
              <div className="space-y-1">
                {/* HR Dropdown Menu - Moved to top */}
                {showHR && (
                  <Collapsible open={isHROpen} onOpenChange={setIsHROpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant={activeItem.startsWith("/hr") ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-12 px-3 text-left",
                          "hover:bg-accent hover:text-accent-foreground",
                          "active:scale-95 transition-all duration-150",
                          "touch-manipulation",
                          activeItem.startsWith("/hr") && "bg-accent text-accent-foreground shadow-sm"
                        )}
                      >
                        <hrItems.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">
                          {hrItems.title}
                        </span>
                        {isHROpen ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-8 space-y-1 mt-1">
                        {hrItems.subitems.map((subitem) => (
                          <Button
                            key={subitem.title}
                            variant={activeItem === subitem.url ? "secondary" : "ghost"}
                            className={cn(
                              "w-full justify-start gap-3 h-10 px-3 text-left",
                              "hover:bg-accent hover:text-accent-foreground",
                              "active:scale-95 transition-all duration-150",
                              "touch-manipulation",
                              activeItem === subitem.url && "bg-accent text-accent-foreground shadow-sm"
                            )}
                            onClick={() => handleMenuItemClick(subitem.url)}
                          >
                            <span className="text-sm font-medium truncate">
                              {subitem.title}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {/* Regular menu items */}
                {filteredItems.map((item) => (
                  <Button
                    key={item.title}
                    variant={activeItem === item.url ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-3 text-left",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-95 transition-all duration-150",
                      "touch-manipulation",
                      activeItem === item.url && "bg-accent text-accent-foreground shadow-sm"
                    )}
                    onClick={() => handleMenuItemClick(item.url)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-4 flex-shrink-0 space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-muted-foreground">
              Theme
            </span>
            <ThemeToggle />
          </div>

          <Separator className="my-3" />

          {/* User Profile Section */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start p-3 h-auto min-h-[60px]",
                  "hover:bg-accent hover:text-accent-foreground",
                  "active:scale-95 transition-all duration-150",
                  "touch-manipulation"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-sm font-medium">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate w-full">
                      {user.name}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  navigate("/profile");
                  setIsOpen(false);
                }}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  navigate("/notifications");
                  setIsOpen(false);
                }}
              >
                Notifications
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
                disabled={isLoggingOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
}