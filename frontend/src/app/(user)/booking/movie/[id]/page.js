'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axiosClient from '@/api/axios';
import { 
    FaCalendarAlt, FaClock, FaPlay, FaUserSecret, FaUsers, 
    FaFilm, FaLanguage, FaExclamationTriangle, FaMapMarkerAlt, 
    FaStar, FaPen
} from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';
import { toast } from 'react-toastify';

const MovieBookingPage = () => {
    const { id } = useParams();

    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter(); ///page.js]
    const [showLogin, setShowLogin] = useState(false);
    
    const [reviews, setReviews] = useState([]);
    const [isWriting, setIsWriting] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
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

    const fetchReviews = async (currentPage = 1) => {
        try {
            // Truyền thêm param page
            const res = await axiosClient.get(`/reviews/movie/${id}?page=${currentPage}`);
            const { data, pagination } = res.data;

            if (currentPage === 1) {
                setReviews(data);
            } else {
                // Nếu là trang sau thì nối thêm vào danh sách cũ
                setReviews(prev => [...prev, ...data]);
            }

            // Kiểm tra xem còn trang sau không
            setHasMore(currentPage < pagination.totalPages);
        } catch (error) {
            console.error("Lỗi tải đánh giá");
        }
    };

    // Gọi lần đầu khi vào trang
    useEffect(() => {
        if(id) fetchReviews(1);
    }, [id]);

    // Hàm xử lý khi bấm nút "Xem thêm" (MỚI)
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReviews(nextPage);
    };

    const handleSubmitReview = async () => {
        const user = localStorage.getItem('user');
        if (!user) {
            setShowLogin(true);
            return toast.info("Vui lòng đăng nhập để viết đánh giá!");
        }

        if (!reviewForm.comment.trim()) return toast.warning("Vui lòng nhập nội dung!");

        try {
            await axiosClient.post('/reviews', {
                movieId: id,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            toast.success("Đăng đánh giá thành công!");
            setIsWriting(false);
            setReviewForm({ rating: 5, comment: '' });

            // Reset list về trang 1 (MỚI)
            setPage(1);
            fetchReviews(1);
            
            // Cập nhật lại điểm rating của phim ngay lập tức (UI)
            setMovie(prev => ({ ...prev, rating: reviewForm.rating })); // Chỉ là update tạm thời để user thấy
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi đăng đánh giá (Bạn cần mua vé trước)");
        }
    };

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

        // Tính thời gian đóng
        const closeBookingTime = new Date(showtimeStart.getTime() - 10 * 60000);

        // Nếu hiện tại lớn hơn hoặc bằng thời gian đóng cửa -> Chặn
        if (now >= closeBookingTime) {
            toast.warning("Đã hết thời gian đặt vé (hệ thống đóng trước giờ chiếu 10 phút). Vui lòng chọn suất khác!", {
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
                                                    <span className="bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-800/50">{group.roomType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* List Giờ */}
                                        <div className="flex flex-wrap gap-3">
                                            {group.times.map((item) => {
                                                const now = new Date();
                                                const showTimeDate = new Date(item.startTime);
                                                const closeBookingTime = new Date(showTimeDate.getTime() - 10 * 60000);
                                                const isBookingClosed = now >= closeBookingTime;

                                                return (
                                                    <button
                                                        key={item._id}
                                                        disabled={isBookingClosed} // Disable nếu quá hạn
                                                        onClick={() => handleTimeClick(item)}
                                                        className={`group relative px-6 py-2 rounded-lg border transition-all ${isBookingClosed
                                                            ? 'bg-slate-800 border-slate-700 opacity-50 cursor-not-allowed grayscale' // Style khi đóng đặt vé
                                                            : 'bg-slate-800 border-slate-700 hover:bg-orange-600 hover:border-orange-500' // Style hoạt động
                                                            }`}
                                                    >
                                                        {/* Giờ chiếu */}
                                                        <p className={`text-lg font-bold text-white transition-transform ${!isBookingClosed && 'group-hover:scale-110'}`}>
                                                            {new Date(item.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>

                                                        {/* Giá vé */}
                                                        <p className={`text-[10px] mt-1 ${!isBookingClosed ? 'text-slate-500 group-hover:text-orange-100' : 'text-slate-600'}`}>
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
                    
                <div className="mt-12 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white border-l-4 border-yellow-500 pl-4">Đánh Giá & Bình Luận</h2>
                            <div className="flex items-center gap-2 mt-2 ml-5 text-sm">
                                <span className="text-3xl font-black text-white">{movie.rating || 0}</span>
                                <div className="text-yellow-500 text-sm flex">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={i < Math.round(movie.rating || 0) ? "text-yellow-500" : "text-slate-700"} />
                                    ))}
                                </div>
                                <span className="text-slate-500">/ 5 điểm ({reviews.length} lượt đánh giá)</span>
                            </div>
                        </div>
                        
                        {!isWriting && (
                            <button 
                                onClick={() => {
                                    const user = localStorage.getItem('user');
                                    if(!user) { setShowLogin(true); return toast.info("Đăng nhập để đánh giá"); }
                                    setIsWriting(true);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition border border-slate-700 font-bold text-sm"
                            >
                                <FaPen /> Viết đánh giá
                            </button>
                        )}
                    </div>

                    {/* FORM VIẾT ĐÁNH GIÁ */}
                    {isWriting && (
                        <div className="bg-slate-900 p-5 rounded-xl border border-slate-700 mb-8 animate-fade-in">
                            <h3 className="font-bold text-white mb-3">Đánh giá của bạn</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-slate-400 text-sm">Chất lượng:</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button key={star} onClick={() => setReviewForm({...reviewForm, rating: star})}>
                                            <FaStar className={`text-xl transition ${star <= reviewForm.rating ? 'text-yellow-400 scale-110' : 'text-slate-600'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                placeholder="Chia sẻ cảm nghĩ của bạn về bộ phim..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-orange-500 outline-none min-h-[100px]"
                            ></textarea>
                            <div className="flex justify-end gap-2 mt-3">
                                <button onClick={() => setIsWriting(false)} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm">Hủy</button>
                                <button onClick={handleSubmitReview} className="px-6 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold text-sm shadow-lg">Gửi đánh giá</button>
                            </div>
                        </div>
                    )}

                    {/* DANH SÁCH REVIEW */}
                    <div className="space-y-4">
                        {reviews.length === 0 ? (
                            <div className="text-center py-10 text-slate-500 italic">Chưa có đánh giá nào. Hãy là người đầu tiên!</div>
                        ) : (
                            reviews.map((review) => (
                                <div key={review._id} className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex gap-4">
                                    <img 
                                        src={review.userId?.avatar || `https://ui-avatars.com/api/?name=${review.userId?.name}&background=random`} 
                                        alt="avatar" 
                                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{review.userId?.name || 'Người dùng ẩn danh'}</h4>
                                                <p className="text-[10px] text-slate-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div className="flex text-yellow-500 text-xs">
                                                {[...Array(5)].map((_, i) => (
                                                    <FaStar key={i} className={i < review.rating ? "text-yellow-500" : "text-slate-800"} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-300 text-sm mt-2 leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>
                            ))
                            
                        )}
                        {reviews.length > 0 && hasMore && (
                            <div className="text-center pt-4">
                                <button 
                                    onClick={handleLoadMore}
                                    className="text-slate-400 hover:text-white text-sm font-bold border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-full transition"
                                >
                                    Xem các đánh giá cũ hơn
                                </button>
                            </div>
                        )}
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