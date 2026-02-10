import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  workflow: { type: String }, // User's description of how it works
  githubLink: { type: String },
  deploymentLink: { type: String }
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linkedin: { type: String },
  github: { type: String },
  portfolio: { type: String },
  resumeContext: { type: String }, // AI generated summary or raw text
  skills: [{ type: String }],
  experienceLevel: { type: String, enum: ['Entry', 'Mid', 'Senior'], default: 'Entry' },
  projects: [projectSchema],
  createdAt: { type: Date, default: Date.now }
});

// Encrypt password before saving
// Encrypt password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
