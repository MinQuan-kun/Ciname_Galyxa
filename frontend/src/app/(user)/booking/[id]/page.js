'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTicketAlt, FaHamburger, FaPlus, FaMinus, FaCheckCircle, FaStar, FaClock, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';

const BookingPage = () => {
  const { id } = useParams();
  const router = useRouter();

  // --- STATE ---
  const [showtime, setShowtime] = useState(null);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // --- STATE TIMER ---
  const HOLD_TIME = 300;
  const [timeLeft, setTimeLeft] = useState(HOLD_TIME);

  useEffect(() => {
    if (selectedSeats.length > 0 && timeLeft > 0) {
      const timerId = setInterval(() => setTimeLeft((p) => p - 1), 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0) {
      handleTimeout();
    }
  }, [selectedSeats, timeLeft]);

  const handleTimeout = () => {
    toast.error("⏱️ Hết thời gian giữ ghế! Vui lòng đặt lại.", { autoClose: 3000 });
    window.location.reload();
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resShowtime, resCombos] = await Promise.all([
          axiosClient.get(`/showtimes/detail/${id}`),
          axiosClient.get('/combos')
        ]);
        setShowtime(resShowtime.data);
        setCombos(resCombos.data);
      } catch (error) {
        toast.error("Lỗi tải dữ liệu!");
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, router]);

  const getSeatPrice = (seatId) => {
    if (!showtime) return 0;
    const seatInfo = showtime.roomId?.seatMap?.find(s => s.id === seatId);
    return showtime.ticketPrice + (seatInfo?.priceSurcharge || 0);
  };

  // Tính toán tiền
  const totalSeatPrice = useMemo(() => selectedSeats.reduce((t, s) => t + getSeatPrice(s), 0), [selectedSeats, showtime]);
  const totalComboPrice = useMemo(() => Object.entries(selectedCombos).reduce((t, [id, q]) => {
    const combo = combos.find(c => c._id === id);
    return t + (combo ? combo.price * q : 0);
  }, 0), [selectedCombos, combos]);
  const finalTotalPrice = totalSeatPrice + totalComboPrice;

  // --- HANDLERS ---
  const handleSeatClick = (seat) => {
    if (showtime?.bookedSeats?.includes(seat.id) || seat.type === 'Hidden') return;
    if (selectedSeats.length === 0) setTimeLeft(HOLD_TIME); // Reset timer khi bắt đầu chọn

    if (selectedSeats.includes(seat.id)) {
      const newSeats = selectedSeats.filter(s => s !== seat.id);
      setSelectedSeats(newSeats);
      if (newSeats.length === 0) setTimeLeft(HOLD_TIME);
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const handleComboChange = (comboId, delta) => {
    setSelectedCombos(prev => {
      const currentQty = prev[comboId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return newQty === 0 ? (({ [comboId]: _, ...rest }) => rest)(prev) : { ...prev, [comboId]: newQty };
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedSeats.length === 0) return toast.warn("Vui lòng chọn ghế!");
      if (!user) return setShowLogin(true);
      setShowUpsellModal(true);
    } else if (currentStep === 2) setCurrentStep(3);
    else if (currentStep === 3) handleSubmitBooking();
  };

  const handleBack = () => {
    if (currentStep === 1) router.back();
    else setCurrentStep(currentStep - 1);
  };

  const handleSubmitBooking = async () => {
    try {
      const formatCombos = Object.entries(selectedCombos).map(([id, qty]) => ({ comboId: id, quantity: qty }));
      await axiosClient.post('/bookings', {
        showtimeId: id, seats: selectedSeats, combos: formatCombos, totalPrice: finalTotalPrice
      });
      toast.success("🎉 Đặt vé thành công!");
      router.push('/profile');
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi đặt vé");
    }
  };

  // --- RENDER HELPERS ---
  const renderSteps = () => (
    <div className="flex items-center justify-center gap-4 text-sm md:text-base font-bold">
      <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-orange-500' : 'text-slate-600'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 1 ? 'border-orange-500 bg-orange-500/20' : 'border-slate-600'}`}>1</div>
        <span className="hidden md:inline">Chọn Ghế</span>
      </div>
      <div className={`w-8 md:w-12 h-0.5 ${currentStep >= 2 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
      <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-orange-500' : 'text-slate-600'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 2 ? 'border-orange-500 bg-orange-500/20' : 'border-slate-600'}`}>2</div>
        <span className="hidden md:inline">Bắp Nước</span>
      </div>
      <div className={`w-8 md:w-12 h-0.5 ${currentStep >= 3 ? 'bg-orange-500' : 'bg-slate-700'}`}></div>
      <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-orange-500' : 'text-slate-600'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep >= 3 ? 'border-orange-500 bg-orange-500/20' : 'border-slate-600'}`}>3</div>
        <span className="hidden md:inline">Thanh Toán</span>
      </div>
    </div>
  );

  if (loading || !showtime) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-32 lg:pb-0">

      {/* HEADER */}
      <header className="bg-slate-900 p-4 border-b border-slate-800 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <FaArrowLeft /> <span className="hidden md:inline">{currentStep === 1 ? 'Thoát' : 'Quay lại'}</span>
          </button>

          <div className="flex items-center gap-4">
            {/* Stepper nhỏ gọn trên header Mobile hoặc Desktop */}
            <div className="hidden md:block">{renderSteps()}</div>
          </div>

          {/* Timer */}
          <div className={`flex items-center gap-2 font-mono font-bold text-lg px-3 py-1.5 rounded-lg border ${timeLeft < 60 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
            <FaClock className={timeLeft < 60 ? 'animate-spin' : ''} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT 2 CỘT (DESKTOP) --- */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">

        {/* CỘT TRÁI: NỘI DUNG CHÍNH (Chiếm 70%) */}
        <div className="flex-1 w-full">

          {/* Mobile Stepper (Hiện nếu màn hình nhỏ) */}
          <div className="md:hidden mb-6">{renderSteps()}</div>

          {/* TAB 1: GHẾ */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-left-5 duration-300">
              <div className="w-full max-w-3xl mb-8 relative">
                <div className="h-2 w-full bg-slate-700 rounded-full shadow-[0_10px_30px_rgba(255,255,255,0.1)]"></div>
                <p className="text-center text-slate-600 text-xs mt-2 uppercase tracking-widest">Màn hình chiếu</p>
              </div>

              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.max(...(showtime.roomId?.seatMap?.map(s => s.number) || [10]))}, minmax(0, 1fr))` }}>
                {showtime.roomId?.seatMap?.map((seat) => {
                  const isBooked = showtime.bookedSeats?.includes(seat.id);
                  const isSelected = selectedSeats.includes(seat.id);
                  const isHidden = seat.type === 'Hidden';
                  return (
                    <button key={seat.id} disabled={isBooked || isHidden} onClick={() => handleSeatClick(seat)}
                      className={`relative w-8 h-8 md:w-10 md:h-10 rounded-t-lg text-[10px] md:text-xs font-bold transition-all flex items-center justify-center border-b-4 
                                    ${isHidden ? 'invisible' : ''}
                                    ${isBooked ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed' :
                          isSelected ? 'bg-orange-600 text-white border-orange-800 shadow-lg scale-110 z-10' :
                            seat.type === 'VIP' ? 'bg-purple-900 text-purple-200 border-purple-800 hover:bg-purple-700' :
                              seat.type === 'Couple' ? 'bg-pink-900 text-pink-200 border-pink-800 hover:bg-pink-700 col-span-2 w-full' :
                                'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'}`}
                    >
                      {seat.type === 'Couple' ? '❤️' : seat.id}
                    </button>
                  );
                })}
              </div>

              {/* Chú thích ghế */}
              <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-slate-700 rounded border-b-2 border-slate-600"></div> Thường</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-purple-900 rounded border-b-2 border-purple-800"></div> VIP</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-pink-900 rounded border-b-2 border-pink-800"></div> Đôi</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-orange-600 rounded border-b-2 border-orange-800"></div> Chọn</div>
                <div className="flex items-center gap-1"><div className="w-4 h-4 bg-slate-800 rounded border-b-2 border-slate-700 opacity-50"></div> Đã bán</div>
              </div>
            </div>
          )}

          {/* TAB 2: COMBO */}
          {currentStep === 2 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-300">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FaHamburger className="text-orange-500" /> Chọn Combo Ưu Đãi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {combos.map(combo => (
                  <div key={combo._id} className={`bg-slate-900 border ${selectedCombos[combo._id] ? 'border-orange-500 bg-slate-800' : 'border-slate-800'} p-4 rounded-xl flex gap-4 transition-all`}>
                    <img src={combo.image || "https://via.placeholder.com/100"} alt={combo.name} className="w-20 h-20 object-cover rounded-lg bg-slate-950" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-white text-sm">{combo.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">{combo.items}</p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-orange-400 font-bold text-sm">{new Intl.NumberFormat('vi-VN').format(combo.price)}đ</span>
                        <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1">
                          <button onClick={() => handleComboChange(combo._id, -1)} className="w-6 h-6 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded text-white disabled:opacity-50" disabled={!selectedCombos[combo._id]}><FaMinus size={8} /></button>
                          <span className="font-bold w-4 text-center text-sm">{selectedCombos[combo._id] || 0}</span>
                          <button onClick={() => handleComboChange(combo._id, 1)} className="w-6 h-6 flex items-center justify-center bg-orange-600 hover:bg-orange-500 rounded text-white"><FaPlus size={8} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THANH TOÁN */}
          {currentStep === 3 && (
            <div className="animate-in fade-in slide-in-from-right-10 duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Xác nhận thanh toán</h2>
                <p className="text-slate-400 text-sm mb-6">Vui lòng kiểm tra lại thông tin vé bên tay phải trước khi tiến hành thanh toán.</p>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:border-orange-500 transition">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-500 flex items-center justify-center"><div className="w-3 h-3 bg-orange-500 rounded-full"></div></div>
                    <div>
                      <h4 className="font-bold text-white">Thanh toán qua ví MoMo</h4>
                      <p className="text-xs text-slate-500">Quét mã QR để thanh toán nhanh chóng</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4 cursor-pointer hover:border-orange-500 transition opacity-50">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-600"></div>
                    <div>
                      <h4 className="font-bold text-white">Thẻ ATM / Visa / Master</h4>
                      <p className="text-xs text-slate-500">Đang bảo trì</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: BOOKING SUMMARY (SIDEBAR) - CHỈ HIỆN TRÊN DESKTOP --- */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden sticky top-24 shadow-2xl">
            {/* Header Phim */}
            <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-900/50">
              <img src={showtime.movieId?.poster} className="w-16 h-24 object-cover rounded-lg shadow-md" alt="Poster" />
              <div className="flex-1">
                <h3 className="font-bold text-white text-base leading-tight mb-1">{showtime.movieId?.title}</h3>
                <p className="text-xs text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded inline-block">
                  {showtime.roomId?.type || 'Standard'} {/* */}
                </p>
              </div>
            </div>

            {/* Chi tiết đơn hàng */}
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2"><FaMapMarkerAlt /> Rạp</span>
                <span className="font-bold text-white">{showtime.roomId?.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 flex items-center gap-2 mt-0.5"><FaCalendarAlt /> Suất</span>
                <div className="text-right">
                  <span className="font-bold text-white block">
                    {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(showtime.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 border-dashed my-2"></div>

              <div className="flex justify-between items-start">
                <span className="text-slate-400 flex items-center gap-2"><FaTicketAlt /> Ghế</span>
                <div className="text-right">
                  <span className="font-bold text-orange-500 block max-w-[120px] break-words text-right">
                    {selectedSeats.length > 0 ? selectedSeats.join(', ') : '...'}
                  </span>
                  {selectedSeats.length > 0 && <span className="text-xs text-slate-500">{new Intl.NumberFormat('vi-VN').format(totalSeatPrice)}đ</span>}
                </div>
              </div>

              {Object.keys(selectedCombos).length > 0 && (
                <div className="space-y-1 pt-1">
                  {Object.entries(selectedCombos).map(([id, qty]) => {
                    const combo = combos.find(c => c._id === id);
                    if (!combo) return null;
                    return (
                      <div key={id} className="flex justify-between text-slate-300 text-xs">
                        <span>{combo.name} <b className="text-white">x{qty}</b></span>
                        <span>{new Intl.NumberFormat('vi-VN').format(combo.price * qty)}đ</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Tổng tiền & Nút bấm */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">Tổng cộng</span>
                <span className="text-xl font-black text-orange-500">{new Intl.NumberFormat('vi-VN').format(finalTotalPrice)}đ</span>
              </div>
              <button
                onClick={handleNext}
                disabled={selectedSeats.length === 0}
                className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition hover:scale-[1.02]"
              >
                {currentStep === 3 ? 'Thanh Toán Ngay' : 'Tiếp Tục'}
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER MOBILE (Chỉ hiện khi màn hình nhỏ < 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] z-30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Tạm tính</p>
            <p className="text-xl font-black text-white">{new Intl.NumberFormat('vi-VN').format(finalTotalPrice)}đ</p>
          </div>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <button onClick={handleBack} className="px-4 py-3 rounded-xl font-bold bg-slate-800 text-white text-sm">Quay lại</button>
            )}
            <button onClick={handleNext} disabled={selectedSeats.length === 0} className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50 text-sm">
              {currentStep === 3 ? 'Xác Nhận' : 'Tiếp Tục'}
            </button>
          </div>
        </div>
      </div>

      {/* POPUP UPSELL */}
      {showUpsellModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md shadow-2xl relative text-center">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
              <FaStar className="text-white text-3xl animate-spin-slow" />
            </div>
            <h3 className="text-2xl font-black text-white mt-8 uppercase">Gợi ý siêu hời!</h3>
            <p className="text-slate-400 mt-2 text-sm">Combo "Best Seller" đang chờ bạn.</p>
            {combos.length > 0 && (
              <div className="mt-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <img src={combos[2].image || "https://via.placeholder.com/150"} alt="" className="w-full h-32 object-cover rounded-lg mb-3" />
                <h4 className="font-bold text-lg text-white">{combos[2].name}</h4>
                <p className="text-orange-500 font-bold text-xl">{new Intl.NumberFormat('vi-VN').format(combos[2].price)}đ</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button onClick={() => { setShowUpsellModal(false); setCurrentStep(2); }} className="py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 font-bold">Bỏ qua</button>
              <button onClick={() => { if (combos.length > 0) handleComboChange(combos[2]._id, 1); setShowUpsellModal(false); setCurrentStep(2); }} className="py-3 rounded-xl bg-orange-600 text-white font-bold">Thêm ngay</button>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLoginSuccess={(u) => { setUser(u); setShowLogin(false); toast.success("Đăng nhập thành công!"); }} />
    </div>
  );
};

export default BookingPage;