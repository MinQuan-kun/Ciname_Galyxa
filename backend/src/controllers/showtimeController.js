// Minh hoàng 
// Bổ sung thêm logic cho các controller chính

// Đã import dùm các model cần thiết
import Showtime from '../models/Showtime.js';
import Movie from '../models/Movie.js';
import Room from '../models/Room.js';

// --- HÀM HỖ TRỢ ---
// Kiểm tra trùng lịch chiếu
const checkOverlap = async (roomId, startTime, movieId, excludeShowtimeId = null) => {
  // 1. Lấy thông tin phim mới để biết thời lượng
  const movieObj = await Movie.findById(movieId);
  if (!movieObj) throw new Error("Không tìm thấy phim này");

  // Tính thời gian kết thúc của suất chiếu MỚI
  const newStart = new Date(startTime);
  const newEnd = new Date(newStart.getTime() + movieObj.duration * 60000);

  // 2. Tìm các suất chiếu đã có trong cùng phòng chiếu đó (theo roomId)
  const startOfDay = new Date(newStart);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(newStart);
  endOfDay.setHours(23, 59, 59, 999);

  const query = {
    roomId: roomId, // Sử dụng roomId
    startTime: { $gte: startOfDay, $lte: endOfDay }
  };

  // Nếu là update thì loại trừ chính nó ra
  if (excludeShowtimeId) {
    query._id = { $ne: excludeShowtimeId };
  }

  const existingShowtimes = await Showtime.find(query).populate('movieId');

  // 3. Duyệt qua từng suất cũ để kiểm tra va chạm
  for (const show of existingShowtimes) {
    if (!show.movieId) continue; 

    const existingStart = new Date(show.startTime);
    const existingDuration = show.movieId.duration; 
    const existingEnd = new Date(existingStart.getTime() + existingDuration * 60000);

    // Công thức kiểm tra giao nhau
    if (newStart < existingEnd && newEnd > existingStart) {
      return {
        isOverlap: true,
        message: `Trùng lịch với suất chiếu lúc ${existingStart.toLocaleTimeString()} của phim ${show.movieId.title}`
      };
    }
  }

  return { isOverlap: false };
};

// --- CONTROLLER CHÍNH ---

// 1. Lấy danh sách suất chiếu (Theo phim)
export const getShowtimes = async (req, res) => {
  try {
    const { movieId } = req.params;

    // Populate 'roomId' thay vì 'theaterId'
    const showtimes = await Showtime.find({ movieId })
      .populate('roomId', 'name type') // Lấy tên và loại phòng từ Room
      .populate('movieId', 'title duration') 
      .sort({ startTime: 1 });

    res.status(200).json(showtimes);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách: " + error.message });
  }
};

// 2. Tạo lịch chiếu mới 
export const createShowtime = async (req, res) => {
  try {
    // Nhận roomId từ client
    const { movieId, roomId, startTime, ticketPrice } = req.body;

    if (!movieId || !roomId || !startTime || !ticketPrice) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra Room tồn tại
    const roomExists = await Room.findById(roomId);
    if (!roomExists) {
      return res.status(404).json({ message: "Phòng chiếu không tồn tại!" });
    }

    // Kiểm tra trùng lịch
    const overlapCheck = await checkOverlap(roomId, startTime, movieId);
    if (overlapCheck.isOverlap) {
      return res.status(400).json({ message: overlapCheck.message });
    }

    const newShowtime = new Showtime({
      movieId,
      roomId, // Lưu roomId vào database
      startTime,
      ticketPrice
    });

    const savedShowtime = await newShowtime.save();
    res.status(201).json(savedShowtime);

  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo lịch: " + error.message });
  }
};

// 3. Xóa lịch chiếu
export const deleteShowtime = async (req, res) => {
  try {
    const { id } = req.params;
    
    const showtime = await Showtime.findById(id);
    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy lịch chiếu" });
    }

    if (showtime.bookedSeats && showtime.bookedSeats.length > 0) {
      return res.status(400).json({ message: "Không thể xóa suất chiếu đã có người đặt vé!" });
    }

    await Showtime.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xóa lịch chiếu thành công" });

  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa: " + error.message });
  }
};

// 4. Chỉnh sửa lịch chiếu
export const updateShowTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { movieId, roomId, startTime } = req.body;

    const showtime = await Showtime.findById(id);
    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy lịch chiếu" });
    }

    // Kiểm tra phòng nếu có thay đổi
    if (roomId && roomId !== showtime.roomId.toString()) {
        const roomExists = await Room.findById(roomId);
        if (!roomExists) {
            return res.status(404).json({ message: "Phòng chiếu mới không tồn tại!" });
        }
    }

    const checkMovieId = movieId || showtime.movieId;
    const checkRoomId = roomId || showtime.roomId;
    const checkStartTime = startTime || showtime.startTime;

    // Check trùng lịch
    if (startTime || roomId || movieId) {
       const overlapCheck = await checkOverlap(checkRoomId, checkStartTime, checkMovieId, id);
       if (overlapCheck.isOverlap) {
         return res.status(400).json({ message: overlapCheck.message });
       }
    }

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json(updatedShowtime);

  } catch (error) {
    res.status(500).json({ message: "Lỗi sửa: " + error.message });
  }
};

export const getShowtimeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Populate để lấy luôn thông tin Phim (tên, ảnh) và Phòng (sơ đồ ghế)
    const showtime = await Showtime.findById(id)
      .populate('movieId') 
      .populate('roomId');

    if (!showtime) {
      return res.status(404).json({ message: "Không tìm thấy suất chiếu" });
    }

    res.status(200).json(showtime);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

// 5. Lấy TẤT CẢ lịch chiếu, nhóm theo Phim (Sắp xếp tên phim A->Z)
export const getAllShowtimes = async (req, res) => {
  try {
    // Bước 1: Lấy tất cả suất chiếu, populate thông tin Phim và Phòng
    // Sắp xếp suất chiếu theo thời gian tăng dần để hiển thị đẹp hơn
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration poster') // Lấy tên, thời lượng, ảnh phim
      .populate('roomId', 'name type')              // Lấy tên, loại phòng
      .sort({ startTime: 1 });

    // Bước 2: Nhóm suất chiếu theo ID phim
    const showtimesByMovie = {};

    showtimes.forEach((show) => {
      // Bỏ qua nếu dữ liệu phim bị lỗi hoặc phim đã bị xóa
      if (!show.movieId) return;

      const movieId = show.movieId._id.toString();

      // Nếu phim này chưa có trong danh sách nhóm, thì khởi tạo
      if (!showtimesByMovie[movieId]) {
        showtimesByMovie[movieId] = {
          movie: show.movieId, // Thông tin phim
          showtimes: []        // Danh sách suất chiếu của phim này
        };
      }

      // Thêm suất chiếu vào danh sách của phim
      showtimesByMovie[movieId].showtimes.push({
        _id: show._id,
        roomId: show.roomId,
        startTime: show.startTime,
        ticketPrice: show.ticketPrice,
        bookedSeats: show.bookedSeats
      });
    });

    // Bước 3: Chuyển từ Object sang Array để sắp xếp
    const result = Object.values(showtimesByMovie);

    // Bước 4: Sắp xếp danh sách phim theo tên từ A -> Z
    result.sort((a, b) => a.movie.title.localeCompare(b.movie.title));

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách tổng hợp: " + error.message });
  }
};