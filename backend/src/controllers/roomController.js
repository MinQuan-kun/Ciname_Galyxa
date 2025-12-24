// Minh hoàng
// Bổ sung thêm logic cho các controller chính
import Room from '../models/Room.js';
import Showtime from '../models/Showtime.js';

// 1. Lấy tất cả phòng
export const getRooms = async (req, res) => {
  try {
    // Tìm tất cả các phòng trong database
    const rooms = await Room.find();
    
    // Trả về danh sách phòng với mã 200 (OK)
    res.status(200).json(rooms);
  } catch (error) {
    // Nếu có lỗi, trả về mã 500 (Server Error)
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng', error: error.message });
  }
};

// 2. Tạo phòng mới
export const createRoom = async (req, res) => {
  try {
    const { name, type, totalSeats, seatMap, status } = req.body;

    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Tên phòng này đã tồn tại.' });
    }

    // LOGIC MỚI: Tính totalSeats chuẩn xác (loại bỏ ghế ẩn)
    let calculatedTotalSeats = totalSeats;
    if (seatMap && Array.isArray(seatMap)) {
        calculatedTotalSeats = seatMap.filter(s => s.type !== '_HIDDEN').length;
    }

    const newRoom = new Room({
      name,
      type,
      totalSeats: calculatedTotalSeats, // Dùng số đã tính toán
      status,
      seatMap
    });

    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo phòng', error: error.message });
  }
};

// 3. Cập nhật phòng
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // LOGIC MỚI: Nếu có update seatMap, tính lại totalSeats chuẩn xác
    if (updateData.seatMap && Array.isArray(updateData.seatMap)) {
      updateData.totalSeats = updateData.seatMap.filter(s => s.type !== '_HIDDEN').length;
    }

    const updatedRoom = await Room.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedRoom) {
      return res.status(404).json({ message: 'Không tìm thấy phòng để cập nhật' });
    }

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật phòng', error: error.message });
  }
};

// 4. Xóa phòng và Xóa luôn lịch chiếu liên quan
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    // Bước 1: Kiểm tra và lấy thông tin phòng trước khi xóa
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({ message: 'Không tìm thấy phòng để xóa' });
    }

    // Bước 2: Tìm các lịch chiếu sắp bị xóa để báo cáo
    const associatedShowtimes = await Showtime.find({ roomId: id }).populate('movieId', 'title');

    // Bước 3: Xóa phòng
    await Room.findByIdAndDelete(id);

    // Bước 4: Xóa các lịch chiếu liên quan
    await Showtime.deleteMany({ roomId: id });

    // Bước 5: Chuẩn bị dữ liệu trả về (Format gọn gàng)
    const deletedDetails = associatedShowtimes.map(show => ({
        movieTitle: show.movieId ? show.movieId.title : "Phim không xác định",
        startTime: show.startTime
    }));

    res.status(200).json({ 
      success: true,
      deletedRoomName: room.name,
      deletedCount: deletedDetails.length,
      deletedDetails: deletedDetails
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa phòng', error: error.message });
  }
};