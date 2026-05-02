import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Heart, Award, Info, AlertCircle } from "lucide-react";
import { getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const { data: notifications, isLoading } = useGetNotifications({
    query: { queryKey: getGetNotificationsQueryKey() }
  });

  const markRead = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    }
  });

  const markAllRead = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      }
    }
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const getIcon = (type: string) => {
    switch(type) {
      case 'reminder': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'tip': return <Heart className="h-5 w-5 text-rose-500" />;
      case 'achievement': return <Award className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t("Notifications")}</h1>
            <p className="text-muted-foreground">{t("Stay updated on your wellbeing journey")}</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Check className="h-4 w-4 mr-2" />
              {t("Mark all as read")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-border/50">
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications?.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-10 w-10 text-primary/40" />
              </div>
              <h3 className="text-xl font-medium text-foreground">No notifications yet</h3>
              <p className="text-muted-foreground mt-2">You're all caught up!</p>
            </div>
          ) : (
            notifications?.map((notification) => (
              <Card 
                key={notification.id} 
                className={`shadow-sm transition-colors ${!notification.read ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-card'}`}
              >
                <CardContent className="p-4 sm:p-6 flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${!notification.read ? 'bg-background' : 'bg-muted'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-semibold ${!notification.read ? 'text-foreground' : 'text-foreground/80'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className={`text-sm ${!notification.read ? 'text-foreground/90' : 'text-muted-foreground'}`}>
                      {notification.body}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="shrink-0 h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
                      onClick={() => markRead.mutate({ id: notification.id })}
                      disabled={markRead.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
