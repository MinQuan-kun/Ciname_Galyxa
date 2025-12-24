import React from 'react';
import MovieGrid from '@/components/MovieGrid';
import { FaFilm } from 'react-icons/fa';

async function getAllMovies() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    
    const res = await fetch(`${apiUrl}/movies`, { cache: 'no-store' });
    
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Lỗi tải phim:", error);
    return [];
  }
}

export default async function MoviesPage() {
  const movies = await getAllMovies();
  
  // Sắp xếp phim mới nhất
  const sortedMovies = movies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20 pt-24"> {/* pt-24 để tránh Navbar */}
      <div className="container mx-auto px-4">
        
        {/* Header Trang */}
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 uppercase mb-4">
                Kho Phim Đồ Sộ
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
                Khám phá danh sách toàn bộ các bộ phim bom tấn đang và sắp được khởi chiếu tại Ciname Galyxa.
            </p>
        </div>

        {/* Thanh công cụ */}
        <div className="flex items-center gap-2 mb-8 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <FaFilm className="text-blue-500"/>
            <span className="font-bold">Tổng số phim: <span className="text-orange-500">{movies.length}</span></span>
        </div>

        {/* Component Lưới Phim + Phân Trang */}
        <MovieGrid movies={sortedMovies} itemsPerPage={10} />
        
      </div>
    </div>
  );
}