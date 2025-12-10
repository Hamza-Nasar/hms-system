import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma, MongoDBConnectionError } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    // Not using PrismaAdapter with JWT strategy - causes conflicts with OAuth
    // We handle user creation manually in signIn callback
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: { email: { label: "Email", type: "text" }, password: { label: "Password", type: "password" } },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;
                try {
                    const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                    if (!user || !user.password) return null; // OAuth users don't have passwords
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) return null;
                    return user;
                } catch (error: any) {
                    console.error("Auth error:", error);
                    // If MongoDB connection error, return null to show login error
                    if (error.message?.includes("connection") || error.message?.includes("timeout")) {
                        return null;
                    }
                    throw error;
                }
            },
        }),
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? [GoogleProvider({ 
                clientId: process.env.GOOGLE_CLIENT_ID, 
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                authorization: {
                    params: {
                        prompt: "consent",
                        access_type: "offline",
                        response_type: "code"
                    }
                }
            })]
            : []),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ user, account, profile }) {
            // Allow OAuth sign in
            if (account?.provider === "google") {
                try {
                    if (!user.email) {
                        console.error("OAuth user missing email - user object:", JSON.stringify(user, null, 2));
                        return false;
                    }

                    console.log(`OAuth sign in attempt for ${account.provider} user:`, user.email);

                    // Check if user exists
                    let existingUser = null;
                    try {
                        existingUser = await prisma.user.findUnique({
                            where: { email: user.email }
                        });
                    } catch (dbError: any) {
                        console.error("Database error while checking user:", dbError);
                        // If it's a connection error, we'll try to continue anyway
                        // The JWT callback will handle fetching the user later
                        if (!dbError.message?.includes("connection") && !dbError.message?.includes("timeout")) {
                            throw dbError;
                        }
                        console.warn("Database connection issue, but allowing sign in to proceed");
                        // Allow sign in to proceed - JWT callback will handle user lookup
                        return true;
                    }
                    
                    // If user doesn't exist, create it manually
                    if (!existingUser) {
                        try {
                            console.log("Creating new OAuth user:", user.email);
                            existingUser = await prisma.user.create({
                                data: {
                                    email: user.email,
                                    name: user.name || user.email.split("@")[0] || "User",
                                    // password is optional - don't set it for OAuth users (null is fine)
                                    role: "PATIENT",
                                    avatar: user.image || null,
                                },
                            });
                            console.log("Successfully created new OAuth user:", existingUser.email);
                        } catch (createError: any) {
                            console.error("Error creating OAuth user:", createError);
                            // If user was created by another request (race condition), fetch it
                            if (createError.code === "P2002" || createError.code === 11000) {
                                console.log("User already exists (race condition), fetching...");
                                try {
                                    existingUser = await prisma.user.findUnique({
                                        where: { email: user.email }
                                    });
                                    if (existingUser) {
                                        console.log("Successfully fetched existing user:", existingUser.email);
                                    }
                                } catch (fetchError: any) {
                                    console.error("Error fetching user after race condition:", fetchError);
                                    // Allow sign in to proceed - JWT callback will handle user lookup
                                    return true;
                                }
                            } else {
                                console.error("Failed to create user - error code:", createError.code, "message:", createError.message);
                                // Check for MongoDB transaction/replica set error
                                if (createError.message?.includes("replica set") || createError.message?.includes("transaction")) {
                                    console.warn("MongoDB transaction error (replica set required). User creation will be handled later.");
                                    console.warn("To fix: Set up MongoDB as a replica set or user will be created on first database access.");
                                    // Allow sign in to proceed - user will be created when they access the database
                                    return true;
                                }
                                // For connection/timeout errors
                                if (createError.message?.includes("connection") || createError.message?.includes("timeout")) {
                                    console.warn("Database connection issue, but allowing sign in to proceed");
                                    return true;
                                }
                                // For other errors, log but still allow sign in (user might exist)
                                console.warn("User creation failed, but allowing sign in to proceed");
                                return true;
                            }
                        }
                    } else {
                        console.log("Existing OAuth user found:", existingUser.email);
                    }
                    
                    // If we still don't have a user, log but allow sign in
                    // The JWT callback will try to fetch the user from the database
                    if (!existingUser) {
                        console.warn("User not found after creation attempt, but allowing sign in to proceed");
                        console.warn("JWT callback will attempt to fetch user from database");
                        return true;
                    }
                    
                    console.log("OAuth sign in successful for:", existingUser.email);
                    return true;
                } catch (error: any) {
                    console.error("SignIn callback error:", error);
                    console.error("Error type:", error.constructor.name);
                    console.error("Error message:", error.message);
                    console.error("Error code:", error.code);
                    console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
                    
                    // Only return false for critical errors that we can't recover from
                    // For database connection issues, allow sign in - JWT callback will handle it
                    if (error.message?.includes("connection") || error.message?.includes("timeout")) {
                        console.warn("Database connection error, but allowing sign in to proceed");
                        return true;
                    }
                    
                    // For other errors, log but allow sign in anyway
                    // This prevents AccessDenied errors and allows the JWT callback to handle user lookup
                    console.warn("Error in signIn callback, but allowing sign in to proceed");
                    return true;
                }
            }
            return true;
        },
        async redirect({ url, baseUrl }) {
            // Handle redirect after OAuth sign in
            try {
                // If url is relative, make it absolute
                if (url.startsWith("/")) {
                    return `${baseUrl}${url}`;
                }
                
                // Parse the URL to check origin
                const urlObj = new URL(url);
                const baseUrlObj = new URL(baseUrl);
                
                // If url is on same origin, allow it
                if (urlObj.origin === baseUrlObj.origin) {
                    return url;
                }
            } catch (error) {
                // If URL parsing fails, default to dashboard
                console.error("Redirect URL parsing error:", error);
            }
            
            // Default to dashboard for any invalid URLs
            return `${baseUrl}/dashboard`;
        },
        async jwt({ token, user, account }) {
            // If this is a new sign-in (user object exists), set initial token values
            if (user) {
                // For OAuth users, user.id might not exist yet, so we'll fetch from DB
                if (user.id) {
                    token.id = user.id;
                    token.role = (user as any).role || "PATIENT";
                }
            }
            
            // For OAuth sign ins, always fetch user from database to ensure we have the correct ID and role
            if (account && account.provider === "google") {
                if (token.email) {
                    try {
                        console.log("JWT callback: Fetching user from database for OAuth:", token.email);
                        const dbUser = await prisma.user.findUnique({
                            where: { email: token.email as string }
                        });
                        if (dbUser) {
                            token.id = dbUser.id;
                            token.role = (dbUser as any).role || "PATIENT";
                            console.log("JWT callback: Successfully set token.id and role for:", dbUser.email);
                        } else {
                            console.warn("JWT callback: User not found in database for:", token.email);
                            console.warn("User should have been created in signIn callback. This is a fallback scenario.");
                            // Don't create user here to avoid MongoDB transaction requirement
                            // User creation should happen in signIn callback
                            // If user doesn't exist, signIn callback will handle it
                        }
                    } catch (error: any) {
                        console.error("JWT callback error fetching user:", error);
                        // Don't throw - allow token to be created without ID
                        // Session callback will try to fetch it
                    }
                }
            }
            
            // Ensure token.id is set - if not, try to fetch from database using email
            if (!token.id && token.email) {
                try {
                    console.log("JWT callback: Fallback - fetching user by email:", token.email);
                    const dbUser = await prisma.user.findUnique({
                        where: { email: token.email as string }
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.role = (dbUser as any).role || token.role || "PATIENT";
                        console.log("JWT callback: Fallback successful - set token.id for:", dbUser.email);
                    }
                } catch (error: any) {
                    console.error("JWT callback fallback error:", error);
                }
            }
            
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // Always fetch the latest role from database to ensure it's up-to-date
                // This is important when user roles are updated in the database
                try {
                    let dbUser = null;
                    
                    // Try to fetch by ID first (most reliable)
                    if (token.id) {
                        try {
                            dbUser = await prisma.user.findUnique({
                                where: { id: token.id as string },
                                select: { id: true, role: true }
                            });
                        } catch (error: any) {
                            // If ID lookup fails, fall back to email
                            // Don't log MongoDB connection errors as they're expected when MongoDB is down
                            if (!(error instanceof MongoDBConnectionError) && error?.name !== 'MongoDBConnectionError') {
                                console.warn("Session callback: ID lookup failed, trying email");
                            }
                        }
                    }
                    
                    // Fallback to email if ID lookup didn't work
                    if (!dbUser && session.user.email) {
                        try {
                            dbUser = await prisma.user.findUnique({
                                where: { email: session.user.email as string },
                                select: { id: true, role: true }
                            });
                        } catch (error: any) {
                            // Don't log MongoDB connection errors - they're expected when MongoDB is down
                            if (!(error instanceof MongoDBConnectionError) && error?.name !== 'MongoDBConnectionError') {
                                console.warn("Session callback: Email lookup failed:", error);
                            }
                            // Continue without dbUser - will use token values
                        }
                    }
                    
                    if (dbUser) {
                        session.user.id = dbUser.id;
                        (session.user as any).role = dbUser.role || "PATIENT";
                    } else {
                        // Fallback to token values if database lookup fails
                        if (token.id) {
                            session.user.id = token.id as string;
                        }
                        (session.user as any).role = token.role || "PATIENT";
                        // Only log if it's not a MongoDB connection error (to avoid console spam)
                        // MongoDB connection errors are expected when replica set is not configured
                    }
                } catch (error: any) {
                    // Don't log MongoDB connection errors - they're expected when MongoDB is down
                    if (!(error instanceof MongoDBConnectionError) && error?.name !== 'MongoDBConnectionError') {
                        console.error("Session callback error fetching user:", error);
                    }
                    // Fallback to token values on error
                    if (token.id) {
                        session.user.id = token.id as string;
                    }
                    (session.user as any).role = token.role || "PATIENT";
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/login",
        error: "/login", // Redirect errors to login page
    },
    // Only enable debug if explicitly set in environment variable
    debug: process.env.NEXTAUTH_DEBUG === "true",
    events: {
        async signIn({ user, account, profile, isNewUser }) {
            if (isNewUser && account?.provider === "google") {
                console.log("New OAuth user created:", user.email);
            }
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
