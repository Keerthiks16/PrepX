import express from 'express';
import asyncHandler from 'express-async-handler';
import Job from '../models/Job.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const jobs = await Job.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(jobs);
}));

// @desc    Add a job
// @route   POST /api/jobs
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const { company, role, status, notes } = req.body;

    const job = await Job.create({
        user: req.user._id,
        company,
        role,
        status, 
        notes
    });

    res.status(201).json(job);
}));

// @desc    Update job (status moved)
// @route   PUT /api/jobs/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (job) {
        // Ensure user owns job
        if (job.user.toString() !== req.user._id.toString()) {
             res.status(401);
             throw new Error('Not authorized');
        }

        job.company = req.body.company || job.company;
        job.role = req.body.role || job.role;
        job.status = req.body.status || job.status;
        job.notes = req.body.notes || job.notes;

        const updatedJob = await job.save();
        res.json(updatedJob);
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
}));

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (job) {
         if (job.user.toString() !== req.user._id.toString()) {
             res.status(401);
             throw new Error('Not authorized');
        }
        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } else {
        res.status(404);
        throw new Error('Job not found');
    }
}));


export default router;
