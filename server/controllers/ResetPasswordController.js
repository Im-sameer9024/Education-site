import "dotenv/config.js";
import User from "../models/UserModel";
import mailSender from "../utils/mailSender";
import { success } from "zod";

const resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email is not Registered",
      });
    }

    //---------------generate token -----------------
    const token = crypto.randomUUID();
    console.log("update password token", token);

    //-----------------save token in user database -----------------
    await User.findByIdAndUpdate(
      { email: email },
      {
        resetPasswordToken: token,
        resetPasswordExpire: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );

    //----------------------create Url ----------------
    const url = `${process.env.CLIENT_URL}/update-password/${token}`;

    //---------------send email -----------------

    await mailSender(
      email,
      "Password Reset Link",
      `Password reset Link ${url}`
    );

    return res.status(200).json({
      success: true,
      message: "Email sent successfully to reset Password",
    });
  } catch (error) {
    console.log("Error occur in resetPassword token controller", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }

    const userDetails = await User.findOne({
      resetPasswordToken: token,
    });

    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // check token time expires

    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token expired try Again !",
      });
    }

    // update password
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { resetPasswordToken: token },
      {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
      {
        new: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log("Error occur in resetPassword controller", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export { resetPasswordToken, resetPassword };