import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import ParentDashboard from "./pages/ParentDashboard";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import InteractiveResource from "./pages/InteractiveResource";
import StudentProgress from "./pages/StudentProgress";
import Tutors from "./pages/Tutors";
import TutorProfile from "./pages/TutorProfile";
import TutorSignup from "./pages/TutorSignup";
import TutorDashboard from "./pages/TutorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FAQ from "./pages/FAQ";
import Messages from "./pages/Messages";
import VideoSession from "./pages/VideoSession";
import Payment from "./pages/Payment";
import AITutor from "./pages/AITutor";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="oumi-school-theme" attribute="class">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/lessons/:id" element={<LessonDetail />} />
            <Route path="/interactive/:id" element={<InteractiveResource />} />
            <Route path="/tutors" element={<Tutors />} />
              <Route path="/tutors/:id" element={<TutorProfile />} />
              <Route path="/tutor-signup" element={<TutorSignup />} />
            <Route path="/faq" element={<FAQ />} />
            <Route 
              path="/dashboard/parent" 
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/parent-dashboard" 
              element={
                <ProtectedRoute requiredRole="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/tutor" 
              element={
                <ProtectedRoute requiredRole="tutor">
                  <TutorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/students/:studentId/progress" 
              element={
                <ProtectedRoute requiredRole="parent">
                  <StudentProgress />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/video-session/:sessionId" 
              element={
                <ProtectedRoute>
                  <VideoSession />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment" 
              element={
                <ProtectedRoute>
                  <Payment />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ai-tutor/:studentId" 
              element={
                <ProtectedRoute>
                  <AITutor />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
