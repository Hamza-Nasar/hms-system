import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { message, conversationHistory = [], mode = "general" } = await req.json();

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { 
                    error: "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.",
                    code: "API_KEY_MISSING"
                },
                { status: 500 }
            );
        }

        // Initialize OpenAI client at runtime (not at build time)
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // Build system prompt based on mode and user role
        const userRole = (session.user as any)?.role || "PATIENT";
        let systemPrompt = "";

        switch (mode) {
            case "medical":
                systemPrompt = `You are a helpful medical assistant in a hospital management system. 
                You can help with:
                - General health information and guidance
                - Symptom analysis (non-diagnostic)
                - Appointment scheduling questions
                - Medical record explanations
                - Medication information
                
                IMPORTANT: You are NOT a replacement for professional medical advice. 
                Always recommend consulting with a qualified healthcare provider for diagnosis and treatment.
                
                User role: ${userRole}
                Be professional, empathetic, and clear in your responses.`;
                break;
            
            case "appointment":
                systemPrompt = `You are an appointment scheduling assistant for a hospital management system.
                Help users with:
                - Finding available appointment slots
                - Understanding appointment procedures
                - Rescheduling appointments
                - Appointment reminders
                - Doctor availability questions
                
                User role: ${userRole}`;
                break;
            
            default:
                systemPrompt = `You are a helpful AI assistant for a hospital management system.
                Help users with general questions about the system, navigation, and basic inquiries.
                
                User role: ${userRole}
                Be friendly, professional, and concise.`;
        }

        // Build conversation history for context
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: systemPrompt,
            },
            ...conversationHistory.slice(-10).map((msg: any) => ({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
            })),
            {
                role: "user",
                content: message,
            },
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 500,
        });

        const aiResponse = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";

        return NextResponse.json({
            response: aiResponse,
            usage: completion.usage,
        });

    } catch (error: any) {
        console.error("OpenAI API error:", error);

        // Handle specific OpenAI errors
        if (error instanceof OpenAI.APIError) {
            return NextResponse.json(
                {
                    error: error.message,
                    code: error.code || "OPENAI_ERROR",
                    status: error.status,
                },
                { status: error.status || 500 }
            );
        }

        return NextResponse.json(
            {
                error: error.message || "Failed to get AI response",
                code: "UNKNOWN_ERROR",
            },
            { status: 500 }
        );
    }
}







