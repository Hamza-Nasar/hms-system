import { getSessionWithUser } from "@/lib/get-session";
import { redirect } from "next/navigation";
import AIChatAssistant from "@/components/AIChatAssistant";

export default async function AIAssistantPage() {
    const session = await getSessionWithUser();
    
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="space-y-6 p-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    AI Assistant 🤖
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-base">
                    Get help with appointments, medical information, and general questions
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                <AIChatAssistant />
            </div>

            <div className="max-w-4xl mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-sm mb-2 text-blue-900 dark:text-blue-100">
                    💡 What can AI Assistant help with?
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li><strong>General Mode:</strong> System navigation, basic questions, general help</li>
                    <li><strong>Medical Mode:</strong> Health information, symptom analysis (non-diagnostic), medication info</li>
                    <li><strong>Appointment Mode:</strong> Scheduling questions, availability, appointment management</li>
                </ul>
                <p className="text-xs mt-3 text-blue-700 dark:text-blue-300">
                    ⚠️ <strong>Important:</strong> AI Assistant provides general information only. 
                    Always consult with a qualified healthcare provider for medical diagnosis and treatment.
                </p>
            </div>
        </div>
    );
}







