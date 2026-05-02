import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import { useLanguage } from "./language-provider";
import { useTheme } from "./theme-provider";
import {
  LayoutDashboard,
  MessageCircle,
  Wind,
  Activity,
  Bell,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useGetNotifications } from "@workspace/api-client-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat", icon: MessageCircle },
  { name: "Breathing", href: "/breathing", icon: Wind },
  { name: "Mood", href: "/mood", icon: Activity },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: notifications } = useGetNotifications({
    query: { enabled: true },
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const NavItems = () => (
    <div className="flex flex-col space-y-2">
      {navigation.map((item) => {
        const isActive = location.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link key={item.name} href={item.href}>
            <div
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{t(item.name)}</span>
              {item.name === "Notifications" && unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto px-1.5 py-0.5 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row w-full">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
            <Wind className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">{t("MindEase")}</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6 flex flex-col h-full bg-card">
              <div className="flex items-center space-x-2 mb-8">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Wind className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-xl text-card-foreground">
                  {t("MindEase")}
                </span>
              </div>
              <ScrollArea className="flex-1 -mx-2 px-2">
                <NavItems />
              </ScrollArea>
              <div className="mt-auto pt-6 border-t border-border">
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user?.fullName}</span>
                    <span className="text-xs text-muted-foreground truncate w-32">
                      {user?.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => signOut()}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {t("Sign Out")}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-72 border-r border-border bg-card p-6 min-h-screen fixed left-0 top-0 bottom-0 z-10">
        <div className="flex items-center space-x-3 mb-10 pl-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Wind className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-card-foreground">
            {t("MindEase")}
          </span>
        </div>
        <ScrollArea className="flex-1 -mx-2 px-2">
          <NavItems />
        </ScrollArea>
        <div className="mt-auto pt-6 border-t border-border">
          <div className="flex items-center space-x-3 mb-4 p-2">
            <Avatar>
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.fullName}</span>
              <span className="text-xs text-muted-foreground truncate w-40">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {t("Sign Out")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-72 flex flex-col min-h-[calc(100vh-65px)] md:min-h-screen">
        <main className="flex-1 p-6 md:p-10 max-w-6xl w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </main>
      </div>
    </div>
  );
}
