import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Tổng quan</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Tổng số phim</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">24</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Doanh thu hôm nay</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">5.2tr</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Vé đã đặt</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">156</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <h3 className="text-gray-500 text-sm font-medium">Người dùng mới</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">12</p>
        </div>
      </div>

      {/* Placeholder nội dung */}
      <div className="bg-white p-6 rounded-lg shadow-md h-96">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Biểu đồ doanh thu (Coming Soon)</h3>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
            Chart Area
        </div>
      </div>
    </div>
  );
}