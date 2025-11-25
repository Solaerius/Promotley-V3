import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Sparkles,
  BarChart3,
  Calendar,
  FileText,
  TrendingUp,
  Paperclip,
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender: "user" | "ai";
  message: string;
  timestamp: Date;
}

const AIChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      message: "Hej! Jag är din AI-assistent från Promotley. Jag kan hjälpa dig med:\n\n📊 Analysera din statistik\n📅 Skapa marknadsföringsplaner\n✍️ Skriva captions\n🎯 Utveckla 30-dagars strategier\n\nVad vill du ha hjälp med idag?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { icon: BarChart3, text: "Analysera min statistik", color: "from-blue-500 to-cyan-500" },
    { icon: Calendar, text: "Skapa marknadsföringsplan", color: "from-purple-500 to-pink-500" },
    { icon: FileText, text: "Skriv caption", color: "from-orange-500 to-red-500" },
    { icon: TrendingUp, text: "Skapa 30-dagars strategi", color: "from-green-500 to-emerald-500" },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      message: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulera AI-svar (kommer ersättas med riktig OpenAI-integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        message: "Tack för din fråga! AI-funktionaliteten kommer snart att integreras med OpenAI. Just nu kan jag ta emot dina meddelanden och vi arbetar på att göra mig ännu smartare. 🚀",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickCommand = (command: string) => {
    handleSendMessage(command);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-12rem)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">AI-Assistent</h1>
          <p className="text-muted-foreground">
            Chatta med Promotleys AI för personliga råd och insikter
          </p>
        </div>

        {/* Quick Commands */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {quickCommands.map((cmd, index) => {
            const Icon = cmd.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-soft transition-all duration-300 group"
                onClick={() => handleQuickCommand(cmd.text)}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cmd.color} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-left">{cmd.text}</span>
              </Button>
            );
          })}
        </div>

        {/* Chat Container */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] lg:max-w-[60%] ${msg.sender === "user" ? "order-2" : "order-1"}`}>
                      {msg.sender === "ai" && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-medium">Promotley AI</span>
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-4 shadow-soft ${
                          msg.sender === "user"
                            ? "bg-gradient-primary text-white ml-auto"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                        <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] lg:max-w-[60%]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Promotley AI</span>
                      </div>
                      <div className="rounded-2xl p-4 bg-muted">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => toast({ title: "Filuppladdning", description: "Kommer snart!" })}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Skriv ditt meddelande..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  variant="gradient"
                  size="icon"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                AI kan göra misstag. Kontrollera viktig information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIChat;
