import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 }, // 1 đến 5 sao
  comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);