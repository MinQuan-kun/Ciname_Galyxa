import Banner from '@/components/Banner';
import MovieGrid from '@/components/MovieGrid'; // Import component mới
import Link from 'next/link'; // Dùng Link của NextJS thay vì thẻ a

async function getMovies() {
  try {
    const res = await fetch('http://localhost:5001/api/movies', { cache: 'no-store' });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const movies = await getMovies();
  
  // Lấy 10 phim đang chiếu mới nhất
  const latestMovies = movies
    .filter(movie => movie.status === 'Đang chiếu') 
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return (
    <main className="bg-slate-950 min-h-screen pb-20">
      <Banner />

      <div className="container mx-auto px-4 mt-4 relative z-20">
        <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="text-blue-500 text-4xl animate-pulse">❄️</span>
            Phim Đang Chiếu
          </h2>
          {/* Link sang trang xem tất cả */}
          <Link href="/movies" className="text-blue-400 hover:text-white transition text-sm font-bold">
            Xem tất cả &rarr;
          </Link>
        </div>

        <MovieGrid movies={latestMovies} itemsPerPage={10} /> 
      </div>
    </main>
  );
}