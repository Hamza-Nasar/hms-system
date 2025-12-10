"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DatabaseError() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
            <div className="text-center space-y-4 max-w-md">
                <AlertCircle className="w-16 h-16 text-red-600 mx-auto" />
                <h1 className="text-3xl font-bold text-red-600">Database Connection Error</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300">
                    MongoDB connection failed. This is usually because replica set is not configured.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
                    <h2 className="font-semibold mb-2">Quick Fix - Replica Set Setup:</h2>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>
                            <strong>Stop MongoDB</strong> (as Administrator):
                            <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 text-xs">Stop-Service MongoDB</code>
                        </li>
                        <li>
                            <strong>Edit config file</strong>: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">C:\Program Files\MongoDB\Server\6.0\bin\mongod.cfg</code>
                            <br />Add these lines:
                            <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 text-xs">
                                replication:<br />
                                &nbsp;&nbsp;replSetName: &quot;rs0&quot;
                            </code>
                        </li>
                        <li>
                            <strong>Start MongoDB</strong>:
                            <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 text-xs">Start-Service MongoDB</code>
                        </li>
                        <li>
                            <strong>Initialize replica set</strong>:
                            <code className="block bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-1 text-xs">node init-replica-set.js</code>
                        </li>
                    </ol>
                    <p className="mt-3 text-sm font-semibold">For detailed instructions, see: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">FIX_MONGODB_REPLICA_SET.md</code></p>
                </div>
                <Button
                    onClick={() => window.location.reload()}
                    className="mt-4"
                >
                    Retry After Starting MongoDB
                </Button>
            </div>
        </div>
    );
}



