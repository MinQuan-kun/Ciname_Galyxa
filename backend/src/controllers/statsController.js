import Booking from '../models/Booking.js';
import Movie from '../models/Movie.js';
import User from '../models/User.js';

// 1. Lấy số liệu tổng quan (Cards)
export const getSummaryStats = async (req, res) => {
  try {
    // Tổng doanh thu (chỉ tính vé đã thanh toán/confirmed)
    const revenue = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Tổng số vé bán ra
    const tickets = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $unwind: '$seats' }, // Tách mảng ghế để đếm
      { $count: 'totalTickets' }
    ]);

    // Tổng số phim đang chiếu
    const totalMovies = await Movie.countDocuments({ status: 'Đang chiếu' });

    // Tổng số người dùng
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      revenue: revenue[0]?.total || 0,
      tickets: tickets[0]?.totalTickets || 0,
      totalMovies,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 2. Biểu đồ doanh thu
export const getRevenueChart = async (req, res) => {
  try {
    const { range } = req.query; // Lấy tham số range từ URL (?range=day)
    
    const now = new Date();
    let startDate = new Date();
    let dateFormat = "%Y-%m-%d"; // Mặc định nhóm theo Ngày

    // Xử lý logic thời gian
    switch (range) {
      case 'day':
        startDate.setHours(0, 0, 0, 0); // Bắt đầu từ 0h sáng nay
        dateFormat = "%H:00"; // Nhóm theo Giờ (VD: 14:00)
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30); // Lùi lại 30 ngày
        break;
      case 'week':
      default:
        startDate.setDate(now.getDate() - 7); // Lùi lại 7 ngày
    }

    const data = await Booking.aggregate([
      { 
        $match: { 
          status: 'confirmed',
          createdAt: { $gte: startDate } 
        } 
      },
      {
        $group: {
          // Quan trọng: timezone "+07:00" để tính đúng giờ Việt Nam
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: "+07:00" } },
          totalRevenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } } // Sắp xếp thời gian tăng dần
    ]);

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error });
  }
};

// 3. Top Phim bán chạy (Theo doanh thu)
export const getTopMovies = async (req, res) => {
  try {
    const data = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      // Join với bảng Showtime để lấy movieId
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      // Join với bảng Movies để lấy tên phim
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      // Group theo tên phim và tính tổng tiền
      {
        $group: {
          _id: '$movie.title',
          totalRevenue: { $sum: '$totalPrice' },
          ticketsSold: { $sum: { $size: '$seats' } }
        }
      },
      { $sort: { totalRevenue: -1 } }, // Sắp xếp giảm dần
      { $limit: 5 } // Lấy top 5
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error });
  }
};