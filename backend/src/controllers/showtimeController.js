import Showtime from '../models/Showtime.js';

// Lấy danh sách suất chiếu theo ID Phim
export const getShowtimesByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    // Populate để lấy luôn thông tin tên Rạp thay vì chỉ hiện ID rạp
    const showtimes = await Showtime.find({ movieId }).populate('theaterId', 'name');
    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch chiếu", error });
  }
};

// Tạo suất chiếu mới (Admin)
export const createShowtime = async (req, res) => {
  try {
    const newShowtime = new Showtime(req.body);
    await newShowtime.save();
    res.status(201).json(newShowtime);
  } catch (error) {
    res.status(500).json(error);
  }
};