import jwt from "jsonwebtoken";
import User from "../model/User.js";
import bcrypt from "bcryptjs"

// Register user : /api/user/register
export const register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password) {
            return res.json({success: false, message: "Missing details!"});
        }

        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.json({success: false, message: "User already exists!"});
        }

        // Mã hóa mk
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({name, email, password: hashedPassword});
        
        // tạo token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        // Giữ phiên đăng nhập
        res.cookie('token', token, {
            httpOnly: true, // prevent js to access cookie
            secure: process.env.NODE_ENV === 'production', // use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // expiresIn: "7d"
        });

        return res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                cartItems: user.cartItems || {}
            },
            message: "User created successfully!"
        });
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message});
    }
}

// Login user : /api/user/login
export const login = async (req, res) => {
    try {
        const {email, password}  = req.body;

        if(!email || !password) {
            return res.json({success: false, message: "Email and psw are required!"});
        }

        const user = await User.findOne({email});
        if(!user) {
            return res.json({success: false, message: "Invalid email!"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.json({success: false, message: "Password is incorrect"});
        }

        // tạo token
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "7d"});

        // Giữ phiên đăng nhập
        res.cookie('token', token, {
            httpOnly: true, // prevent js to access cookie
            secure: process.env.NODE_ENV === 'production', // use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // expiresIn: "7d"
        });

        return res.json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name,
                cartItems: user.cartItems || {}
            },
            message: "Logged in successfully!"
        });
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message});
    }
}

// Logout: /api/user/logout
export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({success: true, message: "Logged Out"})
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message});
    }
}

// Check Auth /api/user/is-auth
export const isAuth = async(req, res) => {
    try {
        const {userId} = req.body;
        const user = await User.findById(userId).select("-password"); // dont get password
        return res.json({success: true, user});
    } catch (error) {
        console.log(error.message)
        return res.json({success: false, message: error.message});
    }
}
