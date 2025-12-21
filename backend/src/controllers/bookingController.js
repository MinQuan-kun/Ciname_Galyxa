import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';

export const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, totalPrice } = req.body;
    const userId = req.user.id; // Lấy từ Token người dùng đăng nhập

    // 1. Tìm suất chiếu
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) return res.status(404).json({ message: "Suất chiếu không tồn tại" });

    // 2. KIỂM TRA TRÙNG GHẾ 
    const isTaken = seats.some(seatId => showtime.bookedSeats.includes(seatId));
    if (isTaken) {
      return res.status(400).json({ message: "Ghế bạn chọn vừa có người khác đặt. Vui lòng chọn ghế khác!" });
    }

    const newBooking = new Booking({
      user: userId,
      showtime: showtimeId,
      seats: seats,
      totalPrice: totalPrice,
      status: 'Success' 
    });

    await newBooking.save();
    
    showtime.bookedSeats.push(...seats);
    await showtime.save();

    res.status(201).json({ message: "Đặt vé thành công!", booking: newBooking });

  } catch (error) {
    res.status(500).json({ message: "Lỗi đặt vé: " + error.message });
  }
};