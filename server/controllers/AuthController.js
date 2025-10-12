import 'dotenv/config.js';
import Otp from '../models/OtpModel.js';
import User from '../models/UserModel.js';
import OtpGenerator from 'otp-generator';
import bcrypt from 'bcrypt';
import Profile from '../models/ProfileModel.js';
import RefreshToken from '../models/RefreshTokenModel.js';
import {
  AccessTokenGenerator,
  RefreshTokenGenerator,
} from '../services/TokenService.js';
import mailSender from '../utils/mailSender.js';
import { options } from '../constants/CookieConstants.js';

//---------------send-Otp----------------

const SendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    //------------- check user already exist -------------

    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: 'User Already Register',
      });
    }

    //-------------generate otp-------------

    const otp = OtpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    console.log('Otp generated', otp);

    //-----------check Unique otp -------------

    const checkOtp = await Otp.findOne({
      otp: otp,
    });

    if (checkOtp) {
      return res.status(400).json({
        success: false,
        message: 'Try Again !',
      });
    }

    //-----------save otp in database-------------

    const savedOtp = await Otp.create({
      email: email,
      otp: otp,
    });

    console.log('otp body', savedOtp);

    return res.status(200).json({
      success: true,
      message: 'Otp send successfully',
      data: savedOtp,
    });
  } catch (error) {
    console.log('Error occur in sendOtp controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//------------Sign up ----------------

const Signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !accountType ||
      !contactNumber ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (password !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: 'Password and confirm password does not match',
      });
    }

    //-----------check user already exist -------------

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User Already Register',
      });
    }

    const recentOtp = await Otp.find({
      email: email,
    })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log('recent Otp', recentOtp);

    if (recentOtp[0].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Otp',
      });
    } else if (recentOtp[0].otp.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Otp Not found',
      });
    }

    //-----------------hash password ---------------

    const hashedPassword = await bcrypt.hash(password, 10);

    //-----------save user in database-------------

    const avatarUrl = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`;

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: contactNumber,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: avatarUrl,
    });

    const payload = {
      id: user._id,
      role: user.accountType,
    };

    const refreshToken = RefreshTokenGenerator(payload);

    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
    });

    return res.status(200).json({
      success: true,
      message: 'User register successfully',
      data: user,
    });
  } catch (error) {
    console.log('Error occur in signup controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

//------------Login ----------------

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    const payload = {
      id: user._id,
      role: user.accountType,
    };

    if (await bcrypt.compare(password, user.password)) {
      if (await RefreshToken.find({ user: user._id })) {
        const accessToken = AccessTokenGenerator(payload);

        return res.cookie('token', accessToken, options).json({
          success: true,
          message: 'Login successfully',
          data: user,
        });
      } else {
        const refreshToken = RefreshTokenGenerator(payload);
        const accessToken = AccessTokenGenerator(payload);

        await RefreshToken.create({
          token: refreshToken,
          user: user._id,
        });

        return res.cookie('token', accessToken, options).json({
          success: true,
          message: 'Login successfully',
          data: user,
        });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid password',
      });
    }
  } catch (error) {
    console.log('Error occur in Login controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//------------change Password ---------------

const ChangePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(403).json({
        success: false,
        message: 'All fields are required',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(403).json({
        success: false,
        message: 'Password and confirm password does not match',
      });
    }

    const { id } = req.user;

    const user = await User.findById(id);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    await mailSender(
      user.email,
      'Password Changed Successfully',
      'Password Changed Successfully'
    );

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.log('Error occur in change password controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

//------------Refresh User by Token ---------------

const refreshAccessToken = async (req, res) => {
  try {
    const { id, role } = req.user;

    const payload = {
      id: id,
      role: role,
    };

    //------- check refresh token--------

    const refreshToken = await RefreshToken.findOne({ userId: id });

    if (!refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Refresh token not found , please login again',
      });
    }

    const accessToken = AccessTokenGenerator(payload);

    return res.cookie('token', accessToken, options).status(200).json({
      success: true,
      message: 'Refresh User successfully by token',
    });
  } catch (error) {
    console.log('Error occur in refresh token controller', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error,
    });
  }
};

//------------Logout ----------------

const Logout = async (req, res) => {
  try {
    const { id } = req.user;

    await RefreshToken.findOneAndDelete({ userId: id });

    res.clearCookie('token', options);

    return res.status(200).json({
      success: true,
      message: 'Logout successfully',
    });
  } catch (error) {
    console.log('Error occur in Logout', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export { SendOtp, Signup, Login, ChangePassword, refreshAccessToken, Logout };
