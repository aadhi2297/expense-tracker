import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/UserSchema.js";
import bcrypt from "bcrypt";

export const registerControllers = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // console.log(name, email, password);

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter All Fields",
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: "User already Exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    // console.log(hashedPassword);

    let newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
export const loginControllers = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // console.log(email, password);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter All Fields",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect Email or Password",
      });
    }

    delete user.password;

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}`,
      user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const setAvatarController = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const imageData = req.body.image;

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage: imageData,
      },
      { new: true }
    );

    return res.status(200).json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (err) {
    next(err);
  }
};

export const allUsers = async (req, res, next) => {
  try {
    const user = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);

    return res.json(user);
  } catch (err) {
    next(err);
  }
};
// ------------------ Forgot Password ------------------
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    const resetUrl = `https://expense-tracker-backend-k3xp.onrender.com/api/auth/reset-password/${resetToken}`;

    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });

    const info = await transporter.sendMail({
      from: `"Expense Tracker" <${testAccount.user}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset</p>
             <p>Click here to reset: <a href="${resetUrl}">${resetUrl}</a></p>`,
    });

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return res.status(200).json({
      success: true,
      message:
        "Password reset link sent to email (check console for preview URL)",
      previewURL: nodemailer.getTestMessageUrl(info),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const resetPasswordController = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
