import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CreateForm from "./pages/CreateForm";
import EditForm from "./pages/EditForm";
import AllForms from "./pages/AllForms";
import Settings from "./pages/Settings";
import PublicForm from "./pages/PublicFormSimple";
import IdentityCollisionForm from "./pages/IdentityCollisionForm";
import FormAnalytics from "./pages/FormAnalytics";
import Users from "./pages/Users";
import ReportViewer from "./pages/ReportViewer";
import TestReportDisplay from "./pages/TestReportDisplay";
import TestReport from "./pages/TestReport";
import VideoTutorialProcessor from "./pages/VideoTutorialProcessor";
import FileUploadTest from "./components/FileUploadTest";
import ThemeDemo from "./pages/ThemeDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/redefinir-senha" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/criar-formulario" element={<CreateForm />} />
            <Route path="/formulario/:formId/editar" element={<EditForm />} />
            <Route path="/todos-formularios" element={<AllForms />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/f/:formId" element={<PublicForm />} />
            <Route path="/identity-collision/:formId" element={<IdentityCollisionForm />} />
            <Route path="/formulario/:formId/relatorios" element={<FormAnalytics />} />
            <Route path="/report/:reportId" element={<ReportViewer />} />
            <Route path="/test-report" element={<TestReportDisplay />} />
            <Route path="/video-tutorial-processor" element={<VideoTutorialProcessor />} />
            <Route path="/file-upload-test" element={<FileUploadTest />} />
            <Route path="/theme-demo" element={<ThemeDemo />} />
            {/* Redirect old routes */}
            <Route path="/meus-formularios" element={<Navigate to="/dashboard" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
