import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChildSession } from "@/contexts/ChildSessionContext";
import { Loader2 } from "lucide-react";

const ChildLessons = () => {
  const navigate = useNavigate();
  const { isChildMode } = useChildSession();

  useEffect(() => {
    // Redirect to the student dashboard lessons tab
    if (isChildMode) {
      navigate("/student-dashboard", { replace: true });
    } else {
      navigate("/parent-dashboard", { replace: true });
    }
  }, [isChildMode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
};

export default ChildLessons;
