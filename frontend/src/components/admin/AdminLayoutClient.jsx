'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminLayoutClient({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white relative">
      {/* Sidebar truyền trạng thái vào */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* MAIN CONTENT 
         - Logic canh lề:
           + Khi MỞ (isSidebarOpen = true): ml-60 (đẩy sang phải né sidebar), padding mặc định (p-8)
           + Khi ĐÓNG (isSidebarOpen = false): ml-0, NHƯNG thêm pl-20 (padding-left lớn) để tiêu đề né nút 3 gạch
      */}
      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen
          ${isSidebarOpen 
            ? 'ml-60 p-8'        // Khi mở: Cách lề trái 60 unit, padding đều 4 phía
            : 'ml-0 pl-20 pr-8 py-8' // Khi đóng: padding trái 20 (80px) để né nút, các chiều khác giữ nguyên
          }
        `}
      >
        {/* NÚT 3 GẠCH (HAMBURGER) - CHỈ HIỆN KHI MENU ĐÓNG */}
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            // Đã bỏ bg-blue-600, shadow-lg. Thêm text-slate-400 và scale nhẹ khi hover
            className="fixed top-6 left-6 z-40 p-1 text-slate-400 hover:text-white hover:scale-110 transition-all bg-transparent"
            title="Mở menu"
          >
            {/* Tăng kích thước icon lên một chút (w-7 h-7) cho dễ bấm vì không còn nền */}
            <svg className="w-8 h-8 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {children}
      </main>
    </div>
  );
}