export const fmtMoney = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n) || 0) + " đ";

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export const statusLabel = {
  unpaid: { text: "Chưa nộp", cls: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300" },
  pending: { text: "Chờ duyệt", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  approved: { text: "Đã nộp", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  rejected: { text: "Từ chối", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" }
};
