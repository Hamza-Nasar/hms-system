// Local email service - logs to console only (no external email sending)
// For development/testing purposes

export interface EmailParams {
    to: string;
    subject: string;
    html: string;
    text?: string;
    toName?: string;
    resetLink?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
    try {
        console.log("\n" + "=".repeat(60));
        console.log("📧 PASSWORD RESET EMAIL (Local Development)");
        console.log("=".repeat(60));
        console.log("To:", params.to);
        console.log("To Name:", params.toName || params.to.split("@")[0]);
        console.log("Subject:", params.subject);
        console.log("\n🔗 RESET PASSWORD LINK:");
        console.log(params.resetLink || "No reset link provided");
        console.log("\n" + "-".repeat(60));
        console.log("📝 Email Content:");
        console.log(params.text || "No text content");
        console.log("=".repeat(60) + "\n");

        // Always return true - email is "sent" (logged to console)
        return true;
    } catch (error: any) {
        console.error("❌ Error logging email:", error);
        return false;
    }
}
