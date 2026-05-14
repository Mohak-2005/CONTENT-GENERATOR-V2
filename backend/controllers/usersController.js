const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const isAuthenticated = require("../middlewares/isAuthenticated");

//* -- Registration --
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  //* validate
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please fill all fields");
  }

  //* check if email is already taken
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Email already taken");
  }

  //* hash the user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  //* create the user
  const newUser = new User({
    username,
    password: hashedPassword,
    email,
    subscription: "Trial",
  });

  //* add the date the trial ends (3 days from now)
  newUser.trialExpires = new Date(
    new Date().getTime() + 3 * 24 * 60 * 60 * 1000,
  );

  //* save the new user
  await newUser.save();

  res.status(201).json({
    status: true,
    message: "Registration successful",
    user: { username, email },
  });
});

//* -- Login --
const login = asyncHandler(async (req, res) => {
  console.log("=== LOGIN HIT ===");
  console.log("Body:", req.body);
  console.log("JWT_SECRET:", process.env.JWT_SECRET);

  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log("User found:", user);

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user?.password);
  console.log("Password match:", isMatch);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  console.log("Generating token...");
  const token = jwt.sign(
    { id: user?._id },
    process.env.JWT_SECRET, // ✅ back to env variable
    { expiresIn: "3d" },
  );
  console.log("Token generated:", token);

  //* set the token into cookie

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1day only
  });

  res.json({
    status: "success",
    _id: user?._id,
    message: "Login successful",
    username: user?.username,
    email: user?.email,
    token,
  });
});

//* -- Logout --
const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json({ message: "Logged out successfully" });
});

//* == User Profile Controller ==
const userProfile = asyncHandler(async (req, res) => {
  console.log(req.user);
  const user = await User.findById(req?.user?.id).select("-password").populate("payments").populate("history");

  if (user) {
    res.status(200).json({
      status: "success",
      user,
    });
  } else {
    res.status(404);
    throw new Error("user not found");
  }
});

//* == Controller to check user authentication status ==
const checkAuth = asyncHandler(async(req, res)=>{
  const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
  if(decoded){
    res.json({
      isAuthenticated: true,
    });
  }
  else{
        res.json({
      isAuthenticated: false,
    });
  }

});

module.exports = { register, login, logout, userProfile, checkAuth, };
