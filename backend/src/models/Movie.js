import mongoose from 'mongoose';

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

export default mongoose.model('Movie', movieSchema);