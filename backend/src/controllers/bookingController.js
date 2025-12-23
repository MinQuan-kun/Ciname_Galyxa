import Booking from '../models/Booking.js';
import Showtime from '../models/Showtime.js';
// Tạo đơn
export const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats, combos, totalPrice, paymentMethod } = req.body;
    const userId = req.user.id;

    // 1. Tìm suất chiếu để lấy thông tin giờ chiếu
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: "Suất chiếu không tồn tại" });
    }

    const currentTime = new Date();
    const showtimeStart = new Date(showtime.startTime);

    // Nếu hiện tại đã quá giờ chiếu
    if (currentTime >= showtimeStart) {
      return res.status(400).json({ 
        message: "Suất chiếu đã bắt đầu. Vui lòng chọn suất khác!" 
      });
    }

    // 2.Xử lý tranh chấp
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtimeId,
        bookedSeats: { $nin: seats }
      },
      {
        $push: { bookedSeats: { $each: seats } }
      },
      { new: true }
    );

    if (!updatedShowtime) {
      return res.status(400).json({ 
        message: "Rất tiếc! Một trong các ghế bạn chọn vừa có người khác đặt thành công." 
      });
    }

    // 3. Tạo đơn
    const newBooking = new Booking({
      userId,
      showtimeId,
      seats,
      combos,
      totalPrice,
      paymentMethod: paymentMethod || 'QRCode',
      status: 'confirmed'
    });

    await newBooking.save();

    
    res.status(201).json({ message: "Đặt vé thành công!", booking: newBooking });

  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: "Lỗi hệ thống: " + error.message });
  }
};

// Lấy lịch sử đặt vé
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('showtimeId', 'startTime room') 
      .populate({
        path: 'showtimeId',
        populate: { path: 'movieId', select: 'title poster' } 
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy lịch sử vé', error: error.message });
  }
};