import React from 'react';

const MovieCard = ({ movie }) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition duration-300 group cursor-pointer">
      {/* Poster Ảnh */}
      <div className="relative overflow-hidden aspect-[2/3]">
        <img 
          src={movie.poster} 
          alt={movie.title} 
          className="w-full h-full object-cover group-hover:opacity-80 transition"
        />
        {/* Nút đặt vé hiện lên khi hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 bg-black/40">
           <button className="bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:bg-red-700 cursor-pointer">
             Mua Vé
           </button>
        </div>
      </div>

      {/* Thông tin phim */}
      <div className="p-4">
        <h3 className="text-white text-lg font-bold truncate">{movie.title}</h3>
        <p className="text-gray-400 text-sm mt-1">{movie.genre}</p>
        <div className="flex justify-between items-center mt-3">
            <span className="text-yellow-400 font-bold text-sm">★ {movie.rating}</span>
            <span className="text-gray-300 text-xs bg-gray-700 px-2 py-1 rounded">
                {movie.duration} phút
            </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;