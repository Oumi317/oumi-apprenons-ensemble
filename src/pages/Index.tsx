import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./Home";

const Index = () => {
  const navigate = useNavigate();

  // Redirect to /home if needed, or just render Home component
  // For now, we'll just render the Home component directly
  return <Home />;
};

export default Index;
