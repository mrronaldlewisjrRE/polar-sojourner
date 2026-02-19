import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Debug() {
    const [debug, setDebug] = useState("Loading...");

    useEffect(() => {
        async function runDebug() {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setDebug("NO USER LOGGED IN");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                setDebug("PROFILE ERROR: " + JSON.stringify(error, null, 2));
                return;
            }

            setDebug(JSON.stringify({
                user_id: user.id,
                profile: data
            }, null, 2));
        }

        runDebug();
    }, []);

    return (
        <div className="p-10 bg-gray-900 min-h-screen text-white font-mono">
            <h1 className="text-2xl font-bold mb-4">DEBUG OUTPUT</h1>
            <pre className="bg-gray-800 p-6 rounded-lg overflow-auto border border-gray-700">
                {debug}
            </pre>
        </div>
    );
}
