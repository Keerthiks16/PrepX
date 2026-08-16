import mongoose from 'mongoose';

const jobListingSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true },
    source: { type: String, enum: ['jsearch', 'adzuna', 'internshala', 'naukri'], required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    applyUrl: { type: String, required: true },
    postedAt: { type: Date },
    salary: { type: String, default: '' },
    employmentType: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    scrapedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

jobListingSchema.index({ source: 1, externalId: 1 }, { unique: true });
jobListingSchema.index({ isActive: 1, postedAt: -1 });
jobListingSchema.index({ title: 'text', company: 'text', summary: 'text' });

const JobListing = mongoose.model('JobListing', jobListingSchema);
export default JobListing;
