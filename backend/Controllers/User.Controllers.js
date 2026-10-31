const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateToken, refreshToken } = require("../utilites/Token");
const jsend = require("jsend");
const fs = require("fs");
const path = require("path");
const AsyncWrapper = require("../middleware/Wrapper");
const { db } = require("../config/ConnectDB");

// =====================================================
// Get All Users
// =====================================================

const getAllUsers = AsyncWrapper(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const skip = (page - 1) * limit;

  const queryParams = [];

  let whereQuery = `WHERE 1=1`;

  // Search
  if (req.query.search) {
    whereQuery += ` AND name LIKE ?`;
    queryParams.push(`%${req.query.search}%`);
  }

  // Get users
  const usersQuery = `
    SELECT 
  id, name, email, phone, address, role, image, created_At, updated_At
    FROM users
    ${whereQuery}
    LIMIT ? OFFSET ?
  `;

  // Get total users
  const countQuery = `
    SELECT COUNT(*) AS totalUsers
    FROM users
  `;

  db.execute(countQuery, [], (error, countData) => {
    if (error) {
      return res.status(500).send(
        jsend.error({
          message: "Error counting users",
          error,
        }),
      );
    }

    const totalUsers = countData[0].totalUsers;
    const totalPages = Math.ceil(totalUsers / limit);

    db.execute(
      usersQuery,
      [...queryParams, limit, skip],
      (error, usersData) => {
        if (error) {
          return res.status(500).send(
            jsend.error({
              message: "Error fetching users",
              error,
            }),
          );
        }

        res.status(200).send(
          jsend.success({
            ok: true,
            pagination: {
              page,
              limit,
              totalUsers,
              totalPages,
            },
            users: usersData,
          }),
        );
      },
    );
  });
});

// =====================================================
// Get User By ID
// =====================================================

const getUserById = AsyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const quary = `select id,name,email,phone,address,role,image,created_At , updated_At  from users where id = ?`;
  db.execute(quary, [userId], (error, data) => {
    if (error) {
      return res
        .status(500)
        .send(jsend.error({ message: "Error fetching user", error }));
    }
    if (data.length === 0) {
      return res.status(404).send(jsend.error({ message: "User not found" }));
    }
    res.status(200).send(
      jsend.success({
        ok: true,
        user: data[0],
      }),
    );
  });
});

const updateUser = AsyncWrapper(async (req, res) => {
  const userId = Number(req.params.id);
  const { name, email, phone, address, role } = req.body;
  const [users] = await db
    .promise()
    .execute(`SELECT id, image FROM users WHERE id = ?`, [userId]);

  if (users.length === 0) {
    return res.status(404).send(jsend.error({ message: "User not found" }));
  }

  const [existingEmail] = await db
    .promise()
    .execute(`SELECT id FROM users WHERE email = ? AND id <> ?`, [
      email,
      userId,
    ]);

  if (existingEmail.length > 0) {
    return res
      .status(409)
      .send(jsend.error({ message: "Email is already in use" }));
  }

  if (phone) {
    const [existingPhone] = await db
      .promise()
      .execute(`SELECT id FROM users WHERE phone = ? AND id <> ?`, [
        phone,
        userId,
      ]);

    if (existingPhone.length > 0) {
      return res
        .status(409)
        .send(jsend.error({ message: "Phone number is already in use" }));
    }
  }

  await db
    .promise()
    .execute(
      `UPDATE users SET name = ?, email = ?, phone = ?, address = ?, role = ?, image = ? WHERE id = ?`,
      [
        name.trim(),
        email,
        phone || null,
        address?.trim() || "",
        role,
        req.file?.filename ?? users[0].image,
        userId,
      ],
    );

  if (req.file && users[0].image) {
    const oldImagePath = path.join(
      __dirname,
      "../images",
      path.basename(users[0].image),
    );
    fs.unlink(oldImagePath, (error) => {
      if (error && error.code !== "ENOENT") {
        console.error("Error deleting previous user image:", error);
      }
    });
  }

  return res
    .status(200)
    .send(jsend.success({ message: "User updated successfully" }));
});

const usersGroupByRole = AsyncWrapper(async (req, res) => {
  const query = `
    SELECT role, COUNT(*) AS count
    FROM users
    GROUP BY role
  `;
  const [roleData] = await db.promise().execute(query);
  res.status(200).send(
    jsend.success({
      ok: true,
      roleData,
    }),
  );
});

// =====================================================
// Register User
// =====================================================

