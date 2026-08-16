import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, X, MessageSquare, Send, Sparkles, Phone, Mail } from "lucide-react";
import { Streamdown } from "streamdown";
import { Lang } from "@/lib/i18n";

interface DuckAIChatProps {
  language: Lang;
}

export function DuckAIChat({ language }: DuckAIChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    {
      role: "assistant",
      content: language === "pt"
        ? "E aí! Sou o assistente de IA do Duck (Duck4x). Como posso te ajudar hoje sobre os beats, mixagem ou agendamento?"
        : language === "es"
        ? "¡Qué tal! Soy el asistente de IA de Duck (Duck4x). ¿Cómo te puedo ayudar hoy con los beats, mezcla o agendamiento?"
        : "Hey! I'm Duck's AI assistant. How can I help you today with beats, mixing, or booking?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatMutation = trpc.duck.aiChat.useMutation();

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;
    const userText = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMessages);

    try {
      const res = await chatMutation.mutateAsync({
        message: userText,
        language,
        history: newMessages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
      });
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Ops, tive um pequeno soluço no estúdio. Tente de novo!" }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-accent text-[#07130b] shadow-2xl hover:scale-105 transition-transform flex items-center justify-center border border-white/20"
          aria-label="Open AI Chat"
        >
          <Bot className="w-7 h-7" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
        </Button>
      )}

      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          <div className="bg-surface2 px-4 py-3 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
              <span className="font-unbounded font-bold text-sm">Duck AI Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/5579996026590"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 p-1"
                title="WhatsApp Direct"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href="mailto:duck-beats@hotmail.com"
                className="text-accent hover:text-accent2 p-1"
                title="Email Direct"
              >
                <Mail className="w-4 h-4" />
              </a>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-dim hover:text-foreground">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-manje text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-accent text-[#07130b] font-medium rounded-br-none"
                      : "bg-surface2 text-foreground border border-border rounded-bl-none"
                  }`}
                >
                  <Streamdown>{m.content}</Streamdown>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex items-center gap-2 text-xs text-dim font-mono animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Duck afinando frequências y respondiendo...
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border bg-background/50 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu consulta..."
              className="bg-surface text-foreground text-xs border-border"
            />
            <Button onClick={handleSend} disabled={chatMutation.isPending} size="icon" className="bg-accent text-[#07130b] hover:bg-accent2">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
