const stripHtml = (text = '') =>
  text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const truncateSummary = (text, maxLen = 300) => {
  const cleaned = stripHtml(text);
  if (!cleaned) return '';
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen).trim()}...`;
};

const buildLocation = (...parts) =>
  parts.filter(Boolean).join(', ');

const isValidJob = (job) =>
  job.externalId &&
  job.source &&
  job.title &&
  job.company &&
  job.applyUrl;

export const normalizeJSearchJob = (raw) => {
  const fullDescription = stripHtml(raw.job_description || '');
  const job = {
    externalId: String(raw.job_id),
    source: 'jsearch',
    title: raw.job_title?.trim() || '',
    company: raw.employer_name?.trim() || 'Unknown',
    location: buildLocation(raw.job_city, raw.job_state, raw.job_country),
    fullDescription,
    summary: truncateSummary(fullDescription),
    applyUrl: raw.job_apply_link || raw.job_google_link || '',
    postedAt: raw.job_posted_at_datetime_utc
      ? new Date(raw.job_posted_at_datetime_utc)
      : undefined,
    salary: raw.job_min_salary && raw.job_max_salary
      ? `${raw.job_min_salary} - ${raw.job_max_salary}`
      : raw.job_salary || '',
    employmentType: raw.job_employment_type || '',
    isActive: true,
    scrapedAt: new Date(),
  };

  return isValidJob(job) ? job : null;
};

export const normalizeAdzunaJob = (raw) => {
  const fullDescription = stripHtml(raw.description || '');
  const salary =
    raw.salary_min != null && raw.salary_max != null
      ? `${raw.salary_min} - ${raw.salary_max}`
      : raw.salary_min != null
        ? String(raw.salary_min)
        : '';

  const job = {
    externalId: String(raw.id),
    source: 'adzuna',
    title: raw.title?.trim() || '',
    company: raw.company?.display_name?.trim() || 'Unknown',
    location: raw.location?.display_name?.trim() || '',
    fullDescription,
    summary: truncateSummary(fullDescription),
    applyUrl: raw.redirect_url || '',
    postedAt: raw.created ? new Date(raw.created) : undefined,
    salary,
    employmentType: raw.contract_type || '',
    isActive: true,
    scrapedAt: new Date(),
  };

  return isValidJob(job) ? job : null;
};
