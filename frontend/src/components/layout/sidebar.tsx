import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  ShoppingBasket,
  BarChart2,
  Settings,
  UserCog,
  Shield,
  ChevronDown,
  User,
  Key,
  Layers,
  ImageIcon,
} from "lucide-react";
import { useState } from "react";
import { TenantSelector } from "@/components/tenant/TenantSelector";

interface NavItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavItem[];
}

export function Sidebar() {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const isPathActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Media Library",
      href: "/media-library",
      icon: ImageIcon,
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
      icon: BarChart2,
    },
    {
      name: "Audit Logs",
      href: "/audit",
      icon: BarChart2,
    },
    {
      name: "POS",
      href: "/pos",
      icon: ShoppingBasket,
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
  ];

  return (
    <aside className="w-64 min-h-screen bg-card border-r flex flex-col">
      <div className="px-4 py-6 border-b space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</p>
          <h1 className="text-xl font-semibold text-primary">Business ERP</h1>
          <p className="text-xs text-muted-foreground">Manage your tenants</p>
        </div>
        <div className="p-3 rounded-lg border bg-background">
          <TenantSelector />
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="px-2 space-y-1">
          {navItems.map((item) => {
            const anyChildActive = item.subItems?.some((s) => s.href && isPathActive(s.href));
            const parentActive = item.href ? isPathActive(item.href) : anyChildActive;

            if (item.href) {
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                        (isActive || parentActive) && "bg-accent text-accent-foreground"
                      )
                    }
                  >
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.name}</span>
                  </NavLink>
                </li>
              );
            }

            return (
              <li key={item.name}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openSubmenu === item.name}
                  onClick={() => toggleSubmenu(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                    parentActive && "bg-accent text-accent-foreground"
                  )}
                >
                  <span className="flex items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    {item.name}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", openSubmenu === item.name && "rotate-180")} />
                </button>
                {item.subItems && openSubmenu === item.name && (
                  <ul role="menu" className="mt-1 ml-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <NavLink
                          to={subItem.href || '#'}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                              isActive && "bg-accent/80 text-accent-foreground"
                            )
                          }
                          onClick={() => setOpenSubmenu(null)}
                        >
                          <subItem.icon className="mr-2 h-4 w-4" />
                          <span>{subItem.name}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-3 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent text-accent-foreground"
            )
          }
        >
          <Settings className="mr-2 h-5 w-5" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

