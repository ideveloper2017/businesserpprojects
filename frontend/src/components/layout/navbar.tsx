import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  UserCog,
  Shield,
  ChevronDown,
  User,
  Key, Search, Bell, LogOut, Layers, ImageIcon, CreditCard, ListOrdered, ShoppingBasket
} from "lucide-react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {cn} from "@/lib/utils.ts";
import {useState} from "react";
interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
}

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Inventory",
      href: "/inventory",
      icon: Package,
    },
    {
      name: "Customers",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Products",
      icon: ShoppingCart,
      subItems: [
        {
          name: "Product List",
          href: "/products",
          icon: Package,
        },
        {
          name: "Categories",
          href: "/categories",
          icon: Layers,
        },
        {
          name: "Units",
          href: "/units",
          icon: Layers,
        },
      ],
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ListOrdered,
    },
    {
      name: "Payments",
      href: "/payments",
      icon: CreditCard,
    },
    {
      name: "Warehouse",
      href: "/warehouses",
      icon: Package,
    },
    {
      name: "User Management",
      icon: UserCog,
      subItems: [
        {
          name: "Users",
          href: "/users",
          icon: User,
        },
        {
          name: "Roles",
          href: "/roles",
          icon: Shield,
        },
        {
          name: "Permissions",
          href: "/permissions",
          icon: Key,
        },
      ],
    },
    {
      name: "Media Library",
      href: "/media-library",
      icon: ImageIcon,
    },
    {
      name: "POS",
      href: "/pos",
      icon: ShoppingBasket,
    },
  ];
  return (
    <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
      <div className="relative w-full flex items-center justify-between">
        <nav className="flex space-x-1">
          {navItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.href ? (
                    <Link
                        to={item.href}
                        className={cn(
                            "flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                            isActive(item.href) && "bg-accent text-accent-foreground"
                        )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.name}
                    </Link>
                ) : (
                    <>
                      <button
                          onClick={() => toggleSubmenu(item.name)}
                          className={cn(
                              "flex items-center px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors",
                              isActive(`/${item.name.toLowerCase().replace(/\s+/g, '-')}`) && "bg-accent text-accent-foreground"
                          )}
                      >
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.name}
                        {openSubmenu !== item.name ? (
                            <ChevronDown className="ml-1 h-4 w-4" />
                        ) : (
                            <ChevronDown className="ml-1 h-4 w-4 transform rotate-180" />
                        )}
                      </button>
                      {item.subItems && openSubmenu === item.name && (
                          <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-popover z-50">
                            <div className="py-1">
                              {item.subItems.map((subItem) => (
                                  <Link
                                      key={subItem.name}
                                      to={subItem.href || '#'}
                                      className={cn(
                                          "flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground",
                                          isActive(subItem.href || '') && "bg-accent/80 text-accent-foreground"
                                      )}
                                      onClick={() => setOpenSubmenu(null)}
                                  >
                                    <subItem.icon className="mr-3 h-4 w-4" />
                                    {subItem.name}
                                  </Link>
                              ))}
                            </div>
                          </div>
                      )}
                    </>
                )}
              </div>
          ))}
        </nav>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 text-sm rounded-md w-full border bg-background"
          />
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="rounded-full bg-primary text-primary-foreground p-1">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@example.com</p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-accent flex items-center text-sm text-muted-foreground"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
