import React from 'react';
import { FaFacebook, FaInstagram, FaTiktok, FaSnowflake, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';


const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-gray-300 pt-16 pb-8 border-t-4 border-red-600 relative overflow-hidden font-sans">
      
      {/* --- Hiệu ứng tuyết rơi  --- */}
      <FaSnowflake className="absolute top-10 left-10 text-blue-400/10 text-7xl animate-spin-slow pointer-events-none" />
      <FaSnowflake className="absolute bottom-10 right-20 text-blue-400/10 text-9xl animate-spin-slow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* CỘT 1: THƯƠNG HIỆU & LOGO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {/* Tên thương hiệu Gradient */}
              <div>
                <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-400 uppercase tracking-wide">
                  Ciname Galyxa
                </h2>
                <p className="text-xs text-blue-200 tracking-widest">UNIVERSE OF MOVIES</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Trải nghiệm điện ảnh "vũ trụ" ngay tại mặt đất. Mùa đông này không lạnh vì đã có những bộ phim bom tấn sưởi ấm con tim bạn.
            </p>
          </div>

          {/* CỘT 2: KHÁM PHÁ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-red-500 pl-3">
              Khám Phá
            </h3>
            <ul className="space-y-3 text-sm">
              {['Phim Đang Chiếu', 'Suất Chiếu Đặc Biệt', 'Tin Tức Điện Ảnh', 'Khuyến Mãi'].map((item, index) => (
                <li key={index}>
                  <a href="#" className="group flex items-center hover:text-red-400 transition-colors duration-300">
                    <span className="w-0 overflow-hidden group-hover:w-2 transition-all duration-300 mr-0 group-hover:mr-2 text-red-500">➤</span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CỘT 3: HỖ TRỢ & ĐIỀU KHOẢN */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-blue-500 pl-3">
              Hỗ Trợ
            </h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Điều khoản chung</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Câu hỏi thường gặp (FAQ)</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Tuyển dụng</a></li>
            </ul>
          </div>

          {/* CỘT 4: KẾT NỐI & LIÊN HỆ */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6 border-l-4 border-purple-500 pl-3">
              Liên Hệ
            </h3>
            <div className="space-y-3 text-sm text-gray-400 mb-6">
              <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500" /> 280 An Dương Vương, Q.5, TP.HCM</p>
              <p className="flex items-center gap-2"><FaPhone className="text-green-500" /> 1900 123 456</p>
              <p className="flex items-center gap-2"><FaEnvelope className="text-yellow-500" /> contact@cinamegalyxa.com</p>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-blue-900/20">
                <FaFacebook className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-pink-900/20">
                <FaInstagram className="text-xl" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black hover:text-white hover:border hover:border-white transition-all duration-300 hover:-translate-y-1 shadow-lg">
                <FaTiktok className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="border-t border-slate-800 mt-12 pt-6">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© 2024 Ciname Galyxa. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
             <span>Winter Edition ❄️</span>
             <span>Designed by Nhonn</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;