'use client'; // Client Component để dùng State

import React, { useState } from 'react';
import MovieCard from '@/components/MovieCard';
import Pagination from '@/components/Pagination';

const MovieGrid = ({ movies, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Logic cắt mảng phim theo trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMovies = movies.slice(indexOfFirstItem, indexOfLastItem);

  // Scroll lên đầu lưới khi chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // document.getElementById('movie-grid-top')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) {
    return <p className="text-gray-500 text-center col-span-full py-10">Hiện chưa có phim nào.</p>;
  }

  return (
    <div id="movie-grid-top">
      {/* Lưới phim */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {currentMovies.map((movie) => (
          <MovieCard key={movie._id} movie={movie} />
        ))}
      </div>

      {/* Phân trang */}
      <Pagination 
        totalItems={movies.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MovieGrid;