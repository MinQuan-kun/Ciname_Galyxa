'use client';

import React, { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { 
  FaFilm, FaUsers, FaTicketAlt, FaMoneyBillWave, 
  FaArrowUp, FaArrowDown, FaCalendarCheck 
} from 'react-icons/fa';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

// --- COMPONENT CON: THẺ THỐNG KÊ ---
const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
  <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-xl hover:bg-slate-800 transition-all group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-lg group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 text-sm">
      <span className={`${trend === 'up' ? 'text-green-400' : 'text-red-400'} flex items-center font-bold bg-white/5 px-2 py-0.5 rounded`}>
        {trend === 'up' ? <FaArrowUp size={10} className="mr-1"/> : <FaArrowDown size={10} className="mr-1"/>}
        {trendValue}
      </span>
      <span className="text-slate-500">so với tháng trước</span>
    </div>
  </div>
);

// --- DỮ LIỆU BIỂU ĐỒ GIẢ LẬP (MOCK DATA) ---
const REVENUE_DATA = [
  { name: 'T2', revenue: 4000 },
  { name: 'T3', revenue: 3000 },
  { name: 'T4', revenue: 2000 },
  { name: 'T5', revenue: 2780 },
  { name: 'T6', revenue: 1890 },
  { name: 'T7', revenue: 6390 },
  { name: 'CN', revenue: 8490 },
];

const GENRE_DATA = [
  { name: 'Hành động', value: 400 },
  { name: 'Tình cảm', value: 300 },
  { name: 'Hoạt hình', value: 300 },
  { name: 'Kinh dị', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// --- TRANG CHÍNH ---
const DashboardPage = () => {
  const [totalMovies, setTotalMovies] = useState(0);
  const [recentMovies, setRecentMovies] = useState([]);

  // Lấy dữ liệu thật từ API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resMovies = await axiosClient.get('/movies');
        setTotalMovies(resMovies.data.length);
        // Lấy 5 phim mới nhất
        setRecentMovies(resMovies.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5));
      } catch (error) {
        console.error("Lỗi tải dashboard:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      
      {/* 1. Header Chào Mừng */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Tổng quan tình hình kinh doanh hôm nay</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-white font-bold text-lg">{new Date().toLocaleDateString('vi-VN')}</p>
          <p className="text-slate-500 text-sm">Hệ thống hoạt động ổn định</p>
        </div>
      </div>

      {/* 2. Các thẻ thống kê (Stats Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng Doanh Thu" 
          value="125.0M ₫" 
          icon={<FaMoneyBillWave size={24} />} 
          color="bg-green-500"
          trend="up" trendValue="+12.5%"
        />
        <StatCard 
          title="Vé Đã Bán" 
          value="1,234" 
          icon={<FaTicketAlt size={24} />} 
          color="bg-purple-500"
          trend="up" trendValue="+8.2%"
        />
        <StatCard 
          title="Tổng Phim" 
          value={totalMovies} // Dữ liệu thật
          icon={<FaFilm size={24} />} 
          color="bg-blue-500"
          trend="up" trendValue="+2 phim mới"
        />
        <StatCard 
          title="Khách Hàng" 
          value="856" 
          icon={<FaUsers size={24} />} 
          color="bg-pink-500"
          trend="down" trendValue="-1.5%"
        />
      </div>

      {/* 3. Khu vực Biểu đồ (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Biểu đồ Doanh thu (Chiếm 2 phần) */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FaMoneyBillWave className="text-green-400"/> Biểu đồ doanh thu tuần này
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ Thể loại (Chiếm 1 phần) */}
        <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Thị hiếu khán giả</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GENRE_DATA}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {GENRE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Chú thích biểu đồ tròn */}
            <div className="flex justify-center gap-4 mt-4 text-xs text-slate-400">
               {GENRE_DATA.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                     {entry.name}
                  </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Danh sách phim mới nhất */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
             <FaCalendarCheck className="text-blue-400"/> Phim mới cập nhật
           </h3>
           <button className="text-sm text-blue-400 hover:text-blue-300 font-bold hover:underline">Xem tất cả</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-700/50 text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-l-lg">Phim</th>
                <th className="px-4 py-3">Ngày chiếu</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 rounded-r-lg text-right">Giá vé cơ bản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {recentMovies.map((movie) => (
                <tr key={movie._id} className="hover:bg-slate-700/30 transition">
                  <td className="px-4 py-4 flex items-center gap-3">
                    <img src={movie.poster} alt="" className="w-10 h-14 object-cover rounded-md shadow-sm" />
                    <span className="font-bold text-white">{movie.title}</span>
                  </td>
                  <td className="px-4 py-4">
                    {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${movie.status === 'Đang chiếu' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-white">45.000 ₫</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;