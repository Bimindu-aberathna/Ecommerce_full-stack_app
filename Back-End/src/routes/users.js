const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/user");
const { auth, adminAuth } = require("../middleware/auth");
const { userUpdateValidation } = require("../middleware/validation");
const { Cart } = require("../models");

// Create uploads directory if it doesn't exist
const uploadDir = "uploads/avatars";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

const router = express.Router();

// Serve static files for avatars
router.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

//get user profile data
router.get("/profile", auth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        postalCode: user.postalCode,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
});

//update user profile
router.put(
  "/profile",
  auth,
  upload.single("avatar"),
  userUpdateValidation,
  async (req, res) => {
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const checkUser = await User.findByPk(userId);
      if (!checkUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Handle avatar file upload - just save new file
      if (req.file) {
        updateData.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      const allowedFields = [
        "firstName",
        "lastName", 
        "phone",
        "avatar",
        "address",
        "postalCode",
      ];
      let hasChanges = false;
      const updatedFields = {};

      // Check for changes and collect updated fields
      allowedFields.forEach((field) => {
        if (
          updateData[field] !== undefined &&
          updateData[field] !== checkUser[field]
        ) {
          hasChanges = true;
          updatedFields[field] = updateData[field];
        }
      });

      if (!hasChanges) {
        // If no changes and a file was uploaded, clean it up
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(200).json({
          success: true,
          message: "No changes made",
          data: {
            firstName: checkUser.firstName,
            lastName: checkUser.lastName,
            email: checkUser.email,
            phone: checkUser.phone,
            avatar: checkUser.avatar,
            address: checkUser.address,
            postalCode: checkUser.postalCode,
          },
        });
      }

      // Update user with new data
      const [affectedRows] = await User.update(updatedFields, {
        where: { id: userId },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Failed to update user",
        });
      }

      // Get updated user data
      const updatedUser = await User.findByPk(userId, {
        attributes: [
          "firstName",
          "lastName",
          "email",
          "phone",
          "avatar",
          "address",
          "postalCode",
        ],
      });

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      console.error("Update user profile error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
      });
    }
  }
);

//delete user
router.delete("/profile", auth, async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
  //Find user
  const user = await User.findOne({
    where: {
      isActive: true,
      id: userId,
    },
  });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }
  //find pending carts
  const pendingCarts = await Cart.findAll({
    where: {
      userId: user.id,
      status: "pending",
    },
  });

  if (pendingCarts.length > 0) {
    res.status(400).json({
      success: false,
      message: "Delete pending carts",
    });
  } else {
    const result = await User.update(
      { isActive: false },
      {
        where: {
          id: user.id,
        },
      } 
    );
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error: " + error.message,
    });
  }
  next(error);
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get("/", auth, adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "-createdAt",
      search,
      role,
    } = req.query;

    // Build query object
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;

    // Calculate skip value for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination
    const users = await User.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users: users.map((user) => user.toAuthJSON()),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalItems: total,
          itemsPerPage: Number(limit),
          hasNext: skip + users.length < total,
          hasPrev: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        user: user.toAuthJSON(),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin)
router.put("/:id", auth, adminAuth, async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === "boolean") updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: {
        user: user.toAuthJSON(),
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user (Admin only)
// @access  Private (Admin)
router.delete("/:id", auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate user",
      error: error.message,
    });
  }
});

// @route   GET /api/users/stats/dashboard
// @desc    Get user statistics (Admin only)
// @access  Private (Admin)
router.get("/stats/dashboard", auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ isActive: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const recentUsers = await User.find({})
      .sort("-createdAt")
      .limit(5)
      .select("firstName lastName email createdAt");

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          activeUsers,
          adminUsers,
          inactiveUsers: totalUsers - activeUsers,
        },
        recentUsers: recentUsers.map((user) => user.toAuthJSON()),
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    });
  }
});

module.exports = router;
