import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/backend/shared/get-session-user';
import { getAdminInitialData } from '@/backend/modules/analytics/admin-loader';
import { AdminDashboardView } from '@/frontend/modules/admin/AdminDashboardView';
import { AdminTab } from '@/frontend/modules/admin/components/AdminSidebar';

export const instant = false;

const VALID_TABS: AdminTab[] = [
  'inicio',
  'pedidos',
  'productos',
  'secciones',
  'clientes',
  'usuarios',
];

interface AdminTabPageProps {
  params: Promise<{ tab: string }>;
}

export default async function AdminTabPage({ params }: AdminTabPageProps) {
  const { tab } = await params;

  // Validación de endpoint válido
  if (!VALID_TABS.includes(tab as AdminTab)) {
    notFound();
  }

  // Redirección de inicio a la raíz de /admin
  if (tab === 'inicio') {
    redirect('/admin');
  }

  const sessionUser = await getSessionUser();
  const { metrics, customers, sections, users } = await getAdminInitialData();

  return (
    <AdminDashboardView
      initialTab={tab as AdminTab}
      initialMetrics={metrics}
      initialCustomers={customers}
      initialSections={sections}
      initialUsers={users}
      serverSessionUser={sessionUser}
    />
  );
}
