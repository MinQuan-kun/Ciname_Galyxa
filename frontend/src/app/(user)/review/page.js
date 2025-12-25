'use client';
import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axios';
// Xóa import toast vì đã dùng notification
import { useRouter } from 'next/navigation'; 
import { FaStar, FaHeart, FaRegHeart, FaUserCircle, FaQuoteLeft, FaPen, FaFilter, FaCrown } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';

const ReviewPage = () => {
  const router = useRouter(); 

  const [topMovies, setTopMovies] = useState([]); 
  const [allMovies, setAllMovies] = useState([]); 
  const [reviews, setReviews] = useState([]);     
  
  const [selectedMovieId, setSelectedMovieId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // State Popup Thông báo
  const [notification, setNotification] = useState(null);

  // --- HÀM TẢI DỮ LIỆU TOP PHIM (Tách ra để dùng lại) ---
  const fetchTopData = async () => {
    try {
      const [resTop, resAll] = await Promise.all([
        axiosClient.get('/reviews/top-movies'),
        axiosClient.get('/movies')
      ]);
      setTopMovies(resTop.data);
      setAllMovies(resAll.data);
    } catch (error) {
      console.error("Lỗi tải trang review:", error);
    }
  };

  // 1. Khởi tạo
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
      
      await fetchTopData(); // Gọi hàm tải dữ liệu
      setLoading(false);
    };
    initData();
  }, []);

  // 2. Fetch reviews khi chọn phim
  useEffect(() => {
    const fetchMovieReviews = async () => {
      if (selectedMovieId === 'ALL') return;
      setLoading(true);
      try {
        const res = await axiosClient.get(`/reviews/movie/${selectedMovieId}`);
        setReviews(res.data.data);
      } catch (error) {
        console.error("Lỗi tải review:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieReviews();
  }, [selectedMovieId]);

  // ... (Giữ nguyên các hàm renderStars, handleLike, getPopupStyles...)
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < rating ? "text-yellow-400" : "text-gray-600"} />
    ));
  };

  const getPopupStyles = (type) => {
    switch(type) {
        case 'success': return { bgHeader: 'bg-green-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path> };
        case 'error': return { bgHeader: 'bg-red-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path> };
        case 'warning': return { bgHeader: 'bg-yellow-600', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path> };
        default: return { bgHeader: 'bg-blue-600', icon: null };
    }
  };
  
  const closeNotification = () => setNotification(null);

  const handleLike = async (reviewId) => {
    if (!user) return setShowAuthModal(true);
    try {
      await axiosClient.post(`/reviews/${reviewId}/interact`);
      setReviews(prev => prev.map(r => {
        if (r._id === reviewId) {
            const isLiked = !r.interactionUsers.includes(user._id);
            const newInteractions = isLiked ? r.interactions + 1 : r.interactions - 1;
            const newUsers = isLiked ? [...r.interactionUsers, user._id] : r.interactionUsers.filter(id => id !== user._id);
            return { ...r, interactions: newInteractions, interactionUsers: newUsers };
        }
        return r;
      }));
    } catch (error) {
      setNotification({ type: 'error', title: 'Lỗi', message: 'Không thể thực hiện tương tác.' });
    }
  };

  // --- XỬ LÝ GỬI REVIEW (ĐÃ SỬA: Refresh lại Top Movies để cập nhật sao) ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return setShowAuthModal(true);

    try {
      await axiosClient.post('/reviews', {
        movieId: selectedMovieId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      setNotification({ 
          type: 'success', 
          title: 'Thành công', 
          message: 'Cảm ơn bạn đã gửi đánh giá!' 
      });

      setIsModalOpen(false);
      setReviewForm({ rating: 5, comment: '' });
      
      // 1. Tải lại danh sách review của phim hiện tại
      const res = await axiosClient.get(`/reviews/movie/${selectedMovieId}`);
      setReviews(res.data.data);

      // 2. QUAN TRỌNG: Tải lại Top Movies để cập nhật số sao mới trên Poster
      await fetchTopData();
      
    } catch (error) {
      if (error.response?.status === 403) {
          setNotification({
              type: 'warning',
              title: 'Chưa đủ điều kiện',
              message: error.response?.data?.message || "Bạn cần xem phim trước khi đánh giá.",
              action: {
                  label: 'Đặt vé ngay',
                  onClick: () => {
                      setNotification(null);
                      router.push('/schedule');
                  }
              }
          });
      } else {
          setNotification({ 
              type: 'error', 
              title: 'Gửi thất bại', 
              message: error.response?.data?.message || "Có lỗi xảy ra." 
          });
      }
    }
  };

  const renderPodium = () => {
    if (topMovies.length === 0) return null;

    const top5 = topMovies.slice(0, 5); 
    const displayOrder = [];
    if(top5[3]) displayOrder.push({ ...top5[3], rank: 4 });
    if(top5[1]) displayOrder.push({ ...top5[1], rank: 2 });
    if(top5[0]) displayOrder.push({ ...top5[0], rank: 1 });
    if(top5[2]) displayOrder.push({ ...top5[2], rank: 3 });
    if(top5[4]) displayOrder.push({ ...top5[4], rank: 5 });

    return (
      <div className="flex items-end justify-center gap-2 md:gap-4 lg:gap-6 mb-20 mt-24 w-full px-4">
        {displayOrder.map((item) => {
          let sizeClass = "w-20 md:w-28 lg:w-36 opacity-80 scale-95 z-10 translate-y-4"; 
          let borderClass = "border-gray-700";
          
          if (item.rank === 1) {
            sizeClass = "w-32 md:w-44 lg:w-56 z-30 scale-110 shadow-[0_0_50px_rgba(234,179,8,0.4)] -translate-y-6";
            borderClass = "border-yellow-500 border-4";
          } else if (item.rank === 2 || item.rank === 3) {
            sizeClass = "w-24 md:w-36 lg:w-44 z-20 scale-100 shadow-2xl";
            borderClass = item.rank === 2 ? "border-slate-300 border-2" : "border-orange-700 border-2";
          }

          return (
            <div 
              key={item.movie._id} 
              onClick={() => setSelectedMovieId(item.movie._id)}
              className={`relative transition-all duration-500 cursor-pointer group flex-shrink-0 ${sizeClass}`}
            >
              {item.rank === 1 && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-3xl md:text-5xl text-yellow-500 animate-bounce drop-shadow-lg z-40">
                  <FaCrown />
                </div>
              )}
              <div className={`relative rounded-xl overflow-hidden border ${borderClass} bg-gray-900 aspect-[2/3] shadow-lg`}>
                <img src={item.movie.poster} alt={item.movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out" />
                <div className={`absolute top-0 left-0 w-6 h-6 md:w-10 md:h-10 flex items-center justify-center font-black text-white text-xs md:text-lg shadow-lg z-20 rounded-br-xl ${item.rank === 1 ? 'bg-yellow-600' : item.rank === 2 ? 'bg-slate-500' : item.rank === 3 ? 'bg-orange-800' : 'bg-gray-800'}`}>
                  #{item.rank}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90 flex flex-col justify-end p-2">
                  <h3 className="text-white font-bold text-[10px] md:text-sm lg:text-base text-center line-clamp-2 leading-tight">{item.movie.title}</h3>
                  <div className="flex justify-center items-center gap-1 text-yellow-400 text-[10px] md:text-xs mt-1">
                    <FaStar /> <span className="font-bold">{item.movie.rating || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 relative">
      
      {/* HEADER & FILTER... */}
      <div className="max-w-6xl mx-auto mb-8 text-center pt-4">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 mb-2">BẢNG XẾP HẠNG PHIM</h1>
        <p className="text-gray-400">Đánh giá bởi cộng đồng người xem thực tế</p>
      </div>

      <div className="max-w-6xl mx-auto mb-12 flex justify-center sticky top-4 z-40">
        <div className="bg-gray-800/90 backdrop-blur-md p-2 pl-4 rounded-full border border-gray-700 shadow-2xl flex items-center gap-3 w-full max-w-xl">
          <FaFilter className="text-orange-500" />
          <span className="text-sm font-bold text-gray-300 whitespace-nowrap hidden md:block">Xem đánh giá:</span>
          <select value={selectedMovieId} onChange={(e) => setSelectedMovieId(e.target.value)} className="bg-transparent text-white w-full outline-none cursor-pointer py-2 font-medium">
            <option value="ALL" className="bg-gray-900">🏆 Top Phim Nổi Bật</option>
            {allMovies.map(m => <option key={m._id} value={m._id} className="bg-gray-900">{m.title}</option>)}
          </select>
        </div>
      </div>

      {/* LIST REVIEW & PODIUM */}
      {selectedMovieId === 'ALL' && (
        <div className="w-full max-w-[1400px] mx-auto px-4">
          {renderPodium()}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-slate-300 mb-4 border-b border-gray-800 pb-2">Các phim nổi bật khác</h3>
            {topMovies.slice(5).map((item, index) => (
              <div key={item.movie._id} className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800 hover:border-gray-600 transition group">
                <span className="text-3xl font-black text-gray-700 w-10 text-center">#{index + 6}</span>
                <img src={item.movie.poster} className="w-12 h-16 object-cover rounded-md" alt={item.movie.title} />
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-white group-hover:text-orange-400 transition">{item.movie.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1 text-yellow-500"><FaStar /> {item.movie.rating}</span>
                    <span>•</span>
                    <span>{item.movie.genre?.join(', ')}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedMovieId(item.movie._id)} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold text-white transition">Xem review</button>
              </div>
            ))}
            {topMovies.length <= 5 && <p className="text-center text-gray-500 italic py-8">Đang cập nhật thêm bảng xếp hạng...</p>}
          </div>
        </div>
      )}

      {selectedMovieId !== 'ALL' && (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-4">
            <div>
               <button onClick={() => setSelectedMovieId('ALL')} className="text-sm text-gray-500 hover:text-white mb-2 transition">← Quay lại Bảng Xếp Hạng</button>
               <h2 className="text-2xl font-bold text-white">Đánh giá từ cộng đồng</h2>
               <p className="text-gray-400 text-sm">Chỉ những người đã xem phim mới được đánh giá</p>
            </div>
            <button onClick={() => { if (!user) setShowAuthModal(true); else setIsModalOpen(true); }} className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition transform hover:scale-105">
              <FaPen /> Viết đánh giá
            </button>
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-900 rounded-xl border border-dashed border-gray-700">
                    <p className="text-gray-500 mb-2">Chưa có đánh giá nào cho phim này.</p>
                    <p className="text-sm text-gray-600">Nếu bạn đã xem phim, hãy chia sẻ cảm nhận nhé!</p>
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
                            <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line mb-4">{review.comment}</p>
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                            <button onClick={() => handleLike(review._id)} className={`flex items-center gap-2 text-sm font-medium transition ${user && review.interactionUsers.includes(user._id) ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}>
                                {user && review.interactionUsers.includes(user._id) ? <FaHeart /> : <FaRegHeart />} {review.interactions} Hữu ích
                            </button>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* MODAL ĐÁNH GIÁ (FORM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-gray-900 w-full max-w-lg p-6 rounded-2xl border border-gray-700 shadow-2xl relative">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Viết đánh giá của bạn</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div className="flex justify-center gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button type="button" key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="text-3xl transition transform hover:scale-110 focus:outline-none">
                                <FaStar className={star <= reviewForm.rating ? "text-yellow-400" : "text-gray-600"} />
                            </button>
                        ))}
                    </div>
                    <textarea className="w-full bg-gray-800 text-white p-4 rounded-xl border border-gray-700 focus:border-orange-500 outline-none resize-none h-32" placeholder="Bạn nghĩ gì về phim này? (Nội dung, diễn viên, kỹ xảo...)" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required></textarea>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition">Hủy</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold hover:shadow-lg transition transform hover:scale-105">Gửi đánh giá</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* AUTH MODAL */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={(u) => { setUser(u); setShowAuthModal(false); setNotification({ type: 'success', title: 'Đăng nhập', message: 'Đăng nhập thành công!' }); }} />

      {/* --- POPUP THÔNG BÁO --- */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all scale-100">
            <div className={`${getPopupStyles(notification.type).bgHeader} p-4 flex items-center gap-3`}>
              <div className={`bg-white text-gray-800 rounded-full p-1`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{getPopupStyles(notification.type).icon}</svg>
              </div>
              <h3 className="text-white font-bold text-lg">{notification.title}</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-300 text-base">{notification.message}</p>
            </div>
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={closeNotification} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition font-medium">Đóng</button>
              {notification.action && (
                  <button onClick={notification.action.onClick} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition font-bold">
                    {notification.action.label}
                  </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReviewPage;