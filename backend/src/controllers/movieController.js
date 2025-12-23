import Movie from '../models/Movie.js';
import { deleteImageFromCloudinary } from '../utils/cloudinaryHelper.js';
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
    let { title, description, director, genre, duration, releaseDate, trailer, status } = req.body;

    if (typeof genre === 'string') {
        genre = genre.split(',').map(item => item.trim());
    }
    
    const posterPath = req.files?.poster ? req.files.poster[0].path : req.body.poster;
    const bannerPath = req.files?.banner ? req.files.banner[0].path : req.body.banner;

    const newMovie = new Movie({
        title,
        description,
        director,
        genre,
        duration,
        releaseDate,
        trailer,
        status,
        poster: posterPath,
        banner: bannerPath  
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

export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ message: "Không tìm thấy phim để xóa!" });

    if (movie.poster) await deleteImageFromCloudinary(movie.poster);
    if (movie.banner) await deleteImageFromCloudinary(movie.banner);

    await Movie.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ message: "Đã xóa phim và ảnh liên quan thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa phim: " + error.message });
  }
};

export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    const oldMovie = await Movie.findById(id);
    if (!oldMovie) return res.status(404).json({ message: "Không tìm thấy phim!" });

    if (typeof updateData.genre === 'string') {
        updateData.genre = updateData.genre.split(',').map(item => item.trim());
    }

    if (req.files?.poster) {
        if (oldMovie.poster) await deleteImageFromCloudinary(oldMovie.poster);
        updateData.poster = req.files.poster[0].path;
    }
    
    if (req.files?.banner) {
        if (oldMovie.banner) await deleteImageFromCloudinary(oldMovie.banner);
        updateData.banner = req.files.banner[0].path;
    }

    const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật phim: " + error.message });
  }
};