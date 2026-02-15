
export interface Product {
  id: string;
  name: string;
  price: number;
  dateAdded: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bankAccount: string;
  dateAdded: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
}

export interface BillItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  amount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  clientId: string;
  clientName: string;
  items: BillItem[];
  subTotal: number;
  cgst: number;
  sgst: number;
  totalAmount: number;
  watermark: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalClients: number;
  totalBills: number;
  totalRevenue: number;
}
