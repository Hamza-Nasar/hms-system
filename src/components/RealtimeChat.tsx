"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Chip,
    CircularProgress,
} from "@mui/material";
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface Message {
    id: string;
    from: string;
    message: string;
    timestamp: string;
    type?: string;
}

interface RealtimeChatProps {
    recipientId: string;
    recipientName: string;
    recipientRole?: string;
}

export default function RealtimeChat({ recipientId, recipientName, recipientRole }: RealtimeChatProps) {
    const { socket, isConnected, sendMessage } = useSocket();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for new messages
        socket.on("new_message", (data: Message) => {
            setMessages((prev) => [...prev, data]);
            setIsTyping(false);
        });

        // Listen for typing indicators
        socket.on("user_typing", (data: { from: string; isTyping: boolean }) => {
            if (data.from === recipientId) {
                setIsTyping(data.isTyping);
            }
        });

        return () => {
            socket.off("new_message");
            socket.off("user_typing");
        };
    }, [socket, isConnected, recipientId]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!inputMessage.trim() || !isConnected) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            from: session?.user?.id || "",
            message: inputMessage,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
        sendMessage(recipientId, inputMessage);
        setInputMessage("");

        // Clear typing indicator
        if (socket) {
            socket.emit("typing", {
                to: recipientId,
                from: session?.user?.id || "",
                isTyping: false,
            });
        }
    };

    const handleTyping = (value: string) => {
        setInputMessage(value);

        if (!socket || !isConnected) return;

        // Emit typing indicator
        if (socket) {
            socket.emit("typing", {
                to: recipientId,
                from: session?.user?.id || "",
                isTyping: value.length > 0,
            });
        }

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Set timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            if (socket) {
                socket.emit("typing", {
                    to: recipientId,
                    from: session?.user?.id || "",
                    isTyping: false,
                });
            }
        }, 1000);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isConnected) {
        return (
            <Paper sx={{ p: 3, textAlign: "center" }}>
                <CircularProgress size={24} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                    Connecting to chat...
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                }}
            >
                <Avatar sx={{ bgcolor: "primary.main" }}>
                    {recipientName.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        {recipientName}
                    </Typography>
                    {recipientRole && (
                        <Typography variant="caption" color="text.secondary">
                            {recipientRole}
                        </Typography>
                    )}
                </Box>
                {isConnected && (
                    <Chip
                        label="Online"
                        size="small"
                        color="success"
                        sx={{ height: 20, fontSize: "0.7rem" }}
                    />
                )}
            </Box>

            {/* Messages */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    bgcolor: "background.default",
                }}
            >
                <List>
                    {messages.map((message, index) => {
                        const isOwn = message.from === session?.user?.id;
                        return (
                            <React.Fragment key={message.id || index}>
                                <ListItem
                                    sx={{
                                        justifyContent: isOwn ? "flex-end" : "flex-start",
                                        px: 0,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            maxWidth: "70%",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: isOwn ? "flex-end" : "flex-start",
                                        }}
                                    >
                                        {!isOwn && (
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {recipientName}
                                            </Typography>
                                        )}
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 1.5,
                                                bgcolor: isOwn ? "primary.main" : "background.paper",
                                                color: isOwn ? "primary.contrastText" : "text.primary",
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Typography variant="body2">{message.message}</Typography>
                                        </Paper>
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {format(new Date(message.timestamp), "HH:mm")}
                                        </Typography>
                                    </Box>
                                </ListItem>
                                {index < messages.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}
                    {isTyping && (
                        <ListItem>
                            <Typography variant="caption" color="text.secondary" fontStyle="italic">
                                {recipientName} is typing...
                            </Typography>
                        </ListItem>
                    )}
                    <div ref={messagesEndRef} />
                </List>
            </Box>

            {/* Input */}
            <Box
                sx={{
                    p: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    gap: 1,
                    alignItems: "flex-end",
                }}
            >
                <IconButton size="small" color="primary">
                    <AttachFileIcon />
                </IconButton>
                <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="small"
                    disabled={!isConnected}
                />
                <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!inputMessage.trim() || !isConnected}
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
}




