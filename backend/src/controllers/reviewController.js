import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Movie from '../models/Movie.js';
import Booking from '../models/Booking.js';

// --- HELPER FUNCTION: Tính lại điểm trung bình ---
const updateMovieRating = async (movieId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
      { $group: { _id: '$movieId', avgRating: { $avg: '$rating' } } }
    ]);

    if (stats.length > 0) {
      const newRating = parseFloat(stats[0].avgRating.toFixed(1));
      await Movie.findByIdAndUpdate(movieId, { rating: newRating });
    } else {
      await Movie.findByIdAndUpdate(movieId, { rating: 0 });
    }
  } catch (error) {
    console.error("Lỗi khi update rating:", error);
  }
};

// --- CRUD ---

// 1. Thêm đánh giá mới
export const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id;

    // A. Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá phim này rồi.' });
    }

    // --- TẠM TẮT CHECK ĐIỀU KIỆN XEM PHIM ĐỂ TEST ---
    // B. Kiểm tra đã xem phim chưa
    const bookings = await Booking.find({ 
      userId, 
      status: 'confirmed' 
    }).populate({
      path: 'showtimeId',
      select: 'movieId startTime',
      populate: { path: 'movieId', select: 'duration' }
    });

    let canReview = false;
    const now = new Date();

    for (const booking of bookings) {
      const showtime = booking.showtimeId;
      if (showtime && showtime.movieId && showtime.movieId._id.toString() === movieId) {
        const durationMs = showtime.movieId.duration * 60 * 1000;
        const endTime = new Date(new Date(showtime.startTime).getTime() + durationMs);
        if (now > endTime) {
          canReview = true;
          break;
        }
      }
    }

    if (!canReview) {
      return res.status(403).json({ message: 'Bạn chỉ được đánh giá sau khi đã mua vé và xem hết phim.' });
    }
    // ----------------------------------------------------

    // C. Tạo review
    const newReview = new Review({ userId, movieId, rating, comment });
    await newReview.save();

    // D. Cập nhật rating phim
    await updateMovieRating(movieId);

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi tạo đánh giá', error: error.message });
  }
};

// 2. Sửa đánh giá
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    const review = await Review.findOne({ _id: id, userId });
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await updateMovieRating(review.movieId);

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

// 3. Xóa đánh giá
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = userRole === 'admin' ? { _id: id } : { _id: id, userId };
    const review = await Review.findOneAndDelete(query);
    if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });

    await updateMovieRating(review.movieId);

    res.status(200).json({ message: 'Đã xóa đánh giá.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa', error: error.message });
  }
};

// 4. Like Review
export const toggleInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const index = review.interactionUsers.indexOf(userId);
    if (index === -1) {
      review.interactionUsers.push(userId);
      review.interactions += 1;
    } else {
      review.interactionUsers.splice(index, 1);
      review.interactions -= 1;
    }

    await review.save();
    res.status(200).json({ interactions: review.interactions, isLiked: index === -1 });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tương tác', error: error.message });
  }
};

// --- LOGIC TRANG REVIEW ---

// 5. Lấy Top 10 phim
export const getTopMoviesWithReviews = async (req, res) => {
  try {
    const topMovies = await Movie.find({ status: { $ne: 'Đã kết thúc' } })
      .sort({ rating: -1, createdAt: -1 }) // Ưu tiên điểm cao, nếu bằng điểm thì lấy phim mới nhất
      .limit(10)
      .lean();

    const result = await Promise.all(topMovies.map(async (movie) => {
      const bestReview = await Review.findOne({ movieId: movie._id })
        .sort({ interactions: -1 })
        .populate('userId', 'name avatar')
        .lean();

      return {
        movie,
        bestReview: bestReview || null
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy top phim', error: error.message });
  }
};

// 6. Lấy review theo phim
export const getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movieId })
      .sort({ interactions: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar')
      .lean();

    const total = await Review.countDocuments({ movieId });

    res.status(200).json({
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách review', error: error.message });
  }
};

// 7. Lấy danh sách đánh giá của user hiện tại
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    // Populate movieId để lấy tên phim và poster
    const reviews = await Review.find({ userId })
      .populate('movieId', 'title poster') 
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách đánh giá', error: error.message });
  }
};