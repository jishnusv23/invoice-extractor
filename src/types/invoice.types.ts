export interface Vendor {
  name: string;
  address: string;
  taxId?: string;
  iban?: string;
}

export interface Client {
  name: string;
  address: string;
  taxId?: string;
}

export interface Totals {
  net_worth: number;
  vat: number;
  grand_total: number;
}

export interface LineItem {
  description: string;
  quantity: number;
  unity_of_measure: string;
  unit_price: number;
  net_worth: number;
  vat_percent: number;
  line_total: number;
}

export interface InvoiceResponse {
  vendor: Vendor;
  client: Client;
  invoice_number: string;
  invoice_date: string;
  totals:Totals
  line_item:LineItem[]
}
