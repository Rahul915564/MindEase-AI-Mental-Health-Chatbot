import { AppLayout } from "@/components/layout";
import { useLanguage } from "@/components/language-provider";
import { useGetConversationMessages } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft, Bot, User, Sparkles } from "lucide-react";
import { getGetConversationMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Link, useParams } from "wouter";
import { useUser } from "@clerk/react";

interface MessageType {
  id: string | number;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatIndividual() {
  const { t } = useLanguage();
  const { id } = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const convId = parseInt(id || "0");
  
  const { data: historyMessages, isLoading } = useGetConversationMessages(convId, {
    query: { 
      queryKey: getGetConversationMessagesQueryKey(convId),
      enabled: !!convId
    }
  });

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamContent, setStreamContent] = useState("");

  // Sync DB messages with local state when loaded
  useEffect(() => {
    if (historyMessages && historyMessages.length > 0 && messages.length === 0) {
      setMessages(historyMessages as MessageType[]);
    }
  }, [historyMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamContent]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMsg = input.trim();
    setInput("");
    
    // Add local user message immediately
    const newUserMsg: MessageType = { id: Date.now(), role: 'user', content: userMsg };
    setMessages(prev => [...prev, newUserMsg]);
    setIsStreaming(true);
    setStreamContent("");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/openai/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMsg }),
      });
      
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let currentStream = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line.length > 6) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                // Done streaming, add final assistant message
                setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: currentStream }]);
                setStreamContent("");
                setIsStreaming(false);
                queryClient.invalidateQueries({ queryKey: getGetConversationMessagesQueryKey(convId) });
              } else if (data.content) {
                currentStream += data.content;
                setStreamContent(currentStream);
              }
            } catch (e) {
              console.error("Error parsing SSE data", e);
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error", err);
      setIsStreaming(false);
      setStreamContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-card/80 backdrop-blur-md shrink-0">
          <Link href="/chat">
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{t("MindEase")} Assistant</h2>
              <p className="text-xs text-muted-foreground">Always here for you</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/20">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Sparkles className="h-8 w-8 text-primary/30 animate-pulse" />
            </div>
          ) : messages.length === 0 && !isStreaming ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground opacity-70">
              <Bot className="h-12 w-12 mb-2" />
              <p>Hi there. I'm your MindEase companion.</p>
              <p className="text-sm max-w-xs">Feel free to share how you're feeling, or ask for guidance on dealing with difficult emotions.</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    {msg.role === 'user' ? (
                      <>
                        <AvatarImage src={user?.imageUrl} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </>
                    ) : (
                      <div className="h-full w-full bg-primary flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </Avatar>
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                      : 'bg-card border border-border/50 text-card-foreground rounded-tl-sm shadow-sm'
                  }`}>
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isStreaming && streamContent && (
                <div className="flex gap-3 max-w-[85%]">
                  <Avatar className="h-8 w-8 shrink-0 mt-1">
                    <div className="h-full w-full bg-primary flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </Avatar>
                  <div className="px-4 py-3 rounded-2xl bg-card border border-border/50 text-card-foreground rounded-tl-sm shadow-sm">
                    <p className="whitespace-pre-wrap leading-relaxed">{streamContent}</p>
                    <span className="inline-block w-2 h-4 bg-primary/50 animate-pulse ml-1 align-middle rounded-sm"></span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-card border-t border-border/50 shrink-0">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Type your message...")}
              className="resize-none min-h-[60px] max-h-[160px] rounded-xl bg-background border-border/50 focus-visible:ring-primary/30"
              rows={1}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-[60px] w-[60px] shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
