'use client';
import React from 'react';

const AboutPage = () => {
  const teamMembers = [
    {
      name: "Võ Nguyễn Minh Hoàng",
      mssv: "49.01.104.048",
      role: "Fullstack Developer",
      avatar: "/img/HoangLon.jpg",
    },
    {
      name: "Nguyễn Hữu Minh Quân",
      mssv: "49.01.104.120",
      role: "Fullstack Developer",
      avatar: "/img/MinQuan.jpg",
    },
    {
      name: "Nguyễn Thái Bình",
      mssv: "49.01.104.011",
      role: "Tester",
      avatar: "/img/TB.jpg",
    },
    {
      name: "Bùi Minh Tín",
      mssv: "49.01.104.152",
      role: "Customer Support",
      avatar: "/img/MrTin.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        {/* Tiêu đề trang */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-400 uppercase mb-4">
            About us
          </h1>
          <div className="h-1 w-24 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Đội ngũ phát triển đằng sau <strong>Ciname Galyxa</strong> - hệ thống đặt vé xem phim mang trải nghiệm vũ trụ đến với mọi khán giả.
          </p>
        </div>

        {/* Danh sách thành viên */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div 
              key={index} 
              className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-2 shadow-xl"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150" }}
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {member.name}
              </h3>
              <p className="text-blue-200 text-sm font-medium mb-3 tracking-wider italic">
                MSSV: {member.mssv}
              </p>
              <div className="inline-block px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                <p className="text-red-400 text-xs font-bold uppercase">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-10 border border-white/5 text-center">
          <h2 className="text-2xl font-bold text-white mb-4 italic">"Phim hay không đợi một ai - Đặt vé ngay tại Galyxa"</h2>
          <p className="text-gray-400">
            Dự án được xây dựng với mục tiêu tối ưu hóa trải nghiệm người dùng và mang lại sự tiện lợi trong việc tiếp cận các tác phẩm điện ảnh mới nhất.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;