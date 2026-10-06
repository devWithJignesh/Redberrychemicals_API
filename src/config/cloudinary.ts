import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'gwtosuci',
  api_key: process.env.CLOUDINARY_API_KEY || '453451237275762',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cUcS5JDxhV182Lj6EZSFuCwpkGo',
  secure: true,
});

export default cloudinary;
