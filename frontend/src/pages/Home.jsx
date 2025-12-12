import React from 'react';
import MovieCard from '../components/MovieCard';

// Dữ liệu giả lập
const DUMMY_MOVIES = [
  {
    id: 1,
    title: "Đào, Phở và Piano",
    poster: "https://upload.wikimedia.org/wikipedia/vi/a/a2/Dao_pho_va_piano_poster.jpg",
    genre: "Lịch sử, Tâm lý",
    rating: 9.5,
    duration: 100
  },
  {
    id: 2,
    title: "Mai",
    poster: "https://upload.wikimedia.org/wikipedia/vi/8/86/Mai_2024_poster.jpg",
    genre: "Tâm lý, Tình cảm",
    rating: 8.8,
    duration: 131
  },
  {
    id: 3,
    title: "Dune: Part Two",
    poster: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpg",
    genre: "Hành động, Viễn tưởng",
    rating: 9.0,
    duration: 166
  },
  {
    id: 4,
    title: "Kung Fu Panda 4",
    poster: "https://upload.wikimedia.org/wikipedia/en/7/7f/Kung_Fu_Panda_4_poster.jpg",
    genre: "Hoạt hình, Hài",
    rating: 8.5,
    duration: 94
  },
  // Bạn có thể copy thêm để danh sách dài hơn
];

const Home = () => {
  return (
    <div className="bg-gray-950 min-h-screen pb-10">
        {/* Banner đơn giản */}
        <div className="bg-gradient-to-r from-red-900 to-black h-64 flex items-center justify-center text-center px-4">
            <div>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
                    Phim Đang Chiếu
                </h1>
                <p className="text-gray-300 text-lg">Đặt vé ngay, nhận ưu đãi liền tay!</p>
            </div>
        </div>

        {/* Danh sách phim */}
        <div className="container mx-auto px-4 mt-10">
            <h2 className="text-2xl font-bold text-white border-l-4 border-red-600 pl-4 mb-6">
                Now Showing
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {DUMMY_MOVIES.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    </div>
  );
};

export default Home;