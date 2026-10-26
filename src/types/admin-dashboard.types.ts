export type DeliveryMethodType = 'HOME_DELIVERY' | 'PICKUP_IN_STORE';
export type PaymentStatusType = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DashboardMetricOverview {
  seasonTotalCOP: number;
  todaySalesCOP: number;
  dailyGoalCOP: number;
  goalPercentage: number;
  totalTreesSold: number;
  totalTreeStock: number;
  criticalStockCount: number;
  activeOrdersToday: number;
  ordersForDispatch: number;
  ordersForPickup: number;
}

export interface TreeStockDemandItem {
  id: string;
  name: string;
  heightVariant: string;
  unitsSold: number;
  priceCOP: number;
  stockRemaining: number;
  burnRatePerDay: number;
  status: 'OPTIMAL' | 'LOW_STOCK' | 'CRITICAL' | 'OUT_OF_STOCK';
}

export interface RecentOrderNotification {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmountCOP: number;
  itemsSummary: string;
  deliveryMethod: DeliveryMethodType;
  paymentMethod: 'PSE' | 'CREDIT_CARD' | 'DEBIT_CARD';
  createdAt: string;
}

export interface CategoryMixItem {
  key: string;
  label: string;
  percentage: number;
  amountCOP: number;
  colorClass: string;
  hex: string;
}

export interface WeeklySalesPoint {
  weekLabel: string;
  amountMillionsCOP: number;
}
