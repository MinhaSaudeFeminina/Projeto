import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminLayout } from "@/components/layout/AdminLayout";
import DashboardPage from "@/pages/DashboardPage";
import ContentsPage from "@/pages/ContentsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import LifeStagesPage from "@/pages/LifeStagesPage";
import SymptomsPage from "@/pages/SymptomsPage";
import RemindersPage from "@/pages/RemindersPage";
import QuestionsPage from "@/pages/QuestionsPage";
import AppUsersPage from "@/pages/AppUsersPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SupportPage from "@/pages/SupportPage";
import ReportsPage from "@/pages/ReportsPage";
import PanelUsersPage from "@/pages/PanelUsersPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/NotFound";
import LoginPage from "@/pages/LoginPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/conteudos" element={<ContentsPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/trilhas" element={<LifeStagesPage />} />
            <Route path="/sintomas" element={<SymptomsPage />} />
            <Route path="/lembretes" element={<RemindersPage />} />
            <Route path="/perguntas" element={<QuestionsPage />} />
            <Route path="/usuarias" element={<AppUsersPage />} />
            <Route path="/notificacoes" element={<NotificationsPage />} />
            <Route path="/apoio" element={<SupportPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/usuarios-painel" element={<PanelUsersPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
