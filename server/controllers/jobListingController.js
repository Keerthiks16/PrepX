import asyncHandler from 'express-async-handler';
import JobListing from '../models/JobListing.js';
import Job from '../models/Job.js';
import { syncAll } from '../services/jobIngestionService.js';

const SYNC_COOLDOWN_MS = 5 * 60 * 1000;
let lastSyncAt = 0;

// @desc    Get paginated job listings
// @route   GET /api/job-listings
// @access  Private
export const getJobListings = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const skip = (page - 1) * limit;

  const filter = { isActive: true };

  if (req.query.source) {
    filter.source = req.query.source;
  }

  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  if (req.query.location) {
    filter.location = { $regex: req.query.location, $options: 'i' };
  }

  const [listings, total] = await Promise.all([
    JobListing.find(filter)
      .sort(req.query.q ? { score: { $meta: 'textScore' } } : { postedAt: -1 })
      .skip(skip)
      .limit(limit),
    JobListing.countDocuments(filter),
  ]);

  res.json({
    listings,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// @desc    Get single job listing
// @route   GET /api/job-listings/:id
// @access  Private
export const getJobListingById = asyncHandler(async (req, res) => {
  const listing = await JobListing.findById(req.params.id);

  if (!listing || !listing.isActive) {
    res.status(404);
    throw new Error('Job listing not found');
  }

  res.json(listing);
});

// @desc    Trigger manual job sync
// @route   POST /api/job-listings/sync
// @access  Private
export const triggerJobSync = asyncHandler(async (req, res) => {
  const now = Date.now();

  if (now - lastSyncAt < SYNC_COOLDOWN_MS) {
    const waitSeconds = Math.ceil((SYNC_COOLDOWN_MS - (now - lastSyncAt)) / 1000);
    res.status(429);
    throw new Error(`Sync cooldown active. Try again in ${waitSeconds} seconds.`);
  }

  lastSyncAt = now;

  const stats = await syncAll({
    query: req.body?.query,
    location: req.body?.location,
    source: req.body?.source || 'all',
  });

  res.json({ message: 'Job sync completed', stats });
});

// @desc    Save listing to user's application tracker
// @route   POST /api/job-listings/:id/save
// @access  Private
export const saveJobListingToTracker = asyncHandler(async (req, res) => {
  const listing = await JobListing.findById(req.params.id);

  if (!listing || !listing.isActive) {
    res.status(404);
    throw new Error('Job listing not found');
  }

  const notes = [
    listing.summary,
    listing.applyUrl ? `Apply: ${listing.applyUrl}` : '',
    listing.source ? `Source: ${listing.source}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const job = await Job.create({
    user: req.user._id,
    company: listing.company,
    role: listing.title,
    status: 'Applied',
    notes,
  });

  res.status(201).json(job);
});
