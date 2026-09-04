// Utility to track thermal receipt print counts per order

const STORAGE_KEY_PREFIX = 'receipt_print_count_';

export const getReceiptPrintCount = (orderNo: string): number => {
  if (!orderNo) return 0;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${orderNo}`);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const incrementReceiptPrintCount = (orderNo: string): number => {
  if (!orderNo) return 1;
  try {
    const current = getReceiptPrintCount(orderNo);
    const updated = current + 1;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${orderNo}`, updated.toString());
    return updated;
  } catch {
    return 1;
  }
};

export const setReceiptPrintCount = (orderNo: string, count: number): void => {
  if (!orderNo) return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${orderNo}`, count.toString());
  } catch {
    // ignore
  }
};
