import React from 'react';
import { FaStar, FaTicketAlt } from 'react-icons/fa';
import Link from 'next/link';
const MovieCard = ({ movie }) => {
  // Xử lý genre: Đảm bảo nó luôn là mảng để map ra các tag
  const genres = Array.isArray(movie.genre) 
    ? movie.genre 
    : movie.genre.split(',').map(g => g.trim());

  return (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-800 hover:border-red-600/50 transition-all duration-300 hover:shadow-red-900/20 hover:-translate-y-2">
      
      {/* 1. Phần Ảnh Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay đen mờ khi hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Nút đặt Vé hiện lên giữa ảnh */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
           <Link href={`/booking/movie/${movie._id}`}>
               <button className="flex items-center gap-2 bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-red-700 transform hover:scale-105 transition cursor-pointer">
                 <FaTicketAlt /> Đặt Vé
               </button>
           </Link>
        </div>
      </div>

      {/* 2. Phần Thông Tin */}
      <div className="p-4">
        <h3 className="text-white text-lg font-bold truncate mb-2 group-hover:text-red-500 transition-colors">
            {movie.title}
        </h3>
        
        {/* Container chứa các Tags (Thể loại) */}
        <div className="flex flex-wrap gap-2 mb-3">
            {genres.map((genre, index) => (
                <span 
                    key={index} 
                    className="text-[10px] font-medium uppercase tracking-wider text-gray-300 bg-gray-800 px-2 py-1 rounded-md border border-gray-700 hover:border-gray-500 hover:text-white transition cursor-default"
                >
                    {genre}
                </span>
            ))}
        </div>

        {/* Thời lượng & Ngày */}
        <div className="flex justify-between items-center border-t border-gray-800 pt-3 mt-auto">
            <span className="text-gray-400 text-xs">
                {movie.duration} phút
            </span>
            <span className="text-red-500 font-semibold text-xs border border-red-500/30 px-2 py-1 rounded">
                Đang Chiếu
            </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;