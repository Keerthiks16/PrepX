import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
  },
  company: { type: String, required: true },
  role: { type: String, required: true },
  status: { 
      type: String, 
      enum: ['Applied', 'Interview', 'Offer', 'Rejected', 'Task'], 
      default: 'Applied' 
  },
  dateApplied: { type: Date, default: Date.now },
  notes: { type: String }
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);
export default Job;
