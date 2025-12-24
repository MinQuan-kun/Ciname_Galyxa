import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTiktok, FaSnowflake, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {

  const discoveryLinks = [
    { label: 'Phim Đang Chiếu', href: '/movies' },
    { label: 'Lịch Chiếu Phim', href: '/schedule' },
    { label: 'Đánh giá phim ảnh', href: '/review' }, 
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-950 to-black text-gray-300 pt-16 pb-8 border-t-4 border-red-600 relative overflow-hidden font-sans">
      
      {/* --- HIỆU ỨNG TUYẾT RƠI (Trang trí) --- */}
      <FaSnowflake className="absolute top-10 left-10 text-blue-400/10 text-7xl animate-[spin_10s_linear_infinite] pointer-events-none" />
      <FaSnowflake className="absolute bottom-10 right-20 text-blue-400/10 text-9xl animate-[spin_15s_linear_infinite] pointer-events-none" />
      <FaSnowflake className="absolute top-1/3 right-1/4 text-white/5 text-4xl animate-pulse pointer-events-none" />
      
      {/* Hiệu ứng Glow nền */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Sửa grid-cols-4 thành lg:grid-cols-3 để cân đối với 3 cột nội dung */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-20">
          
          {/* CỘT 1: THƯƠNG HIỆU & LOGO */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                 <img src="/img/Logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-400 uppercase tracking-wide">
                  Ciname Galyxa
                </h2>
                <p className="text-[10px] text-blue-200 tracking-[0.2em] uppercase font-bold">Universe of Movies</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed text-justify">
              Trải nghiệm điện ảnh "vũ trụ" ngay tại mặt đất. Mùa đông này không lạnh vì đã có những bộ phim bom tấn sưởi ấm con tim bạn. Đặt vé ngay hôm nay!
            </p>
          </div>

          {/* CỘT 2: KHÁM PHÁ (Canh giữa ở màn hình lớn) */}
          <div className="lg:pl-10">
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-red-500 pl-3 uppercase tracking-wider">
              Khám Phá
            </h3>
            <ul className="space-y-3 text-sm">
              {discoveryLinks.map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item.href} 
                    className="group flex items-center hover:text-red-400 transition-colors duration-300 w-fit"
                  >
                    <span className="w-0 overflow-hidden group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2 text-red-500 font-bold">➤</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: KẾT NỐI & LIÊN HỆ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-purple-500 pl-3 uppercase tracking-wider">
              Liên Hệ
            </h3>
            <div className="space-y-4 text-sm text-gray-400 mb-8">
              <p className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-red-500 mt-1 shrink-0" /> 
                <span>280 An Dương Vương, Q.5, TP.HCM</span>
              </p>
              <p className="flex items-center gap-3">
                <FaPhone className="text-green-500 shrink-0" /> 
                <span className="font-bold text-gray-200">0348037158</span>
              </p>
              <p className="flex items-center gap-3">
                <FaEnvelope className="text-yellow-500 shrink-0" /> 
                <span>daigia@gmail.com</span>
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="https://www.facebook.com/lkkunnn" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-blue-900/20 group">
                <FaFacebook className="text-lg group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.instagram.com/kietcvt/)
" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-pink-900/20 group">
                <FaInstagram className="text-lg group-hover:scale-110 transition-transform" />
              </a>
              <a href="https://www.tiktok.com/@cri21105" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black hover:text-white hover:border hover:border-gray-600 transition-all duration-300 hover:-translate-y-1 shadow-lg group">
                <FaTiktok className="text-lg group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-800 mt-16 pt-6 bg-black/20">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-2">
          <p>© 2025 Ciname Galyxa. All rights reserved.</p>
          <div className="flex gap-6">
             <span className="flex items-center gap-1 text-blue-400/80">Winter Edition <FaSnowflake className="animate-pulse"/></span>
             <span>Designed by <span className="text-gray-300 font-bold">MinQuan-kun</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;