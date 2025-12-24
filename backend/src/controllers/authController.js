import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Đăng ký
export const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Kiểm tra user tồn tại
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại!" });

        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tạo user mới
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone
        });

        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công!" });

    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// Đăng nhập
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Tìm user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng!" });

        // Kiểm tra tài khoản có bị khóa không
        if (user.isLocked) return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa!" });

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu!" });

        // Tạo Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "secret_key", {
            expiresIn: "1d"
        });

        // Lưu token vào Cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        }).status(200).json({
            message: "Đăng nhập thành công!",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                points: user.points
            }
        });


    } catch (error) {
        res.status(500).json({ message: "Lỗi server: " + error.message });
    }
};

// Đăng xuất
export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Đăng xuất thành công!" });
};