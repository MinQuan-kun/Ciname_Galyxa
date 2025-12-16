import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  director: { type: String },
  genre: { type: [String] }, // Ví dụ: ["Hành động", "Hài"]
  duration: { type: Number, required: true }, // Thời gian
  releaseDate: { type: Date },
  poster: { type: String }, // URL ảnh poster
  trailer: { type: String }, // URL video trailer
  rating: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Đang chiếu', 'Sắp chiếu', 'Đã kết thúc'], 
    default: 'Đang chiếu' 
  }
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);