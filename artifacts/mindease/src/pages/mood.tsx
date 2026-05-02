import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { useGetMoodEntries, useCreateMoodEntry, useGetMoodStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getGetMoodEntriesQueryKey, getGetMoodStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, Activity, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

export default function Mood() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const { data: entries, isLoading } = useGetMoodEntries(
    { days: 30 },
    { query: { queryKey: getGetMoodEntriesQueryKey({ days: 30 }) } }
  );

  const { data: stats } = useGetMoodStats({
    query: { queryKey: getGetMoodStatsQueryKey() }
  });

  const createMood = useCreateMoodEntry({
    mutation: {
      onSuccess: () => {
        toast({ title: t("Mood logged successfully") });
        queryClient.invalidateQueries({ queryKey: getGetMoodEntriesQueryKey({ days: 30 }) });
        queryClient.invalidateQueries({ queryKey: getGetMoodStatsQueryKey() });
        setSelectedMood(null);
        setNote("");
      }
    }
  });

  const handleSubmit = () => {
    if (selectedMood !== null) {
      createMood.mutate({ data: { mood: selectedMood, note: note || undefined } });
    }
  };

  const chartData = entries?.slice().reverse().map(entry => ({
    date: format(new Date(entry.createdAt), 'MMM dd'),
    mood: entry.mood,
    fullDate: format(new Date(entry.createdAt), 'MMM dd, yyyy HH:mm')
  })) || [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t("Mood")}</h1>
          <p className="text-muted-foreground">{t("Track your emotional wellbeing over time.")}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logger */}
          <Card className="lg:col-span-1 shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {t("log your mood")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <button 
                  onClick={() => setSelectedMood(2)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedMood === 2 ? 'bg-destructive/10 text-destructive scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Frown className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs font-medium">Low</span>
                </button>
                <button 
                  onClick={() => setSelectedMood(5)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedMood === 5 ? 'bg-secondary text-secondary-foreground scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Meh className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs font-medium">Okay</span>
                </button>
                <button 
                  onClick={() => setSelectedMood(8)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${selectedMood === 8 ? 'bg-primary/10 text-primary scale-110' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  <Smile className="h-10 w-10" strokeWidth={1.5} />
                  <span className="text-xs font-medium">Good</span>
                </button>
              </div>

              {selectedMood !== null && (
                <div className="pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Input 
                    placeholder={t("Note (optional)")} 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-background"
                  />
                  <Button 
                    className="w-full rounded-full" 
                    onClick={handleSubmit}
                    disabled={createMood.isPending}
                  >
                    {t("Save Mood")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card className="lg:col-span-2 shadow-sm border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Mood History (30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[250px] w-full flex items-center justify-center">
                  <Skeleton className="h-[200px] w-full rounded-xl" />
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        domain={[1, 10]} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                        ticks={[2, 5, 8]}
                        tickFormatter={(val) => val === 8 ? 'Good' : val === 5 ? 'Okay' : 'Low'}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.75rem',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ fill: 'hsl(var(--background))', stroke: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] w-full flex flex-col items-center justify-center text-muted-foreground">
                  <Activity className="h-10 w-10 mb-2 opacity-20" />
                  <p>No mood entries yet.</p>
                  <p className="text-sm">Log your mood to see it here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History List */}
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Recent Entries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
            ) : entries?.length === 0 ? (
              <p className="text-muted-foreground">No recent entries.</p>
            ) : (
              entries?.slice(0, 6).map((entry) => (
                <Card key={entry.id} className="shadow-sm border-border/50 bg-card">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.mood >= 7 ? 'bg-primary/10 text-primary' : 
                      entry.mood >= 4 ? 'bg-secondary text-secondary-foreground' : 
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {entry.mood >= 7 ? <Smile className="h-6 w-6" /> : 
                       entry.mood >= 4 ? <Meh className="h-6 w-6" /> : 
                       <Frown className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium">
                          {entry.mood >= 7 ? 'Good' : entry.mood >= 4 ? 'Okay' : 'Low'}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(entry.createdAt), 'MMM dd')}
                        </span>
                      </div>
                      {entry.note ? (
                        <p className="text-sm text-muted-foreground truncate">{entry.note}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic opacity-50">No note</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
