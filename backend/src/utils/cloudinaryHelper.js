import cloudinary from '../config/cloudinary.js';

export const deleteImageFromCloudinary = async (imageUrl) => {
  if (!imageUrl) return;

  try {
    
    // Tách chuỗi để lấy phần tên file và folder
    const parts = imageUrl.split('/');
    const fileNameWithExtension = parts.pop(); // filename.jpg
    const folderName = parts.pop(); // Movie (hoặc tên folder bạn cấu hình)
    
    const publicId = `${folderName}/${fileNameWithExtension.split('.')[0]}`;

    await cloudinary.uploader.destroy(publicId);
    console.log(`Đã xóa ảnh cũ trên Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Lỗi khi xóa ảnh trên Cloudinary:', error);
  }
};