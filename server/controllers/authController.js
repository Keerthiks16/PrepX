import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax', // 'none' needs Secure=true; use 'lax' for localhost dev
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      resumeContext: user.resumeContext,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      projects: user.projects,
      groqApiKey: user.groqApiKey,
      linkedin: user.linkedin,
      github: user.github,
      portfolio: user.portfolio
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      resumeContext: user.resumeContext,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      projects: user.projects,
      groqApiKey: user.groqApiKey,
      linkedin: user.linkedin,
      github: user.github,
      portfolio: user.portfolio
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      resumeContext: user.resumeContext,
      skills: user.skills,
      experienceLevel: user.experienceLevel,
      projects: user.projects,
      groqApiKey: user.groqApiKey
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.skills = req.body.skills || user.skills;
            user.currentRole = req.body.currentRole || user.currentRole;
            user.projects = req.body.projects || user.projects;
            user.resumeContext = req.body.resumeContext || user.resumeContext;
            user.experienceLevel = req.body.experienceLevel || user.experienceLevel;
            
            // New Fields
            user.linkedin = req.body.linkedin || user.linkedin;
            user.github = req.body.github || user.github;
            user.portfolio = req.body.portfolio || user.portfolio;
            user.groqApiKey = req.body.groqApiKey !== undefined ? req.body.groqApiKey : user.groqApiKey;

            const updatedUser = await user.save();
            
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                skills: updatedUser.skills,
                currentRole: updatedUser.currentRole,
                projects: updatedUser.projects,
                resumeContext: updatedUser.resumeContext,
                experienceLevel: updatedUser.experienceLevel,
                linkedin: updatedUser.linkedin,
                github: updatedUser.github,
                portfolio: updatedUser.portfolio,
                groqApiKey: updatedUser.groqApiKey
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
};
