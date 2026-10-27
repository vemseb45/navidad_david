import { getSessionUser } from '@/backend/shared/get-session-user';
import { getAdminInitialData } from '@/backend/modules/analytics/admin-loader';
import { AdminDashboardView } from '@/frontend/modules/admin/AdminDashboardView';

export const instant = false;

export default async function AdminPage() {
  const sessionUser = await getSessionUser();
  const { metrics, customers, sections, users } = await getAdminInitialData();

  return (
    <AdminDashboardView
      initialTab="inicio"
      initialMetrics={metrics}
      initialCustomers={customers}
      initialSections={sections}
      initialUsers={users}
      serverSessionUser={sessionUser}
    />
  );
}
