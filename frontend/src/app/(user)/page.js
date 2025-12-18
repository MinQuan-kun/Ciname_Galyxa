import MovieCard from '@/components/MovieCard';
import Banner from '@/components/Banner';

// Hàm lấy dữ liệu từ Backend (Chạy trên Server)
async function getMovies() {
  try {
    const res = await fetch('http://localhost:5001/api/movies', {
      cache: 'no-store' // Không cache để luôn có dữ liệu mới nhất
    });

    if (!res.ok) {
      console.error("Failed to fetch movies");
      return [];
    }

    const data = await res.json();
    return data; // Giả sử backend trả về mảng phim trực tiếp hoặc data.movies
  } catch (error) {
    console.error("Error connecting to backend:", error);
    return [];
  }
}

export default async function Home() {
  const movies = await getMovies();

  return (
    <main className="bg-slate-950 min-h-screen pb-20">
      {/* 1. Phần Banner Slider */}
      <Banner />

      {/* 2. Phần Danh Sách Phim */}
      <div className="container mx-auto px-4 mt-4 relative z-20">
        {/* Header của danh sách */}
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-blue-500 text-4xl animate-pulse">❄️</span>
            Phim Đang Chiếu
          </h2>
          <a href="#" className="text-blue-400 hover:text-white transition text-sm">Xem tất cả &rarr;</a>
        </div>

        {/* Lưới phim */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {movies && movies.length > 0 ? (
            movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full">
              Hiện chưa có phim nào đang chiếu.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}