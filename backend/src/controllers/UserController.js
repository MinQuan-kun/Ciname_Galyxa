// Thái bình, Bổ sung logic cho các controller lưu ý là không lấy mật khẩu, và 3 hàm get update, delete là dành cho admin
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { deleteImageFromCloudinary } from '../utils/cloudinaryHelper.js';

// 1. Lấy tất cả user (có tính điểm lên hạng từ Booking)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').lean();
    
    // Tính điểm lên hạng cho mỗi user từ tổng pointsEarned trong Booking
    const rankPointsData = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { 
        $group: { 
          _id: '$userId', 
          rankPoints: { $sum: '$pointsEarned' } 
        } 
      }
    ]);
    
    // Tạo map userId -> rankPoints để lookup nhanh
    const rankPointsMap = {};
    rankPointsData.forEach(item => {
      rankPointsMap[item._id.toString()] = item.rankPoints;
    });
    
    // Gán rankPoints cho mỗi user
    const usersWithRankPoints = users.map(user => ({
      ...user,
      rankPoints: rankPointsMap[user._id.toString()] || 0
    }));
    
    res.status(200).json(usersWithRankPoints);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng', error: error.message });
  }
};

// 2. Cập nhật User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Only allow updating isLocked for admin
    const allowedUpdates = ['isLocked'];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }
    const user = await User.findByIdAndUpdate(id, filteredUpdates, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật người dùng', error: error.message });
  }
};

// 3. Xóa User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.status(200).json({ message: 'Người dùng đã được xóa' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa người dùng', error: error.message });
  }
};

// 4. Lấy profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy hồ sơ', error: error.message });
  }
};

// 5. Cập nhật profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; 
    const updates = req.body;
    
    // Allow updating name, email, phone, password
    const allowedUpdates = ['name', 'email', 'phone', 'password'];
    const filteredUpdates = {};
    
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Xử lý mật khẩu
    if (filteredUpdates.password) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      filteredUpdates.password = await bcrypt.hash(filteredUpdates.password, salt);
    }
    
    // Xử lý Avatar
    if (req.file) {
      const oldUser = await User.findById(userId);
      
      // Xóa ảnh cũ 
      if (oldUser.avatar && !oldUser.avatar.includes("ui-avatars.com")) { 
          await deleteImageFromCloudinary(oldUser.avatar);
      }
      
      filteredUpdates.avatar = req.file.path; 
    }

    const user = await User.findByIdAndUpdate(userId, filteredUpdates, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật hồ sơ', error: error.message });
  }
};

// 6. Lấy user theo ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng', error: error.message });
  }
};
// 7. Upload Avatar
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'Vui lòng chọn ảnh để tải lên' });
    }
    const currentUser = await User.findById(userId);

    if (!currentUser) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (currentUser.avatar && !currentUser.avatar.includes('ui-avatars.com')) {
        await deleteImageFromCloudinary(currentUser.avatar);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { avatar: req.file.path } }, 
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Cập nhật ảnh đại diện thành công',
      avatar: updatedUser.avatar
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật ảnh đại diện', error: error.message });
  }
};