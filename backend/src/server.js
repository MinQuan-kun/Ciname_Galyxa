import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import kết nối DB
import { connectDB } from "./config/db.js";

// Import Routes
import movieRoutes from './routes/movieRoutes.js';
import showtimeRoutes from './routes/ShowtimeRoutes.js';
// Sau này import thêm userRoutes, bookingRoutes...

dotenv.config();

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 5001;

// Kết nối Database
connectDB();

// Middleware (Bộ lọc)
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // Cho phép Frontend gọi API
app.use(express.json()); // Để đọc được JSON từ body request
app.use(cookieParser());

// Routing (Định tuyến)
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);

// Route mặc định
app.get('/', (req, res) => {
  res.send('API Rạp Chiếu Phim Bất Ổn đang chạy... 🚀');
});

// Chạy server
app.listen(PORT, () => {
  console.log(`🏃 Server đang chạy tại http://localhost:${PORT}`);
});