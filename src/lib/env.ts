// Environment variable validation
export function validateEnv() {
    const required = [
        "DATABASE_URL",
        "NEXTAUTH_SECRET",
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`
        );
    }

    // Optional but recommended
    const optional = [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
    ];

    const missingOptional = optional.filter(key => !process.env[key]);
    if (missingOptional.length > 0 && process.env.NODE_ENV === "production") {
        console.warn(
            `Missing optional environment variables in production: ${missingOptional.join(", ")}`
        );
    }
}

// Call validation on module load (only in production)
if (process.env.NODE_ENV === "production") {
    try {
        validateEnv();
    } catch (error) {
        console.error("Environment validation failed:", error);
    }
}





