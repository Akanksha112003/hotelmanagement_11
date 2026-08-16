import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
import { OFFLINE_USERS } from "../utils/offlineStore.js";

export const registeruser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(200).json({
        success: false,
        sucess: false,
        message: "Please provide name, email and password",
      });
    }

    let existingUser = null;
    let isOffline = false;

    try {
      existingUser = await User.findOne({ email }).maxTimeMS(5000);
    } catch (dbErr) {
      console.warn("Database lookup failed during registration, falling back to mock registration:", dbErr.message);
      isOffline = true;
    }

    // Fallback if DB is offline
    if (isOffline) {
      const emailLower = email.trim().toLowerCase();
      // Check in-memory database
      const exists = OFFLINE_USERS.find((u) => u.email.toLowerCase() === emailLower);
      if (exists) {
        return res.status(200).json({
          success: false,
          sucess: false,
          message: "User with this email already exists",
        });
      }

      const mockUserId = `60c72b2f9b1d8b2d${Math.floor(Math.random() * 100000000).toString(16).padStart(8, '0')}`;
      const newUser = {
        id: mockUserId,
        name: name.trim(),
        email: emailLower,
        password: password, // Store plain text for in-memory comparisons
        role: "user",
      };
      OFFLINE_USERS.push(newUser);
      console.log("Offline registered user:", emailLower, "| Total offline users:", OFFLINE_USERS.length);

      return res.status(201).json({
        success: true,
        sucess: true,
        message: "User registered successfully",
        token: generateToken(mockUserId),
        user: {
          id: mockUserId,
          name: newUser.name,
          email: emailLower,
          role: "user",
        },
      });
    }

    if (existingUser) {
      return res.status(200).json({
        success: false,
        sucess: false,
        message: "User with this email already exists",
      });
    }
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password });
    return res.status(201).json({
      success: true,
      sucess: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const loginuser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(200).json({
        success: false,
        sucess: false,
        message: "Please provide email and password",
      });
    }

    const emailLower = email.trim().toLowerCase();
    let user = null;
    let isOffline = false;

    try {
      user = await User.findOne({ email: emailLower }).maxTimeMS(5000);
    } catch (dbErr) {
      console.warn("Database lookup failed, falling back to offline authentication:", dbErr.message);
      isOffline = true;
    }

    // DB is offline — use in-memory store only
    if (isOffline) {
      console.log("Login offline mode. Checking against", OFFLINE_USERS.length, "offline users for:", emailLower);
      const offlineUser = OFFLINE_USERS.find(
        (u) => u.email.toLowerCase() === emailLower && u.password === password
      );

      if (offlineUser) {
        return res.status(200).json({
          success: true,
          sucess: true,
          message: "User logged in successfully",
          token: generateToken(offlineUser.id),
          user: {
            id: offlineUser.id,
            name: offlineUser.name,
            email: offlineUser.email,
            role: offlineUser.role,
          },
        });
      }

      return res.status(200).json({
        success: false,
        sucess: false,
        message: "Invalid email or password",
      });
    }

    // DB is online — check the real DB result
    if (!user) {
      // DB user not found — also check offline store (in case they registered offline)
      const offlineUser = OFFLINE_USERS.find(
        (u) => u.email.toLowerCase() === emailLower && u.password === password
      );
      if (offlineUser) {
        return res.status(200).json({
          success: true,
          sucess: true,
          message: "User logged in successfully",
          token: generateToken(offlineUser.id),
          user: {
            id: offlineUser.id,
            name: offlineUser.name,
            email: offlineUser.email,
            role: offlineUser.role,
          },
        });
      }

      return res.status(200).json({
        success: false,
        sucess: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        sucess: false,
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      success: true,
      sucess: true,
      message: "User logged in successfully",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide email and new password" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const emailLower = email.trim().toLowerCase();
    let user = null;
    let isOffline = false;

    try {
      user = await User.findOne({ email: emailLower }).maxTimeMS(5000);
    } catch (dbErr) {
      isOffline = true;
    }

    if (isOffline) {
      const idx = OFFLINE_USERS.findIndex((u) => u.email.toLowerCase() === emailLower);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "No account found with this email" });
      }
      OFFLINE_USERS[idx].password = newPassword;
      return res.status(200).json({ success: true, message: "Password reset successful" });
    }

    if (!user) {
      // Also check offline store
      const idx = OFFLINE_USERS.findIndex((u) => u.email.toLowerCase() === emailLower);
      if (idx !== -1) {
        OFFLINE_USERS[idx].password = newPassword;
        return res.status(200).json({ success: true, message: "Password reset successful" });
      }
      return res.status(404).json({ success: false, message: "No account found with this email" });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};
