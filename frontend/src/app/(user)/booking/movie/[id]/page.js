'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { FaCalendarAlt, FaClock, FaPlay, FaUserSecret, FaUsers, FaFilm, FaLanguage, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';
import { toast } from 'react-toastify';

const MovieBookingPage = () => {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); ///page.js]
    const [showLogin, setShowLogin] = useState(false);

    // State mới: Ngày đang chọn
    const [selectedDate, setSelectedDate] = useState('');
    useEffect(() => {
        const fetchData = async () => {
            try {
                const movieRes = await axiosClient.get(`/movies/${id}`);
                setMovie(movieRes.data);

                // Gọi API lấy lịch chiếu
                const showtimeRes = await axiosClient.get(`/showtimes/${id}`);
                const data = showtimeRes.data;
                setShowtimes(data);

                // Tự động chọn ngày đầu tiên có lịch
                if (data.length > 0) {
                    // Sắp xếp lịch theo thời gian tăng dần trước
                    const sorted = data.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    const firstDate = new Date(sorted[0].startTime).toDateString();
                    setSelectedDate(firstDate);
                }

            } catch (error) {
                console.error("Lỗi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- XỬ LÝ LOGIC NHÓM LỊCH CHIẾU ---

    // 1. Lấy danh sách các ngày duy nhất
    const uniqueDates = useMemo(() => {
        const dates = showtimes.map(item => {
            const d = new Date(item.startTime);
            return {
                fullDate: d.toDateString(), // Dùng để so sánh
                dayName: d.toLocaleDateString('vi-VN', { weekday: 'short' }), // Thứ 2, CN...
                dayNum: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), // 20/10
                iso: d // Để sort
            };
        });

        // Lọc trùng và sắp xếp
        const unique = [];
        const map = new Map();
        for (const item of dates) {
            if (!map.has(item.fullDate)) {
                map.set(item.fullDate, true);
                unique.push(item);
            }
        }
        return unique.sort((a, b) => a.iso - b.iso);
    }, [showtimes]);

    // 2. Lọc lịch theo ngày đang chọn & Nhóm theo Rạp
    const groupedShowtimes = useMemo(() => {
        if (!selectedDate) return [];

        // Lọc các suất trong ngày đã chọn
        const filtered = showtimes.filter(s => new Date(s.startTime).toDateString() === selectedDate);

        // Nhóm theo Room ID
        const grouped = {};
        filtered.forEach(s => {
            // Xử lý fallback nếu field là room hoặc roomId
            const roomObj = s.room || s.roomId;
            const roomId = roomObj?._id || 'unknown';

            if (!grouped[roomId]) {
                grouped[roomId] = {
                    roomName: roomObj?.name || 'Rạp chưa đặt tên',
                    roomType: roomObj?.type || '2D',
                    screenType: roomObj?.screenType || 'Standard',
                    times: []
                };
            }
            grouped[roomId].times.push(s);
        });

        // Sắp xếp các giờ chiếu trong từng rạp tăng dần
        Object.values(grouped).forEach(group => {
            group.times.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        });

        return Object.values(grouped);
    }, [showtimes, selectedDate]);


    // Helper: Embed Youtube
    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const getAgeColor = (code) => {
        switch (code) {
            case 'P': return 'bg-green-500';
            case 'K': return 'bg-blue-500';
            case 'T13': return 'bg-yellow-500 text-black';
            case 'T16': return 'bg-orange-500';
            case 'T18': return 'bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    const handleTimeClick = (showtime) => {
        // --- KIỂM TRA THỜI GIAN ---
        const now = new Date();
        const showtimeStart = new Date(showtime.startTime);

        // Nếu thời gian hiện tại lớn hơn hoặc bằng giờ chiếu -> Chặn
        if (now >= showtimeStart) {
            toast.warning("Suất chiếu này đã bắt đầu hoặc kết thúc. Vui lòng chọn suất khác!", {
                position: "top-center",
                autoClose: 3000
            });
            return;
        }



        // --- KIỂM TRA ĐĂNG NHẬP  ---
        const user = localStorage.getItem('user');
        if (user) {
            router.push(`/booking/${showtime._id}`);
        } else {
            toast.info("Vui lòng đăng nhập để đặt vé!");
            setShowLogin(true);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex justify-center items-center text-white">Đang tải...</div>;
    if (!movie) return <div className="text-white text-center pt-20">Không tìm thấy phim!</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">

            {/* --- BANNER (Giữ nguyên) --- */}
            <div className="relative h-[450px] w-full overflow-hidden group">
                <img src={movie.banner || movie.poster} alt="" className="w-full h-full object-cover opacity-30 blur-sm transform group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

                <div className="absolute bottom-0 left-0 w-full p-4 md:p-10 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto z-20">
                    {/* Poster nhỏ */}
                    <div className="relative shrink-0 hidden md:block">
                        <img src={movie.poster} alt={movie.title} className="w-52 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-slate-700" />
                        <div className={`absolute top-2 left-2 ${getAgeColor(movie.ageLimit)} text-white text-xs font-bold px-2 py-1 rounded shadow-md`}>
                            {movie.ageLimit || 'P'}
                        </div>
                    </div>

                    <div className="mb-4 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {movie.status || "Đang Chiếu"}
                            </span>
                            <span className={`md:hidden ${getAgeColor(movie.ageLimit)} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                                {movie.ageLimit || 'P'}
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase leading-none">
                            {movie.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm font-medium">
                            <span className="flex items-center gap-2"><FaClock className="text-blue-500" /> {movie.duration} phút</span>
                            <span className="flex items-center gap-2"><FaFilm className="text-pink-500" /> {Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre}</span>
                            <span className="flex items-center gap-2"><FaCalendarAlt className="text-green-500" /> {new Date(movie.releaseDate || Date.now()).toLocaleDateString('vi-VN')}</span>
                        </div>

                        {movie.note && (
                            <div className="mt-4 flex items-start gap-2 bg-red-500/10 border border-red-500/30 p-3 rounded-lg max-w-2xl">
                                <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
                                <p className="text-sm text-red-200 italic">{movie.note}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* --- CỘT TRÁI: LỊCH CHIẾU */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white border-l-4 border-orange-500 pl-4 mb-6">Lịch Chiếu</h2>

                    {showtimes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                            <p className="text-slate-500">Chưa có lịch chiếu nào.</p>
                        </div>
                    ) : (
                        <>
                            {/* 1. THANH CHỌN NGÀY */}
                            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                                {uniqueDates.map((date, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(date.fullDate)}
                                        className={`flex flex-col items-center justify-center min-w-[80px] px-2 py-3 rounded-xl border transition-all ${selectedDate === date.fullDate
                                                ? 'bg-orange-600 border-orange-500 text-white shadow-lg scale-105'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                                            }`}
                                    >
                                        <span className="text-xs font-bold uppercase">{date.dayName}</span>
                                        <span className="text-lg font-black">{date.dayNum}</span>
                                    </button>
                                ))}
                            </div>

                            {/* 2. DANH SÁCH RẠP & GIỜ */}
                            <div className="space-y-6">
                                {groupedShowtimes.map((group, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
                                        {/* Header Rạp */}
                                        <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-500">
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white text-lg">{group.roomName}</h3>
                                                <div className="flex gap-2 text-xs">
                                                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">{group.screenType}</span>
                                                    <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">{group.roomType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* List Giờ */}
                                        <div className="flex flex-wrap gap-3">
                                            {group.times.map((item) => {
                                                // 1. Kiểm tra điều kiện 1 lần duy nhất
                                                const isPast = new Date() >= new Date(item.startTime);

                                                return (
                                                    <button
                                                        key={item._id}
                                                        disabled={isPast} // Chặn click triệt để
                                                        onClick={() => handleTimeClick(item)}
                                                        className={`group relative px-6 py-2 rounded-lg border transition-all ${isPast
                                                                ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed grayscale' // Style khi quá giờ
                                                                : 'bg-slate-800 border-slate-700 hover:bg-orange-600 hover:border-orange-500' // Style hoạt động
                                                            }`}
                                                    >
                                                        {/* Giờ chiếu */}
                                                        <p className={`text-lg font-bold text-white transition-transform ${!isPast && 'group-hover:scale-110'}`}>
                                                            {new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>

                                                        {/* Giá vé */}
                                                        <p className={`text-[10px] mt-1 ${!isPast ? 'text-slate-500 group-hover:text-orange-100' : 'text-slate-600'}`}>
                                                            {new Intl.NumberFormat('vi-VN').format(item.price || item.ticketPrice || 0)}đ
                                                        </p>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {groupedShowtimes.length === 0 && (
                                    <div className="text-center text-slate-500 py-8">
                                        Không có suất chiếu nào vào ngày này.
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Nội dung phim */}
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-white border-l-4 border-blue-500 pl-4 mb-6">Nội Dung Phim</h2>
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-slate-300 leading-relaxed text-justify">
                            {movie.description || "Đang cập nhật nội dung..."}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI: THÔNG TIN (Giữ nguyên) --- */}
                <div className="space-y-8">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span> Thông Tin
                        </h3>

                        <ul className="space-y-5">
                            <li className="flex items-start gap-4 border-b border-slate-800 pb-4">
                                <div className={`w-10 h-10 rounded flex items-center justify-center text-white font-bold shrink-0 ${getAgeColor(movie.ageLimit)}`}>
                                    {movie.ageLimit || 'P'}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Kiểm duyệt</p>
                                    <p className="text-white font-medium text-sm">
                                        {movie.ageLimit === 'T18' ? 'Cấm khán giả dưới 18 tuổi' :
                                            movie.ageLimit === 'T16' ? 'Cấm khán giả dưới 16 tuổi' :
                                                'Phổ biến mọi lứa tuổi'}
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                    <FaUserSecret />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Đạo diễn</p>
                                    <p className="text-white font-medium">{movie.director || "Chưa cập nhật"}</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                                    <FaUsers />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold">Diễn viên</p>
                                    <p className="text-white font-medium line-clamp-2">{movie.cast || "Chưa cập nhật"}</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Trailer Video */}
                    {movie.trailer && (
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Trailer
                            </h3>
                            <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-black">
                                {getEmbedUrl(movie.trailer) ? (
                                    <iframe
                                        src={getEmbedUrl(movie.trailer)}
                                        title="Movie Trailer"
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    ></iframe>
                                ) : (
                                    <a href={movie.trailer} target="_blank" className="flex flex-col items-center justify-center h-full text-slate-500 hover:text-white transition">
                                        <FaPlay size={40} className="mb-2" />
                                        <span>Xem trên Youtube</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <AuthModal
                        isOpen={showLogin}
                        onClose={() => setShowLogin(false)}
                        onLoginSuccess={(userData) => {
                            setShowLogin(false);
                            toast.success("Đăng nhập thành công! Hãy chọn lại suất chiếu.");
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default MovieBookingPage;