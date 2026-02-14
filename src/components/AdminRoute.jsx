import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2 } from "lucide-react";

export default function AdminRoute() {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Special bootstrap Override
            if (user.email === 'ronald@cdhassociates.com') {
                setRole('admin');
                setLoading(false);
                return; // Skip DB check for bootstrap user
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error fetching role:", error);
            }

            setRole(data?.role);
            setLoading(false);
        }
        getRole();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-cdh-red" size={40} />
            </div>
        );
    }

    return role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
