import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { useGetConversations, useCreateConversation } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Plus, Search } from "lucide-react";
import { getGetConversationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatList() {
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  
  const { data: conversations, isLoading } = useGetConversations({
    query: { queryKey: getGetConversationsQueryKey() }
  });

  const createChat = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setLocation(`/chat/${data.id}`);
      }
    }
  });

  const handleCreate = () => {
    createChat.mutate({ data: { title: "New Conversation" } });
  };

  const filteredConversations = conversations?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 flex flex-col h-[calc(100vh-120px)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">{t("Chat")}</h1>
            <p className="text-muted-foreground">{t("Your mental health companion")}</p>
          </div>
          <Button onClick={handleCreate} disabled={createChat.isPending} className="rounded-full shadow-sm shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            {t("New Conversation")}
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-9 bg-card/50 backdrop-blur-sm border-border/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-border/50">
                <CardContent className="p-4 flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredConversations?.length === 0 ? (
            <div className="text-center py-20 bg-card/50 rounded-2xl border border-border/50 h-full flex flex-col items-center justify-center">
              <div className="bg-primary/10 h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">{t("No conversations found")}</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Start a new chat to begin your journey towards better mental wellbeing.
              </p>
              <Button onClick={handleCreate} variant="outline" className="rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                {t("Start a new chat")}
              </Button>
            </div>
          ) : (
            filteredConversations?.map((conversation) => (
              <Link key={conversation.id} href={`/chat/${conversation.id}`}>
                <Card className="shadow-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                  <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {conversation.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
