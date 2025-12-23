import Review from '../models/Review.js';

export const addReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id;
    
    // Kiểm tra xem đã đánh giá chưa (tùy chọn)
    // ...

    const newReview = new Review({ userId, movieId, rating, comment });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đánh giá', error: error.message });
  }
};

export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const reviews = await Review.find({ movieId }).populate('userId', 'name avatar').sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải đánh giá', error: error.message });
  }
};