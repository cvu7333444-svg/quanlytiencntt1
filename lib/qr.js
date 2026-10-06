// Tao link anh QR VietQR (API cong khai, khong can thu vien)
export function generateVietQrUrl({ bankBin, accountNo, accountName, amount, addInfo }) {
  const params = new URLSearchParams({
    accountName: accountName || "QUY LOP",
    addInfo: addInfo || "dong tien quy lop"
  });
  if (amount) params.set("amount", String(amount));
  return `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?${params.toString()}`;
}
