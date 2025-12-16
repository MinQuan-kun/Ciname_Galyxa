import mongoose from 'mongoose';

export const connectDB = async () => 
{
    try {
        await mongoose.connect(
            process.env.MONGODB_CONNECT_STRING,
            );
        console.log('Lien ket csdl thanh cong');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};