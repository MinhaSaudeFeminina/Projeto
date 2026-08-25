import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { AdminLayout } from "@/components/layout/AdminLayout";
import AdminNotificationsPage from "@/pages/AdminNotificationsPage";
import { listAdminNotifications, markAdminNotificationRead } from "@/services/api/notificationApi";

vi.mock("@/services/api/notificationApi", () => ({
  listAdminNotifications: vi.fn(),
  markAdminNotificationRead: vi.fn(),
}));

const notifications = [
  {
    id: 2,
    recipient_id: 7,
    content_id: 10,
    type: "adjustments_requested",
    title: "Ajustes solicitados no conteúdo",
    message: "Revise a orientação sobre prevenção e saúde íntima no portal.",
    action_url: "/conteudos/10",
    read_at: null,
    email_sent_at: "2026-08-24T14:00:00.000Z",
    email_failed_at: null,
    created_at: "2026-08-24T14:00:00.000Z",
  },
  {
    id: 1,
    recipient_id: 7,
    content_id: 9,
    type: "published",
    title: "Conteúdo publicado",
    message: "O conteúdo foi publicado no portal administrativo.",
    action_url: "/conteudos/9",
    read_at: null,
    email_sent_at: "2026-08-24T13:00:00.000Z",
    email_failed_at: null,
    created_at: "2026-08-24T13:00:00.000Z",
  },
];

test("exibe notificações administrativas, contador e marca uma notificação como lida", async () => {
  vi.mocked(listAdminNotifications).mockResolvedValue({ data: notifications, meta: { unread_count: 2 } });
  vi.mocked(markAdminNotificationRead).mockResolvedValue();

  render(
    <MemoryRouter initialEntries={["/notificacoes"]}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/notificacoes" element={<AdminNotificationsPage />} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );

  expect(await screen.findByRole("heading", { name: "Notificações administrativas" })).toBeInTheDocument();
  expect(screen.getByText("Ajustes solicitados no conteúdo")).toBeInTheDocument();
  expect(screen.getByText("Revise a orientação sobre prevenção e saúde íntima no portal.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Notificações: 2 não lidas" })).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole("button", { name: "Marcar como lida" })[0]);

  await waitFor(() => expect(markAdminNotificationRead).toHaveBeenCalledWith(2));
  expect(screen.getByRole("link", { name: "Notificações: 1 não lida" })).toBeInTheDocument();
});
