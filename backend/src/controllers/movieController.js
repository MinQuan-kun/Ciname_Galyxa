import Movie from '../models/Movie.js';

// Lấy danh sách phim
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server rồi má ơi!", error });
  }
};

// Thêm phim mới (Dành cho Admin)
export const createMovie = async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: "Không thêm được phim đâu!", error });
  }
};

// Lấy chi tiết 1 phim
export const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if(!movie) return res.status(404).json({message: "Phim này bay màu rồi!"});
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json(error);
    }
}