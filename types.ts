
export interface Product {
  id: string;
  name: string;
  price: number;
  dateAdded: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  bankAccount?: string;
  gst?: string;
  fssai?: string;
  dateAdded: string;
  gstin?: string;      
  fssaino?: string;
}

export interface BankDetails {
  id?: string;
  businessName: string;
  address: string;
  fssaiNo: string;
  gstin: string;
  phone: string;
  email: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  panNo: string;
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
  place: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  items: BillItem[];
  subTotal: number;
  cgstRate: number;
  sgstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
}
