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

// Thêm phim mới
export const createMovie = async (req, res) => {
  try {
    // 1. Lấy dữ liệu dạng chuỗi từ form
    // Vì gửi qua form-data nên các mảng (như genre) có thể bị biến thành chuỗi, cần xử lý lại
    let { title, description, director, genre, duration, releaseDate, trailer, status } = req.body;

    // Xử lý genre: Nếu là chuỗi "Hành động, Hài" -> tách thành mảng ["Hành động", "Hài"]
    if (typeof genre === 'string') {
        genre = genre.split(',').map(item => item.trim());
    }

    // 2. Lấy URL ảnh từ Cloudinary (nếu có upload file)
    // Nếu không upload file thì thử lấy từ req.body.poster (trường hợp gửi link ảnh mạng)
    const poster = req.file ? req.file.path : req.body.poster;

    const newMovie = new Movie({
        title,
        description,
        director,
        genre,
        duration,
        releaseDate,
        trailer,
        status,
        poster
    });

    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm phim", error: error.message });
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