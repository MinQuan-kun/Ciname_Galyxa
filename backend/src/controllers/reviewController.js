import Review from '../models/Review.js';
import Movie from '../models/Movie.js';

// --- CRUD CƠ BẢN ---

// 1. Thêm đánh giá mới
export const createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.user.id; // Giả sử đã có middleware auth gắn user vào req

    // Kiểm tra xem user đã đánh giá phim này chưa
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'Bạn đã đánh giá phim này rồi.' });
    }

    const newReview = new Review({
      userId,
      movieId,
      rating,
      comment
    });

    await newReview.save();

    // (Optional) Cập nhật lại điểm rating trung bình cho Movie
    await updateMovieRating(movieId);

    res.status(201).json(newReview);
  } catch (error) {
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
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá hoặc bạn không có quyền sửa.' });
    }

    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();

    await updateMovieRating(review.movieId); // Cập nhật lại điểm phim

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật đánh giá', error: error.message });
  }
};

// 3. Xóa đánh giá
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // Giả sử middleware auth trả về role

    const query = userRole === 'admin' ? { _id: id } : { _id: id, userId };
    
    const review = await Review.findOneAndDelete(query);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá để xóa.' });
    }

    await updateMovieRating(review.movieId);

    res.status(200).json({ message: 'Đã xóa đánh giá thành công.' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa đánh giá', error: error.message });
  }
};

// 4. Tương tác (Like) review
export const toggleInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const index = review.interactionUsers.indexOf(userId);
    if (index === -1) {
      // Chưa like -> Like
      review.interactionUsers.push(userId);
      review.interactions += 1;
    } else {
      // Đã like -> Unlike
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

// 5. Lấy Top 5 phim đánh giá cao + Review nổi bật nhất của mỗi phim
export const getTopMoviesWithReviews = async (req, res) => {
  try {
    // Bước 1: Lấy top 5 phim có rating cao nhất từ bảng Movie
    // (Giả sử field 'rating' trong Movie được tính toán chuẩn)
    const topMovies = await Movie.find({ status: { $ne: 'Đã kết thúc' } }) // Lọc phim đang/sắp chiếu
      .sort({ rating: -1 }) // Sắp xếp điểm cao nhất
      .limit(5)
      .lean();

    // Bước 2: Với mỗi phim, tìm 1 review có interaction cao nhất
    const result = await Promise.all(topMovies.map(async (movie) => {
      const bestReview = await Review.findOne({ movieId: movie._id })
        .sort({ interactions: -1 }) // Review nhiều like nhất
        .populate('userId', 'name avatar') // Lấy thông tin người review
        .lean();

      return {
        movie,
        bestReview: bestReview || null // Có thể phim chưa có review nào
      };
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy top phim', error: error.message });
  }
};

// 6. Lấy danh sách Review theo phim (Có lọc & Phân trang)
export const getReviewsByMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // 1 trang 10 review
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ movieId })
      .sort({ interactions: -1, createdAt: -1 }) // Sort theo tương tác cao nhất, sau đó đến mới nhất
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

// --- HELPER FUNCTION ---
// Hàm tính lại điểm trung bình cho phim
const updateMovieRating = async (movieId) => {
  const stats = await Review.aggregate([
    { $match: { movieId: new mongoose.Types.ObjectId(movieId) } },
    { $group: { _id: '$movieId', avgRating: { $avg: '$rating' } } }
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, { rating: stats[0].avgRating.toFixed(1) });
  } else {
    await Movie.findByIdAndUpdate(movieId, { rating: 0 });
  }
};