import "./globals.css";
import { Providers } from "@/components/Providers";
import PWARegister from "@/components/PWARegister";

export const metadata = {
  title: "Quỹ Lớp Học ",
  description: "He thong quan ly tien quy lop hoc ",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Quy Lop Hoc" },
  icons: { apple: "/icon.svg" }
};

export const viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 min-h-screen">
        <Providers>
          <PWARegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