const registerUser = AsyncWrapper(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const ifuserExistsQuery = `SELECT * FROM users WHERE email = ?`;
  const [existingUser] = await db.promise().execute(ifuserExistsQuery, [email]);
  console.log("Existing User:", existingUser);
  if (existingUser.length === 1) {
    return res
      .status(400)
      .send(jsend.error({ message: "User already exists" }));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertUserQuery = `INSERT INTO users (name,email,phone,address,password,image) VALUES (?, ?, ?, ?, ?, ?)`;
  const [newUserResult] = await db
    .promise()
    .execute(insertUserQuery, [
      name,
      email,
      phone,
      req.body.address || "الصنافين",
      hashedPassword,
      req.file?.filename ?? null,
    ]);
  const accessToken = await generateToken({
    userId: newUserResult.insertId,
    role: "user",
    name,
    email,
  });

  const newRefreshToken = await refreshToken({
    userId: newUserResult.insertId,
    role: "user",
    name,
    email,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).send(
    jsend.success({
      message: "User registered successfully",
      accessToken,
      newUser: {
        ...newUserResult,
      },
    }),
  );
});

// =====================================================
// Login User
// =====================================================

const loginUser = AsyncWrapper(async (req, res) => {
  const { email, password } = req.body;
  const ifuserExistsQuery = `SELECT * FROM users WHERE email = ?`;
  const [existingUser] = await db.promise().execute(ifuserExistsQuery, [email]);
  console.log("Existing User:", existingUser);
  if (existingUser.length === 0) {
    return res.status(400).send(jsend.error({ message: "User not found" }));
  }
  const passwordMatch = await bcrypt.compare(
    password,
    existingUser[0].password,
  );

  if (!passwordMatch) {
    return res
      .status(401)
      .send(jsend.error({ message: "Invalid email or password" }));
  }

  const accessToken = await generateToken({
    userId: existingUser[0].id,
    role: existingUser[0].role,
    name: existingUser[0].name,
    email: existingUser[0].email,
  });

  const newRefreshToken = await refreshToken({
    userId: existingUser[0].id,
    role: existingUser[0].role,
    name: existingUser[0].name,
    email: existingUser[0].email,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.status(200).send(
    jsend.success({
      message: "Login successful",
      accessToken,
      role: existingUser[0].role,
    }),
  );
});

// =====================================================
// Update User Role
// =====================================================

const updateRole = AsyncWrapper(async (req, res) => {
  const { userId, newRole } = req.body;
  const ifuserExistsQuery = `SELECT * FROM users WHERE id = ?`;
  const [existingUser] = await db
    .promise()
    .execute(ifuserExistsQuery, [userId]);
  if (existingUser.length === 0) {
    return res.status(404).send(jsend.error({ message: "User not found" }));
  }
  const updateRoleQuery = `UPDATE users SET role = ? WHERE id = ?`;
  await db.promise().execute(updateRoleQuery, [newRole, userId]);

  res.status(200).send(
    jsend.success({
      message: "User role updated successfully",
    }),
  );
});

// =====================================================
// Refresh Access Token
// =====================================================

const refresh = AsyncWrapper(async (req, res) => {
  const currentRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;
  if (!currentRefreshToken) {
    return res.status(401).send(
      jsend.error({
        message: "No refresh token provided",
      }),
    );
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(
      currentRefreshToken,
      process.env.JWT_REFRESH_SECRET,
    );
    console.log("Decoded Refresh Token:", decoded);
    // Find user in MySQL
    const [users] = await db.promise().execute(
      `SELECT id, name, email, role
       FROM users
       WHERE email = ?`,
      [decoded.email],
    );

    if (users.length === 0) {
      return res.status(404).send(
        jsend.error({
          message: "User not found",
        }),
      );
    }

    const user = users[0];

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Set new refresh token
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).send(
      jsend.success({
        accessToken: newAccessToken,
      }),
    );
  } catch (error) {
    console.log(error);

    return res.status(401).send(
      jsend.error({
        message: "Invalid or expired refresh token",
      }),
    );
  }
});

// =====================================================
// Delete User
// =====================================================

const deleteUser = AsyncWrapper(async (req, res) => {
  const userId = req.params.id;
  const ifuserExistsQuery = `SELECT * FROM users WHERE id = ?`;
  const [existingUser] = await db
    .promise()
    .execute(ifuserExistsQuery, [userId]);
  if (existingUser.length === 0) {
    return res.status(404).send(jsend.error({ message: "User not found" }));
  }
  if (existingUser[0].role === "admin") {
    return res.status(403).send(
      jsend.error({
        message: "Cannot delete admin user",
      }),
    );
  }
  await db.promise().execute(`DELETE FROM users WHERE id = ?`, [userId]);

  res.status(200).send(
    jsend.success({
      message: "User deleted successfully",
    }),
  );
});
// =====================================================
// Logout User
// =====================================================
const logoutUser = AsyncWrapper(async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;

  if (!token) {
    return res
      .status(400)
      .send(jsend.error({ message: "No refresh token provided" }));
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.status(200).send(jsend.success({ message: "Logged out successfully" }));
});
// =====================================================
// Exports
// =====================================================
const imagesCon = (req, res) => {
  res.status(200).send(jsend.success(req.files.map((file) => file.filename)));
};
module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  registerUser,
  loginUser,
  updateRole,
  refresh,
  deleteUser,
  logoutUser,
  usersGroupByRole,
  imagesCon,
};
