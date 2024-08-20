const express = require('express');
const User = require('../models/User');
const sendOtp = require('../utils/sendOtp');
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); 
const auth = require('../middleware/auth'); 
const jwt = require("jsonwebtoken");
const router = express.Router();


//   Start Signup
router.post('/signup', async (req, res) => {
    const { firstName,lastName,mobile,email,password,retype_password} = req.body;

    if (!email || !firstName ||!password ||!mobile) {
        return res.status(400).json({ error: 'Email name and password are required' });
    }
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        if(password != retype_password)
        {
            return res.status(400).json({ error: 'Password not matched' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = crypto.randomInt(100000, 999999).toString();
        const newUser = new User({ firstName,lastName,mobile,email, password: hashedPassword, otp });
        await newUser.save();
        await sendOtp(email, otp);

        return res.status(200).json({ message: 'OTP sent to your email' });
    } catch (error) {
        console.error('API failure:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// End Signup

// Start otp verification
router.post('/verify', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ error: 'Incorrect OTP' });
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('API failure:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// End Verify Otp

// Login Start with token

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password); // Change here  
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate JWT  
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('API failure:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
// End Login with token

// Reset Password start
// Reset Password with Current Password  
router.post('/reset-password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    try {
        const user = await User.findById(req.userId); // Get the user ID from the middleware

        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check if the current password is correct  
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash the new password  
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('API failure:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// Reset Password End

module.exports = router;