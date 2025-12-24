'use client';
import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaStar, FaHeart, FaRegHeart, FaUserCircle, FaQuoteLeft, FaPen, FaFilter } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal'; // Giả sử bạn có component này để yêu cầu đăng nhập

const ReviewPage = () => {
  // --- STATE ---
  const [topMovies, setTopMovies] = useState([]); // Dữ liệu Top 5
  const [allMovies, setAllMovies] = useState([]); // Dữ liệu cho Dropdown lọc
  const [reviews, setReviews] = useState([]);     // Dữ liệu review của 1 phim cụ thể
  
  const [selectedMovieId, setSelectedMovieId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  
  // State Modal Viết Review
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  // User State
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // --- 1. KHỞI TẠO DỮ LIỆU ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        // Lấy Top 5 phim & Danh sách tất cả phim để lọc
        const [resTop, resAll] = await Promise.all([
          axiosClient.get('/reviews/top-movies'),
          axiosClient.get('/movies')
        ]);

        setTopMovies(resTop.data);
        setAllMovies(resAll.data);
      } catch (error) {
        console.error("Lỗi tải trang review:", error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // --- 2. KHI THAY ĐỔI BỘ LỌC ---
  useEffect(() => {
    const fetchMovieReviews = async () => {
      if (selectedMovieId === 'ALL') return;
      
      setLoading(true);
      try {
        const res = await axiosClient.get(`/reviews/movie/${selectedMovieId}`);
        setReviews(res.data.data); // Giả sử API trả về { data: [], pagination: {} }
      } catch (error) {
        console.error("Lỗi tải review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieReviews();
  }, [selectedMovieId]);

  // --- HELPERS ---
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-600"} />
    ));
  };

  // --- ACTIONS ---
  const handleLike = async (reviewId) => {
    if (!user) return setShowAuthModal(true);

    try {
      const res = await axiosClient.post(`/reviews/${reviewId}/interact`);
      // Cập nhật lại UI ngay lập tức (Optimistic update)
      setReviews(prev => prev.map(r => {
        if (r._id === reviewId) {
            // Logic đơn giản để đổi UI, thực tế nên dùng dữ liệu từ res.data
            const isLiked = !r.interactionUsers.includes(user._id);
            const newInteractions = isLiked ? r.interactions + 1 : r.interactions - 1;
            const newUsers = isLiked ? [...r.interactionUsers, user._id] : r.interactionUsers.filter(id => id !== user._id);
            return { ...r, interactions: newInteractions, interactionUsers: newUsers };
        }
        return r;
      }));
    } catch (error) {
      toast.error("Lỗi tương tác!");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return setShowAuthModal(true);

    try {
      await axiosClient.post('/reviews', {
        movieId: selectedMovieId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      toast.success("Đã gửi đánh giá thành công!");
      setIsModalOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      
      // Refresh lại list review
      const res = await axiosClient.get(`/reviews/movie/${selectedMovieId}`);
      setReviews(res.data.data);
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi gửi đánh giá");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2">
          GÓC ĐIỆN ẢNH & BÌNH LUẬN
        </h1>
        <p className="text-gray-400">Chia sẻ cảm nhận, kết nối đam mê.</p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-6xl mx-auto mb-10 flex justify-center sticky top-4 z-20">
        <div className="bg-gray-800/90 backdrop-blur-md p-2 pl-4 rounded-full border border-gray-700 shadow-xl flex items-center gap-3 w-full max-w-xl">
          <FaFilter className="text-orange-500" />
          <span className="text-sm font-bold text-gray-300 whitespace-nowrap hidden md:block">Xem đánh giá:</span>
          <select 
            value={selectedMovieId}
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="bg-transparent text-white w-full outline-none cursor-pointer py-2 font-medium"
          >
            <option value="ALL" className="bg-gray-900">⭐ Top Phim Nổi Bật (Mặc định)</option>
            {allMovies.map(m => (
              <option key={m._id} value={m._id} className="bg-gray-900">{m.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- PHẦN 1: TOP 5 MOVIES (HIỆN KHI CHỌN ALL) --- */}
      {selectedMovieId === 'ALL' && (
        <div className="max-w-6xl mx-auto space-y-12">
          {topMovies.map((item, index) => (
            <div key={item.movie._id} className="flex flex-col md:flex-row gap-6 bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-lg relative overflow-hidden group hover:border-gray-700 transition-all">
              
              {/* Số thứ hạng nền */}
              <div className="absolute -right-4 -bottom-10 text-[150px] font-black text-gray-800/50 select-none z-0">
                #{index + 1}
              </div>

              {/* Poster */}
              <div className="w-full md:w-48 shrink-0 z-10 relative">
                <img 
                  src={item.movie.poster} 
                  alt={item.movie.title} 
                  className="w-full h-72 object-cover rounded-xl shadow-2xl transform group-hover:scale-105 transition duration-500"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-black font-bold px-2 py-1 rounded text-xs flex items-center gap-1 shadow-md">
                  <FaStar /> {item.movie.rating || 0}/5
                </div>
              </div>

              {/* Info + Best Review */}
              <div className="flex-1 z-10 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-white mb-2">{item.movie.title}</h2>
                <div className="flex gap-4 text-sm text-gray-400 mb-6">
                  <span>{item.movie.duration} phút</span>
                  <span>•</span>
                  <span>{item.movie.genre?.join(', ')}</span>
                </div>

                {/* BEST REVIEW BUBBLE */}
                {item.bestReview ? (
                  <div className="bg-gray-800/80 p-5 rounded-xl border-l-4 border-orange-500 relative">
                    <FaQuoteLeft className="absolute top-4 right-4 text-gray-700 text-2xl" />
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                         {item.bestReview.userId?.avatar ? <img src={item.bestReview.userId.avatar} /> : <FaUserCircle />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-200">{item.bestReview.userId?.name || 'Người dùng ẩn danh'}</p>
                        <div className="flex text-xs">{renderStars(item.bestReview.rating)}</div>
                      </div>
                    </div>
                    <p className="text-gray-300 italic line-clamp-3">"{item.bestReview.comment}"</p>
                    <div className="mt-3 flex items-center gap-1 text-xs text-pink-500 font-bold">
                        <FaHeart /> {item.bestReview.interactions} người thấy hữu ích
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 italic p-4 border border-dashed border-gray-700 rounded-xl">
                    Chưa có đánh giá nào nổi bật. Hãy là người đầu tiên!
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedMovieId(item.movie._id)}
                  className="mt-6 w-fit text-orange-400 hover:text-orange-300 font-semibold text-sm flex items-center gap-2 transition"
                >
                  Xem tất cả đánh giá <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- PHẦN 2: CHI TIẾT REVIEW CỦA 1 PHIM (HIỆN KHI CHỌN PHIM) --- */}
      {selectedMovieId !== 'ALL' && (
        <div className="max-w-4xl mx-auto">
          {/* Header Phim Đang Chọn */}
          <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
            <div>
               <button onClick={() => setSelectedMovieId('ALL')} className="text-sm text-gray-500 hover:text-white mb-2">← Quay lại Top Phim</button>
               <h2 className="text-2xl font-bold text-white">Đánh giá từ cộng đồng</h2>
               <p className="text-gray-400 text-sm">Sắp xếp theo độ hữu ích</p>
            </div>
            <button 
              onClick={() => {
                  if (!user) setShowAuthModal(true);
                  else setIsModalOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105"
            >
              <FaPen /> Viết đánh giá
            </button>
          </div>

          {/* Danh sách Review */}
          <div className="space-y-6">
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-900 rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-500">Chưa có đánh giá nào cho phim này.</p>
                </div>
            ) : (
                reviews.map(review => (
                    <div key={review._id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-gray-700 transition">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xl overflow-hidden border border-gray-600">
                                    {review.userId?.avatar ? <img src={review.userId.avatar} className="w-full h-full object-cover"/> : <FaUserCircle className="text-gray-400"/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{review.userId?.name}</h4>
                                    <div className="flex text-xs mt-1 space-x-0.5">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-4">
                            {review.comment}
                        </p>

                        <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                            <button 
                                onClick={() => handleLike(review._id)}
                                className={`flex items-center gap-2 text-sm font-medium transition ${
                                    user && review.interactionUsers.includes(user._id) 
                                    ? 'text-pink-500' 
                                    : 'text-gray-500 hover:text-pink-500'
                                }`}
                            >
                                {user && review.interactionUsers.includes(user._id) ? <FaHeart /> : <FaRegHeart />}
                                {review.interactions} Hữu ích
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* --- MODAL VIẾT REVIEW --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 w-full max-w-lg p-6 rounded-2xl border border-gray-700 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    {/* Chọn Sao */}
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="text-3xl transition transform hover:scale-110 focus:outline-none"
                            >
                                <FaStar className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-600"} />
                            </button>
                        ))}
                    </div>
                    
                    {/* Nhập bình luận */}
                    <textarea 
                        className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-orange-500 outline-none resize-none h-32"
                        placeholder="Bạn nghĩ gì về phim này? (Nội dung, diễn viên, kỹ xảo...)"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        required
                    ></textarea>

                    <div className="flex gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition"
                        >
                            Hủy
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold hover:shadow-lg transition transform hover:scale-105"
                        >
                            Gửi đánh giá
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Modal yêu cầu đăng nhập */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={(u) => { setUser(u); setShowAuthModal(false); toast.success("Đăng nhập thành công!"); }} 
      />

    </div>
  );
};

export default ReviewPage;