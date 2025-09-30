import { InvoiceResponse } from "../types/invoice.types";
export function InvoiceValidator(data: InvoiceResponse): boolean {
  if (!data.vendor.name || !data.client?.name || !data.invoice_number) {
    return false;
  }
  return true;
}
