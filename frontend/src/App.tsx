import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/layout/AdminLayout";
import DashboardPage from "@/pages/DashboardPage";
import ContentListPage from "@/pages/ContentListPage";
import ContentEditorPage from "@/pages/ContentEditorPage";
import ContentAuditPage from "@/pages/ContentAuditPage";
import ReviewQueuePage from "@/pages/ReviewQueuePage";
import CategoriesPage from "@/pages/CategoriesPage";
import LifeStagesPage from "@/pages/LifeStagesPage";
import SymptomsPage from "@/pages/SymptomsPage";
import RemindersPage from "@/pages/RemindersPage";
import QuestionsPage from "@/pages/QuestionsPage";
import AppUsersPage from "@/pages/AppUsersPage";
import AdminNotificationsPage from "@/pages/AdminNotificationsPage";
import SupportPage from "@/pages/SupportPage";
import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminUserFormPage from "@/pages/AdminUserFormPage";
import AdminUserListPage from "@/pages/AdminUserListPage";
import { AdminRoutes } from "@/routes/AdminRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoutes />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/conteudos" element={<ContentListPage />} />
              <Route path="/conteudos/novo" element={<ContentEditorPage />} />
              <Route path="/conteudos/:id" element={<ContentEditorPage />} />
              <Route path="/conteudos/:id/auditoria" element={<ContentAuditPage />} />
              <Route path="/categorias" element={<CategoriesPage />} />
              <Route path="/trilhas" element={<LifeStagesPage />} />
              <Route path="/sintomas" element={<SymptomsPage />} />
              <Route path="/lembretes" element={<RemindersPage />} />
              <Route path="/perguntas" element={<QuestionsPage />} />
              <Route path="/usuarias" element={<AppUsersPage />} />
              <Route path="/notificacoes" element={<AdminNotificationsPage />} />
              <Route path="/apoio" element={<SupportPage />} />
              <Route path="/relatorios" element={<ReportsPage />} />
              <Route path="/configuracoes" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route element={<AdminRoutes requiredRoles={["reviewer_professor", "admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/revisoes" element={<ReviewQueuePage />} />
            </Route>
          </Route>
          <Route element={<AdminRoutes requiredRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/usuarios-painel" element={<AdminUserListPage />} />
              <Route path="/usuarios-painel/nova" element={<AdminUserFormPage />} />
              <Route path="/usuarios-painel/:id" element={<AdminUserFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
