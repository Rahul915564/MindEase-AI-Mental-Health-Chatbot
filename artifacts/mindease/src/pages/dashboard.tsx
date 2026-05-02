import { useLanguage } from "@/components/language-provider";
import { AppLayout } from "@/components/layout";
import { 
  useGetMoodStats, 
  useGetConversations,
  useCreateMoodEntry 
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/react";
import { Activity, MessageCircle, Wind, ArrowRight, Smile, Meh, Frown } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getGetMoodEntriesQueryKey, getGetMoodStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useGetMoodStats({
    query: { queryKey: getGetMoodStatsQueryKey() }
  });
  
  const { data: conversations, isLoading: convLoading } = useGetConversations({
    query: { queryKey: ["/api/openai/conversations"] }
  });

  const createMood = useCreateMoodEntry({
    mutation: {
      onSuccess: () => {
        toast({ title: t("Mood logged successfully") });
        queryClient.invalidateQueries({ queryKey: getGetMoodStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMoodEntriesQueryKey() });
      }
    }
  });

  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  const handleMoodSubmit = () => {
    if (selectedMood !== null) {
      createMood.mutate({ data: { mood: selectedMood } });
      setSelectedMood(null);
    }
  };

  const recentChat = conversations?.[0];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {t("Welcome back")}, {user?.firstName || "Friend"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("how are you today?")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Mood Log */}
          <Card className="col-span-1 md:col-span-2 shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t("log your mood")}
              </CardTitle>
              <CardDescription>{t("Select how you're feeling right now")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center space-y-6 py-4">
                <div className="flex items-center justify-center gap-4 sm:gap-8">
                  <button 
                    onClick={() => setSelectedMood(2)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${selectedMood === 2 ? 'bg-destructive/10 text-destructive scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Frown className="h-12 w-12" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Low</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMood(5)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${selectedMood === 5 ? 'bg-secondary text-secondary-foreground scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Meh className="h-12 w-12" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Okay</span>
                  </button>
                  <button 
                    onClick={() => setSelectedMood(8)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${selectedMood === 8 ? 'bg-primary/10 text-primary scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                  >
                    <Smile className="h-12 w-12" strokeWidth={1.5} />
                    <span className="text-sm font-medium">Good</span>
                  </button>
                </div>
                
                <Button 
                  disabled={selectedMood === null || createMood.isPending} 
                  onClick={handleMoodSubmit}
                  className="w-full max-w-xs rounded-full"
                >
                  {t("Save Mood")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card className="shadow-sm border-border/50 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-primary-foreground/90">{t("Mood Stats")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {statsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
                  <Skeleton className="h-8 w-24 bg-primary-foreground/20" />
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-primary-foreground/70 text-sm">{t("Average Mood")}</p>
                    <p className="text-4xl font-bold">{stats?.averageMood?.toFixed(1) || "-"}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-primary-foreground/70 text-sm">{t("Streak")}</p>
                      <p className="text-2xl font-bold">{stats?.streak || 0} {t("days")}</p>
                    </div>
                    <div className="bg-primary-foreground/20 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-md">
                      {stats?.trend === 'improving' ? '↗' : stats?.trend === 'declining' ? '↘' : '→'} {stats?.trend || 'Stable'}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Chat */}
          <Card className="shadow-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer" onClick={() => recentChat ? setLocation(`/chat/${recentChat.id}`) : setLocation('/chat')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                {t("Recent Chat")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {convLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : recentChat ? (
                <div className="space-y-2">
                  <p className="font-medium text-lg">{recentChat.title}</p>
                  <p className="text-sm text-muted-foreground">{new Date(recentChat.updatedAt).toLocaleDateString()}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-muted-foreground">{t("Start a new chat")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Exercise */}
          <Card className="shadow-sm border-border/50 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => setLocation('/breathing')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-primary" />
                {t("Breathing")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-lg">{t("Box Breathing (4-4-4-4)")}</p>
                  <p className="text-sm text-muted-foreground">Find your center in 1 minute</p>
                </div>
                <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
