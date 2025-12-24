import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // ReviewId sẽ là _id mặc định của MongoDB
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  movieId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Movie', 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    default: '' 
  },
  interactions: { 
    type: Number, 
    default: 0 
  }, // Số lượt like/hữu ích
  interactionUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Lưu danh sách người đã like để tránh spam
}, { timestamps: true });

// Đảm bảo 1 user chỉ đánh giá 1 phim 1 lần (tùy chọn, bỏ đi nếu cho phép spam)
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);