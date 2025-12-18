'use client'; // Bắt buộc dòng này để dùng Swiper

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Import CSS của Swiper
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

// Dữ liệu Banner (Lấy từ file cũ của bạn)
const BANNER_MOVIES = [
    { id: 1, img: "https://www.fahasa.com/blog/wp-content/uploads/2025/03/kimetsu-dai-dien.webp", title: "Demon Slayer" },
    { id: 2, img: "https://gamelade.vn/wp-content/uploads/2024/12/projectsekaimovie_visual-1-scaled-e1724450931107_11zon-1.jpg", title: "A Miku can't sing" },
    { id: 3, img: "https://www.elleman.vn/app/uploads/2018/04/25/Avengers-Infinity-War-ELLE-Man-featured-01-01.jpg", title: "Infinity war" },
];

const Banner = () => {
  return (
    <div className="relative h-[600px] w-full overflow-hidden group">
        <Swiper
            spaceBetween={0}
            effect={'fade'}
            centeredSlides={true}
            autoplay={{
                delay: 4500,
                disableOnInteraction: false,
            }}
            pagination={{
                clickable: true,
                dynamicBullets: true,
            }}
            modules={[Autoplay, EffectFade, Pagination]}
            className="mySwiper w-full h-full"
        >
            {BANNER_MOVIES.map((movie) => (
                <SwiperSlide key={movie.id}>
                    <div className="relative w-full h-full">
                        <img src={movie.img} alt={movie.title} className="w-full h-full object-cover brightness-75" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                        
                        {/* Nội dung Banner */}
                        <div className="absolute bottom-24 left-10 md:left-20 z-10 max-w-2xl text-white opacity-0 animate-fade-in-up">
                            <h2 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tight">
                                {movie.title}
                            </h2>
                            <p className="text-lg md:text-xl text-gray-200 mb-8 line-clamp-2 drop-shadow-md">
                                Trải nghiệm điện ảnh đỉnh cao với âm thanh sống động và hình ảnh sắc nét. Đặt vé ngay hôm nay!
                            </p>
                            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:shadow-red-500 hover:scale-105 transition cursor-pointer">
                                Đặt Vé Ngay
                            </button>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
        
        {/* Lớp mờ nối banner với body */}
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
    </div>
  );
};

export default Banner;