import {v2 as cloudinary} from 'cloudinary'

const connectCloudinary = async (params) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME?.trim().replace(/;$/, ''),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim()
    })
}

export default connectCloudinary;