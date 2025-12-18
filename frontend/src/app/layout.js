import "./globals.css";

export const metadata = {
  title: "Ciname Galyxa",
  description: "Rạp chiếu phim bất ổn nhất hệ mặt trời",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}