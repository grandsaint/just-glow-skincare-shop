/** Format a whole-naira amount, e.g. 25000 -> "₦25,000". */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}
