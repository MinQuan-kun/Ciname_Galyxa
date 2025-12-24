'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosClient from '@/api/axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTicketAlt, FaHamburger, FaPlus, FaMinus, FaCheckCircle, FaClock, FaCalendarAlt, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import AuthModal from '@/components/AuthModal';

// 1. CẤU HÌNH MÀU SẮC GHẾ (GIỐNG ADMIN)
const SEAT_TYPES = {
  Standard: { color: 'bg-blue-600', label: 'Thường', price: 0 },
  VIP: { color: 'bg-yellow-500', label: 'VIP', price: 20000 },
  Couple: { color: 'bg-pink-500', label: 'Đôi', price: 50000 },
  _HIDDEN: { color: 'invisible', label: 'Trống', price: 0 }
};

const BookingPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const MY_BANK_INFO = {
    BANK_ID: "MB",
    ACCOUNT_NO: "0966846502",
    ACCOUNT_NAME: "NGUYEN HUU MINH QUAN",
    TEMPLATE: "compact2"
  };

  // --- STATE ---
  const [showtime, setShowtime] = useState(null);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedCombos, setSelectedCombos] = useState({});

  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpsellModal, setShowUpsellModal] = useState(false);

  // --- STATE TIMER ---
  const HOLD_TIME = 300;
  const [timeLeft, setTimeLeft] = useState(HOLD_TIME);

  const suggestedCombos = useMemo(() => {
    if (combos.length === 0) return [];
    const hots = combos.filter(c => c.isHot);
    return hots.length > 0 ? hots.slice(0, 2) : combos.slice(0, 2);
  }, [combos]);

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

  const totalSeatPrice = useMemo(() => selectedSeats.reduce((t, s) => t + getSeatPrice(s), 0), [selectedSeats, showtime]);
  const totalComboPrice = useMemo(() => Object.entries(selectedCombos).reduce((t, [id, q]) => {
    const combo = combos.find(c => c._id === id);
    return t + (combo ? combo.price * q : 0);
  }, 0), [selectedCombos, combos]);
  const finalTotalPrice = totalSeatPrice + totalComboPrice;

  // --- HANDLERS ---
  const handleSeatClick = (seat) => {
    if (showtime?.bookedSeats?.includes(seat.id) || seat.type === '_HIDDEN') return;
    if (selectedSeats.length === 0) setTimeLeft(HOLD_TIME);

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
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setShowQRModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) router.back();
    else setCurrentStep(currentStep - 1);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const formatCombos = Object.entries(selectedCombos).map(([id, qty]) => {
        const c = combos.find(i => i._id === id);
        return { comboId: id, quantity: qty, name: c?.name, price: c?.price };
      });

      await axiosClient.post('/bookings', {
        showtimeId: id,
        seats: selectedSeats,
        combos: formatCombos,
        totalPrice: finalTotalPrice,
        paymentMethod: 'Bank'
      });

      toast.success("Thanh toán thành công! Vé đã được lưu.");
      router.push('/profile');

    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi đặt vé!");
      setIsProcessing(false);
      setShowQRModal(false);
    }
  };

  const getQRCodeUrl = () => {
    const addInfo = `VePhim ${user?.phone || 'Guest'}`;
    return `https://img.vietqr.io/image/${MY_BANK_INFO.BANK_ID}-${MY_BANK_INFO.ACCOUNT_NO}-${MY_BANK_INFO.TEMPLATE}.png?amount=${finalTotalPrice}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(MY_BANK_INFO.ACCOUNT_NAME)}`;
  };

  // --- RENDER STEPPER ---
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

  // Lấy danh sách hàng ghế duy nhất từ DB
  const seatMap = showtime.roomId?.seatMap || [];
  const uniqueRows = [...new Set(seatMap.map(s => s.row))];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-32 lg:pb-0">

      {/* HEADER */}
      <header className="bg-slate-900 p-4 border-b border-slate-800 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition">
            <FaArrowLeft /> <span className="hidden md:inline">{currentStep === 1 ? 'Thoát' : 'Quay lại'}</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="hidden md:block">{renderSteps()}</div>
          </div>

          <div className={`flex items-center gap-2 font-mono font-bold text-lg px-3 py-1.5 rounded-lg border ${timeLeft < 60 ? 'bg-red-900/50 border-red-500 text-red-400 animate-pulse' : 'bg-slate-800 border-slate-700 text-blue-400'}`}>
            <FaClock className={timeLeft < 60 ? 'animate-spin' : ''} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">

        <div className="flex-1 w-full">
          <div className="md:hidden mb-6">{renderSteps()}</div>

          {/* STEP 1: GHẾ */}
          {currentStep === 1 && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-left-5 duration-300">

              {/* MÀN HÌNH (Khớp style Admin) */}
              <div className="w-2/3 bg-gradient-to-b from-gray-700 to-transparent h-12 mb-12 rounded-t-[50%] opacity-50 relative shadow-[0_-5px_20px_rgba(255,255,255,0.1)] border-t border-gray-600">
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 tracking-[0.2em] uppercase font-bold">Màn hình</span>
              </div>

              {/* SƠ ĐỒ GHẾ (Render theo Row giống Admin) */}
              <div className="flex flex-col gap-1.5 overflow-x-auto w-full items-center pb-8 min-w-max"> {/* Sửa: gap-1.5 và min-w-max */}
                {uniqueRows.map(rowLabel => (
                  <div key={rowLabel} className="flex items-center justify-center gap-1.5"> {/* Sửa: gap-1.5 */}

                    {seatMap.filter(s => s.row === rowLabel).map(seat => {
                      const isBooked = showtime.bookedSeats?.includes(seat.id);
                      const isSelected = selectedSeats.includes(seat.id);
                      const seatTypeInfo = SEAT_TYPES[seat.type] || SEAT_TYPES.Standard;

                      return (
                        <button
                          key={seat.id}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked || seat.type === '_HIDDEN'}
                          className={`
                                        /* Kích thước & Shape giống Admin */
                                        w-7 h-7                 /* Kích thước: 28px */
                                        text-[9px]              /* Cỡ chữ nhỏ */
                                        rounded                 /* Bo góc nhẹ */
                                        
                                        flex items-center justify-center 
                                        font-bold transition-all duration-200
                                        border border-white/10 shadow-sm
                                        
                                        /* Ẩn ghế trống */
                                        ${seat.type === '_HIDDEN' ? 'invisible' : ''}
                                        
                                        ${isBooked
                              ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-gray-700' // Đã bán
                              : isSelected
                                ? 'bg-orange-600 text-white scale-110 shadow-[0_0_10px_orange] z-10 border-orange-500' // Đang chọn
                                : seatTypeInfo.color + ' text-white/90 hover:brightness-125' // Màu mặc định theo loại
                            }

                                        /* Xử lý ghế đôi: (28px * 2) + gap 6px = 62px */
                                        ${seat.type === 'Couple' ? 'w-[62px]' : ''}
                                    `}
                          title={`Ghế ${seat.id} - ${seatTypeInfo.label} - ${new Intl.NumberFormat('vi-VN').format(getSeatPrice(seat.id))}đ`}
                        >
                          {/* Hiển thị ID ghế (A1, A2...) kể cả ghế đôi */}
                          {seat.type !== '_HIDDEN' && seat.id}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* CHÚ THÍCH (Đồng bộ màu) */}
              <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-400 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2"><div className={`w-5 h-5 rounded ${SEAT_TYPES.Standard.color}`}></div> Thường</div>
                <div className="flex items-center gap-2"><div className={`w-5 h-5 rounded ${SEAT_TYPES.VIP.color}`}></div> VIP</div>
                <div className="flex items-center gap-2"><div className={`w-5 h-5 rounded ${SEAT_TYPES.Couple.color}`}></div> Đôi</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-orange-600 shadow-[0_0_5px_orange]"></div> Đang chọn</div>
                <div className="flex items-center gap-2"><div className="w-5 h-5 rounded bg-gray-800 border border-gray-600"></div> Đã bán</div>
              </div>
            </div>
          )}

          {/* STEP 2 & 3 GIỮ NGUYÊN ... */}
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

          {currentStep === 3 && (
            <div className="max-w-4xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-right-10">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
                <h2 className="text-2xl font-bold mb-2 text-white">Xác nhận & Thanh toán</h2>
                <p className="text-slate-400 mb-8">Vui lòng mở app ngân hàng để quét mã QR bên dưới</p>
                <div className="flex justify-center mb-8">
                  <div className="w-80 h-80 md:w-96 md:h-96 bg-white rounded-lg overflow-hidden relative shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    <img src={getQRCodeUrl()} alt="VietQR Payment" className={`w-full h-full object-contain p-2 transition duration-500 ${isProcessing ? 'blur-sm scale-110' : ''}`} />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20">
                        <FaSpinner className="animate-spin text-5xl text-orange-500 mb-3" />
                        <span className="font-bold text-orange-600 animate-pulse">Đang xử lý...</span>
                      </div>
                    )}
                  </div>
                </div>
                <button disabled={isProcessing} onClick={handleConfirmPayment} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-12 rounded-full shadow-lg hover:scale-105 transition active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 mx-auto text-lg w-full max-w-md">
                  {isProcessing ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {isProcessing ? 'Đang kiểm tra giao dịch...' : 'Xác nhận đã chuyển khoản'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- CỘT PHẢI: BOOKING SUMMARY --- */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden sticky top-24 shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex gap-4 bg-slate-900/50">
              <img src={showtime.movieId?.poster} className="w-16 h-24 object-cover rounded-lg shadow-md" alt="Poster" />
              <div className="flex-1">
                <h3 className="font-bold text-white text-base leading-tight mb-1">{showtime.movieId?.title}</h3>
                <p className="text-xs text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded inline-block">{showtime.roomId?.type || 'Standard'}</p>
              </div>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-2"><FaMapMarkerAlt /> Rạp</span>
                <span className="font-bold text-white">{showtime.roomId?.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 flex items-center gap-2 mt-0.5"><FaCalendarAlt /> Suất</span>
                <div className="text-right">
                  <span className="font-bold text-white block">{new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-xs text-slate-500">{new Date(showtime.startTime).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit' })}</span>
                </div>
              </div>
              <div className="border-t border-slate-800 border-dashed my-2"></div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 flex items-center gap-2"><FaTicketAlt /> Ghế</span>
                <div className="text-right">
                  <span className="font-bold text-orange-500 block max-w-[120px] break-words text-right">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '...'}</span>
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
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400 text-sm">Tổng cộng</span>
                <span className="text-xl font-black text-orange-500">{new Intl.NumberFormat('vi-VN').format(finalTotalPrice)}đ</span>
              </div>
              {currentStep !== 3 && (
                <button
                  onClick={handleNext}
                  disabled={selectedSeats.length === 0}
                  className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition hover:scale-[1.02]"
                >
                  Tiếp Tục
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER MOBILE */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 shadow-[0_-5px_30px_rgba(0,0,0,0.5)] z-30">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Tạm tính</p>
            <p className="text-xl font-black text-white">{new Intl.NumberFormat('vi-VN').format(finalTotalPrice)}đ</p>
          </div>
          <div className="flex gap-2">
            {currentStep > 1 && <button onClick={handleBack} className="px-4 py-3 rounded-xl font-bold bg-slate-800 text-white text-sm">Quay lại</button>}
            <button onClick={handleNext} disabled={selectedSeats.length === 0} className="bg-orange-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg disabled:opacity-50 text-sm">
              {currentStep === 3 ? 'Xác Nhận' : 'Tiếp Tục'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL GỢI Ý */}
      {showUpsellModal && suggestedCombos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 w-full max-w-lg rounded-2xl p-6 border border-slate-700 shadow-2xl relative">
            <button onClick={() => { setShowUpsellModal(false); setCurrentStep(2); }} className="absolute top-4 right-4 text-slate-400 hover:text-white">✕</button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 uppercase">🔥 Ưu đãi Hot hôm nay</h3>
              <p className="text-slate-400 text-sm mt-1">Thêm ngay Combo để trải nghiệm điện ảnh trọn vẹn!</p>
            </div>
            <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
              {suggestedCombos.map((combo) => {
                const isSelected = selectedCombos[combo._id] > 0;
                return (
                  <div key={combo._id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex gap-4 items-center group hover:border-orange-500/50 transition">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <img src={combo.image || "https://via.placeholder.com/150"} alt={combo.name} className="w-full h-full object-cover rounded-lg" />
                      {combo.isHot && <div className="absolute -top-2 -left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">HOT</div>}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-md line-clamp-1">{combo.name}</h4>
                      <p className="text-xs text-gray-400 line-clamp-1 mb-1">{combo.items}</p>
                      <p className="text-orange-400 font-bold">{new Intl.NumberFormat('vi-VN').format(combo.price)}đ</p>
                    </div>
                    <button onClick={() => { if (!isSelected) { handleComboChange(combo._id, 1); toast.success(`Đã thêm ${combo.name}`); } }} className={`px-4 py-2 rounded-lg font-bold text-sm transition shadow-lg ${isSelected ? 'bg-green-600 text-white cursor-default' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/20'}`}>
                      {isSelected ? <span className="flex items-center gap-1"><FaCheckCircle /> Đã chọn</span> : 'Thêm +'}
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setShowUpsellModal(false); setCurrentStep(2); }} className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition border border-slate-600">Tiếp tục thanh toán ➔</button>
          </div>
        </div>
      )}

      <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} onLoginSuccess={(u) => { setUser(u); setShowLogin(false); toast.success("Đăng nhập thành công!"); }} />
    </div>
  );
};

export default BookingPage;