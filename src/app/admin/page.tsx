import { getSessionUser } from '@/backend/shared/get-session-user';
import { getAdminInitialData, getEmptyAdminMetrics } from '@/backend/modules/analytics/admin-loader';
import { AdminDashboardView } from '@/frontend/modules/admin/AdminDashboardView';

export const instant = false;

export default async function AdminPage() {
  const sessionUser = await getSessionUser();

  // Si no hay sesión válida o expiró tras 1 hora, no cargar datos sensibles en el HTML
  const initialData = sessionUser
    ? await getAdminInitialData()
    : {
        metrics: getEmptyAdminMetrics(),
        customers: [],
        sections: [],
        users: [],
      };

  return (
    <AdminDashboardView
      initialTab="inicio"
      initialMetrics={initialData.metrics}
      initialCustomers={initialData.customers}
      initialSections={initialData.sections}
      initialUsers={initialData.users}
      serverSessionUser={sessionUser}
    />
  );
}
