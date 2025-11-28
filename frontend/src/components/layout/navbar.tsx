import { Search, Bell, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {ModeToggle} from "@/components/mode-toggle";
import {useAuth} from "@/hooks/useAuth";

export function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.username || user?.email || "Admin User";
  const secondaryText = user?.email || user?.roles?.[0] || "admin@example.com";
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <header className="h-16 border-b bg-card flex items-center px-6 sticky top-0 z-10">
      <div className="relative w-full flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-lg font-semibold">Business ERP</p>
            <p className="text-xs text-muted-foreground">Smart management console</p>
          </div>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 text-sm rounded-md w-full border bg-background"
          />
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />

          <button className="relative p-2 rounded-full hover:bg-accent">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center space-x-2 rounded-full border px-3 py-1 hover:bg-accent">
              <div className="rounded-full bg-primary/10 text-primary p-1">
                <User className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground">{secondaryText}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Signed in as
                <span className="block font-medium text-foreground">{displayName}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
