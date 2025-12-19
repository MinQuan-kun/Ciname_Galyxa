import "./globals.css";
import ToastProvider from '@/components/ToastProvider';

export const metadata = {
  title: "Ciname Galyxa",
  description: "Rạp chiếu phim bất ổn nhất hệ mặt trời",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}

        {/* Chỉ cần đặt component này vào là xong */}
        <ToastProvider />

      </body>
    </html>
  );
}