"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

type ChatMode = "general" | "medical" | "appointment";

export default function AIChatAssistant() {
    const { data: session, status } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>("general");
    const [usageSummary, setUsageSummary] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const placeholderByMode: Record<ChatMode, string> = {
        general: "Ask about any feature or process in the hospital system...",
        medical: "Ask about symptoms, medications, or clinical workflows...",
        appointment: "Ask about scheduling, availability, or rescheduling steps...",
    };

    const quickPrompts: Record<ChatMode, string[]> = {
        general: [
            "Give me a quick tour of the dashboard.",
            "How do I export monthly reports?",
            "What data is required to register a new patient?",
        ],
        medical: [
            "Explain common side effects of this prescription: [name].",
            "Draft a clear follow-up care note for a discharged patient.",
            "Summarize a lab report for a patient in plain language.",
        ],
        appointment: [
            "Find the next available slot for Dr. Smith this week.",
            "How do I reschedule a canceled appointment automatically?",
            "Create a concise reminder message for tomorrow's appointments.",
        ],
    };

    const modeDetails: Record<
        ChatMode,
        { label: string; description: string; badge: string }
    > = {
        general: {
            label: "General Assistant",
            description: "Navigation help, workflows, and system guidance.",
            badge: "Neutral",
        },
        medical: {
            label: "Medical Assistant",
            description: "Non-diagnostic clinical context and explanations.",
            badge: "Clinical",
        },
        appointment: {
            label: "Appointment Helper",
            description: "Scheduling, reminders, and availability support.",
            badge: "Scheduling",
        },
    };

    const handleSend = async (promptOverride?: string) => {
        const messageToSend =
            typeof promptOverride === "string" ? promptOverride : input;

        if (!messageToSend.trim() || isLoading) return;
        if (status === "unauthenticated") {
            toast.error("Please sign in to use the AI assistant.");
            return;
        }

        const userMessage: Message = {
            role: "user",
            content: messageToSend.trim(),
            timestamp: new Date(),
        };

        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        if (!promptOverride) setInput("");
        setIsLoading(true);
        setUsageSummary(null);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationHistory: nextMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                    })),
                    mode: mode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    return;
                }
                if (data.code === "API_KEY_MISSING") {
                    toast.error("OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.");
                } else {
                    toast.error(data.error || "Failed to get AI response");
                }
                setIsLoading(false);
                return;
            }

            const assistantMessage: Message = {
                role: "assistant",
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            if (data.usage) {
                const { prompt_tokens, completion_tokens, total_tokens } = data.usage;
                setUsageSummary(
                    `Usage • prompt: ${prompt_tokens ?? 0} • completion: ${completion_tokens ?? 0} • total: ${total_tokens ?? 0}`
                );
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <Card className="flex flex-col h-[680px] w-full shadow-lg border border-slate-200/60 dark:border-slate-800/80">
            <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-600" />
                        <CardTitle className="text-lg">AI Assistant</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={mode}
                            onChange={(e) => setMode(e.target.value as ChatMode)}
                            className="text-xs px-2 py-1 rounded border bg-background"
                        >
                            <option value="general">General</option>
                            <option value="medical">Medical</option>
                            <option value="appointment">Appointment</option>
                        </select>
                        {messages.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearChat}
                                className="text-xs"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
                <Badge variant="secondary" className="mt-2 w-fit">
                    {modeDetails[mode].label}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {modeDetails[mode].description}
                </p>
                {session?.user?.email && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Signed in as {session.user.email}
                    </p>
                )}
                {status !== "authenticated" && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Login required to chat. Your session secures the API.</span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Quick prompts */}
                <div className="px-4 py-3 border-b bg-slate-50/60 dark:bg-slate-900/40">
                    <div className="flex flex-wrap gap-2">
                        {quickPrompts[mode].map((prompt) => (
                            <Button
                                key={prompt}
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                                onClick={() => handleSend(prompt)}
                                disabled={isLoading}
                            >
                                {prompt}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Bot className="h-12 w-12 mb-4 text-indigo-300" />
                            <p className="text-sm">Start a conversation with AI Assistant</p>
                            <p className="text-xs mt-2">Ask questions about appointments, medical info, or general help</p>
                        </div>
                    ) : (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex gap-3",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {message.role === "assistant" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-4 py-2",
                                        message.role === "user"
                                            ? "bg-indigo-600 text-white"
                                            : "bg-muted text-foreground"
                                    )}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                {message.role === "user" && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                        <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-3 justify-start">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
                            </div>
                            <div className="bg-muted rounded-lg px-4 py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholderByMode[mode]}
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim() || status !== "authenticated"}
                            size="icon"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press Enter to send, Shift+Enter for new line
                    </p>
                    {usageSummary && (
                        <p className="text-[11px] text-muted-foreground mt-1">
                            {usageSummary}
                        </p>
                    )}
                    {status === "unauthenticated" && (
                        <div className="mt-3 flex items-center justify-between rounded-md border bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-200">
                            <span>Sign in to unlock the AI assistant.</span>
                            <Button asChild size="sm" variant="outline">
                                <Link href="/login">Sign in</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

