const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs');

const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetOTP = otp;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send OTP to user's email
    const message = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nYour OTP is: ${otp}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

    try {
        await sendEmail({
            to: user.email,
            subject: 'Password Reset OTP',
            text: message
        });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.error(error);
        user.passwordResetOTP = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(500).json({ message: 'Error sending email', error: error.message });
    }
};


const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email, passwordResetOTP: otp, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return res.status(400).json({ message: 'Invalid OTP or OTP has expired' });
    }

    // Reset password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.passwordResetOTP = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
};

module.exports = { requestPasswordReset, resetPassword };
