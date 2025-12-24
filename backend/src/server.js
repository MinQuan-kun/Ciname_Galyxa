import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import kết nối DB
import { connectDB } from "./config/db.js";
// Import Routes
import movieRoutes from './routes/MovieRoutes.js';
import showtimeRoutes from './routes/ShowtimeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/RoomRoutes.js';
import userRoutes from './routes/UserRoutes.js';
import comboRoutes from './routes/ComboRoutes.js';
import bookingRoutes from './routes/BookingRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import reviewRoutes from './routes/ReviewRoutes.js';
import rewardRoutes from './routes/rewardRoutes.js';
dotenv.config();

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 5001;

// Kết nối Database
connectDB();

// Middleware (Bộ lọc)
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://ciname-galyxa.onrender.com",
        process.env.FRONTEND_URL
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routing (Định tuyến)
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/rewards', rewardRoutes);

// Route mặc định
app.get('/', (req, res) => {
    res.send('API Rạp Chiếu Phim Bất Ổn đang chạy... 🚀');
});

// Chạy server
app.listen(PORT, () => {
    console.log(` Server đang chạy tại http://localhost:${PORT}`);
});

