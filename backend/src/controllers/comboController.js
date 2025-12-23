import Combo from '../models/Combo.js';
import { deleteImageFromCloudinary } from '../utils/cloudinaryHelper.js';
// 1. Lấy tất cả combo
export const getCombos = async (req, res) => {
  try {
    const combos = await Combo.find();
    res.status(200).json(combos);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách combo', error: error.message });
  }
};

// 2. Lấy combo theo ID
export const getComboById = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id);
    if (!combo) return res.status(404).json({ message: 'Không tìm thấy combo' });
    res.status(200).json(combo);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy thông tin combo', error: error.message });
  }
};

// 3. Tạo Combo mới 
export const createCombo = async (req, res) => {
  try {
    // Lấy dữ liệu từ form-data
    const { name, price, items, description, isHot } = req.body;
    
    // Xử lý ảnh: Nếu có file thì lấy path, không thì để rỗng
    const imagePath = req.file ? req.file.path : ""; 

    const newCombo = new Combo({
      name,
      price,
      items,
      description,
      image: imagePath,
      isHot: isHot === 'true' || isHot === true 
    });

    await newCombo.save();
    res.status(201).json(newCombo);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tạo combo", error: error.message });
  }
};

// 4. Cập nhật combo
export const updateCombo = async (req, res) => {
  try {
    const { id } = req.params;
    // ... lấy data body ...
    const { name, price, items, description, isHot } = req.body;
    
    const updates = { name, price, items, description, isHot: isHot === 'true' || isHot === true };

    const oldCombo = await Combo.findById(id);
    if (!oldCombo) return res.status(404).json({ message: "Không tìm thấy Combo" });

    // Nếu có file mới
    if (req.file) {
      // Xóa ảnh cũ
      if (oldCombo.image) await deleteImageFromCloudinary(oldCombo.image);
      // Gán ảnh mới
      updates.image = req.file.path;
    }

    const updatedCombo = await Combo.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(updatedCombo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi sửa combo", error: error.message });
  }
};

// 5. Xóa combo
export const deleteCombo = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id);
    if (combo && combo.image) {
        await deleteImageFromCloudinary(combo.image);
    }
    await Combo.findByIdAndDelete(id);
    res.status(200).json({ message: 'Đã xóa combo' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa combo', error: error.message });
  }
};