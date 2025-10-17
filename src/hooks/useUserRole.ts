import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      setRoles(data?.map(r => r.role) || []);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: string) => roles.includes(role);
  const isAdmin = hasRole("admin");
  const isParent = hasRole("parent");
  const isTutor = hasRole("tutor");
  const isStudent = hasRole("student");

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isParent,
    isTutor,
    isStudent,
    refetch: fetchUserRoles
  };
}
