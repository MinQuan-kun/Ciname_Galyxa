import jwt from 'jsonwebtoken';

// 1. Middleware Xác thực (Kiểm tra xem đã đăng nhập chưa)
export const verifyToken = (req, res, next) => {
    // Lấy token từ cookie (nhờ cookie-parser)
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
    }

    try {
        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Gắn thông tin user vào request để dùng ở các bước sau
        req.user = decoded; 
        
        next(); // Cho phép đi tiếp
    } catch (error) {
        return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn!" });
    }
};

// 2. Middleware Phân quyền
export const isAdmin = (req, res, next) => {
    // Hàm này chạy SAU verifyToken nên đã có req.user
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Truy cập bị từ chối! Bạn không phải là Admin." });
    }
};