import { NextRequest } from 'next/server';
import { AnalyticsController } from '@/backend/modules/analytics/analytics.controller';

const controller = new AnalyticsController();

export async function GET(req: NextRequest) {
  return controller.getDashboardStats(req);
}
