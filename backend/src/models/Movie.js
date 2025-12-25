import mongoose from 'mongoose';
import Review from './Review.js'; // <--- 1. Import Model Review

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  director: { type: String },
  genre: { type: [String] },
  duration: { type: Number, required: true },
  releaseDate: { type: Date }, // Ngày khởi chiếu
  
  poster: { type: String }, // Ảnh dọc
  banner: { type: String }, // Ảnh ngang
  
  trailer: { type: String },
  rating: { type: Number, default: 0 },

  // 1. Phân loại độ tuổi (Rate)
  ageLimit: { 
    type: String, 
    enum: ['P', 'K', 'T13', 'T16', 'T18', 'C'], 
    default: 'P' 
  },
  
  // 2. Chú thích thêm 
  note: { type: String }, 
  
  status: { 
    type: String, 
    enum: ['Đang chiếu', 'Sắp chiếu', 'Đã kết thúc'], 
    default: 'Đang chiếu' 
  }
}, { timestamps: true });

// --- 2. MIDDLEWARE TỰ ĐỘNG XÓA REVIEW KHI XÓA PHIM ---
// Hook này chạy SAU KHI một phim bị xóa bằng hàm findByIdAndDelete hoặc findOneAndDelete
movieSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      // Tìm và xóa tất cả Review có movieId trùng với _id của phim vừa xóa
      const result = await Review.deleteMany({ movieId: doc._id });
      console.log(`[CleanUp] Đã xóa phim "${doc.title}" và ${result.deletedCount} đánh giá liên quan.`);
    } catch (error) {
      console.error('[CleanUp] Lỗi khi xóa review liên quan:', error);
    }
  }
});

export default mongoose.model('Movie', movieSchema);