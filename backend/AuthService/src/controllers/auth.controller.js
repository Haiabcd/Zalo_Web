import User from "../models/users.model.js";
import bcrypt from "bcryptjs";
import {generateToken} from "../lib/utils.js";
import moment from "moment";

export const signup = async (req, res) => {
    // lấy dữ liệu từ req.body
    const { fullName, password, phoneNumber, gender, dateOfBirth} = req.body;
    try{
        if (!fullName || !password || !phoneNumber || !gender || !dateOfBirth) {
            return res.status(400).json({ message: "Không được bỏ trống" });
        }

        // Kiểm tra password phải từ 6 đến 32 ký tự
        if (password.length < 6 || password.length > 32) {
            return res.status(400).json({ message: "Mật khẩu phải có độ dài từ 6 đến 32 ký tự" });
        }

        // Kiểm tra mật khẩu chứa chữ, số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,32}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Mật khẩu phải chứa ít nhất một chữ cái, một số và một ký tự đặc biệt" });
        }

        // Kiểm tra mật khẩu không chứa ngày sinh và tên đầy đủ
        if (password.includes(dateOfBirth) || password.includes(fullName)) {
            return res.status(400).json({ message: "Mật khẩu không được chứa ngày sinh hoặc tên đầy đủ" });
        }

        // Kiểm tra số điện thoại đúng định dạng
        const phoneRegex = /^(0[0-9]{9})$/; // Định dạng số điện thoại Việt Nam
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
        }

        // Kiểm tra giới tính hợp lệ
        const validGenders = ["Male", "Female", "Other"];
        if (!validGenders.includes(gender)) {
            return res.status(400).json({ message: "Giới tính không hợp lệ" });
        }

        // Kiểm tra tuổi phải >= 14
        const currentDate = moment();
        const birthDate = moment(dateOfBirth);
        const age = currentDate.diff(birthDate, 'years');
        if (age < 14) {
            return res.status(400).json({ message: "Bạn phải ít nhất 14 tuổi" });
        }

        const user = await User.findOne({ phoneNumber });
        if (user) 
            return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            fullName,
            password: hashedPassword,
            phoneNumber,
            gender, 
            dateOfBirth: new Date(dateOfBirth)
        });
        if(newUser){
            generateToken(newUser._id, res);
            await newUser.save();
            res.status(201).json({ 
                message: "Tạo tài khoản thành công",
                data: newUser,
            });
        }else{
            res.status(400).json({ message: "Tạo tài khoản thất bại" });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const login = (req, res) => {
    res.send("login route");
};

export const logout = (req, res) => {
    res.send("logout route");
};