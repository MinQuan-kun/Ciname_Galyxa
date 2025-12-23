'use client';

import React, { useEffect, useState } from 'react';
import axiosClient from '@/api/axios';
import { 
  FaFilm, FaUsers, FaTicketAlt, FaMoneyBillWave, 
  FaArrowUp, FaChartLine, FaFileExcel 
} from 'react-icons/fa';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import * as XLSX from 'xlsx';

// --- COMPONENT CON: THẺ THỐNG KÊ ---
const StatCard = ({ title, value, icon, color, subTitle }) => (
  <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-slate-800 transition-all duration-300 group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-2 group-hover:scale-105 transition-transform origin-left">
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-20 text-white shadow-lg group-hover:rotate-12 transition-transform`}>
        {icon}
      </div>
    </div>
    {subTitle && (
      <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium">
         {subTitle}
      </div>
    )}
  </div>
);

const AdminDashboard = () => {
  // State dữ liệu
  const [summary, setSummary] = useState({ revenue: 0, tickets: 0, totalMovies: 0, totalUsers: 0 });
  const [chartData, setChartData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  
  // State điều khiển
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // Mặc định: 7 ngày

  // 1. Fetch dữ liệu tổng quan & top phim (chỉ chạy 1 lần)
  useEffect(() => {
    const fetchGeneralStats = async () => {
        try {
            const [resSum, resTop] = await Promise.all([
                axiosClient.get('/stats/summary'),
                axiosClient.get('/stats/top-movies')
            ]);
            setSummary(resSum.data);
            setTopMovies(resTop.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi tải thống kê chung:", error);
            setLoading(false);
        }
    };
    fetchGeneralStats();
  }, []);

  // 2. Fetch biểu đồ (chạy lại mỗi khi timeRange thay đổi)
  useEffect(() => {
    const fetchChart = async () => {
        try {
            // Gọi API với tham số range
            const res = await axiosClient.get(`/stats/revenue-chart?range=${timeRange}`);
            
            // Format dữ liệu cho Recharts
            const formattedData = res.data.map(item => ({
                name: item._id, // Giờ (14:00) hoặc Ngày (2023-10-25)
                revenue: item.totalRevenue
            }));
            
            setChartData(formattedData);
        } catch (error) {
            console.error("Lỗi tải biểu đồ:", error);
        }
    };

    fetchChart();
  }, [timeRange]); // <--- Phụ thuộc vào timeRange

  // Xuất Excel
  const handleExportExcel = () => {
    if(topMovies.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(topMovies.map(item => ({
        "Tên Phim": item._id,
        "Số Vé Bán": item.ticketsSold,
        "Doanh Thu": item.totalRevenue
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top_Phim");
    XLSX.writeFile(workbook, `Bao_Cao_Doanh_Thu.xlsx`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Đang tải...</div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600">
            Thống kê doanh thu
          </h1>
        </div>
      </div>

      {/* Cards Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Doanh Thu" 
          value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.revenue)} 
          icon={<FaMoneyBillWave size={24} />} 
          color="bg-green-500"
        />
        <StatCard 
          title="Vé Đã Bán" 
          value={summary.tickets} 
          icon={<FaTicketAlt size={24} />} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Phim Đang Chiếu" 
          value={summary.totalMovies} 
          icon={<FaFilm size={24} />} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Khách Hàng" 
          value={summary.totalUsers} 
          icon={<FaUsers size={24} />} 
          color="bg-pink-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BIỂU ĐỒ DOANH THU */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl shadow-xl">
          {/* Header Biểu đồ + Dropdown lọc */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaChartLine className="text-orange-400"/> Biểu Đồ Doanh Thu
            </h3>
            
            {/* DROPDOWN CHỌN NGÀY */}
            <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-slate-900 border border-slate-600 text-white text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500 block p-2 outline-none"
            >
                <option value="day">Hôm nay (Theo giờ)</option>
                <option value="week">7 ngày qua</option>
                <option value="month">30 ngày qua</option>
            </select>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <YAxis 
                    stroke="#94a3b8" 
                    tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                  formatter={(value) => new Intl.NumberFormat('vi-VN').format(value) + ' đ'}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#f97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {chartData.length === 0 && (
                <div className="text-center text-slate-500 text-sm mt-2">Chưa có dữ liệu doanh thu trong khoảng thời gian này.</div>
            )}
          </div>
        </div>

        {/* TOP PHIM */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col h-full">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
             <h3 className="text-xl font-bold text-white">🏆 Top Phim Hot</h3>
             <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
             >
                <FaFileExcel /> Xuất Excel
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            {topMovies.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">Chưa có dữ liệu.</div>
            ) : (
                <div className="space-y-4">
                    {topMovies.map((movie, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-slate-700/30 border border-slate-700/50">
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full font-black text-sm shrink-0 ${index === 0 ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-white'}`}>
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-sm truncate">{movie._id}</h4>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-slate-400">{movie.ticketsSold} vé</span>
                                    <span className="text-xs font-bold text-green-400">
                                        {new Intl.NumberFormat('vi-VN', { notation: "compact" }).format(movie.totalRevenue)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;