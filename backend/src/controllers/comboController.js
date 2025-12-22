import Combo from '../models/Combo.js';

// 1. Lấy danh sách Combo
export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.find();
    res.status(200).json(combos);
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách combo" });
  }
};

// 2. Tạo Combo mới (Có upload ảnh)
export const createCombo = async (req, res) => {
  try {
    const { name, price, items } = req.body;
    
    // Xử lý ảnh (Nếu dùng Cloudinary/Multer)
    const imagePath = req.file ? req.file.path : ""; 

    const newCombo = new Combo({
      name,
      price,
      items,
      image: imagePath
    });

    await newCombo.save();
    res.status(201).json(newCombo);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo combo: " + error.message });
  }
};

// 3. Xóa Combo
export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    await Combo.findByIdAndDelete(id);
    res.status(200).json({ message: "Đã xóa combo" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa combo" });
  }
};

// 4. Chỉnh sửa Combo
export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    await Combo.findByIdAndUpdate(id);
    res.status(200).json({ message: "Đã sửa combo" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi sửa combo" });
  }
};