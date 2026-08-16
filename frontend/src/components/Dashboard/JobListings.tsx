import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ─── Types ────────────────────────────────────────────────────────────────────

interface JobListing {
  _id: string;
  externalId: string;
  source: 'jsearch' | 'adzuna';
  title: string;
  company: string;
  location: string;
  summary: string;
  applyUrl: string;
  postedAt: string;
  salary: string;
  employmentType: string;
}

interface ListingsResponse {
  listings: JobListing[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SOURCE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  jsearch:     { label: 'JSearch',     color: 'text-info',    bg: 'bg-info/10 border-info/30' },
  adzuna:      { label: 'Adzuna',      color: 'text-warning', bg: 'bg-warning/10 border-warning/30' },
  internshala: { label: 'Internshala', color: 'text-accent-300', bg: 'bg-accent/10 border-accent/30' },
  naukri:      { label: 'Naukri',      color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30' },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-base-800/70 border border-base-600/30 rounded-xl p-5 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-5 bg-base-600/50 rounded w-2/3" />
      <div className="h-5 bg-base-600/30 rounded-full w-16" />
    </div>
    <div className="h-4 bg-base-600/40 rounded w-1/3 mb-3" />
    <div className="h-3 bg-base-600/30 rounded w-full mb-1" />
    <div className="h-3 bg-base-600/30 rounded w-4/5" />
    <div className="flex gap-2 mt-4">
      <div className="h-8 bg-base-600/30 rounded-lg flex-1" />
      <div className="h-8 bg-base-600/30 rounded-lg flex-1" />
    </div>
  </div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface CardProps {
  job: JobListing;
  onSave: (id: string) => void;
  saving: boolean;
  saved: boolean;
}

const JobCard = ({ job, onSave, saving, saved }: CardProps) => {
  const src = SOURCE_LABELS[job.source] ?? { label: job.source, color: 'text-text-secondary', bg: 'bg-base-700' };
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group bg-base-800/70 hover:bg-base-800 border border-base-600/30 hover:border-accent/40 rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-accent/10 hover:shadow-lg flex flex-col gap-3">
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-text-primary text-base leading-tight truncate" title={job.title}>
            {job.title}
          </h3>
          <p className="text-sm text-accent-300 font-medium mt-0.5">{job.company}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${src.bg} ${src.color}`}>
          {src.label}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-secondary">
        {job.location && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {job.location}
          </span>
        )}
        {job.employmentType && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {job.employmentType}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center gap-1 text-accent-300">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {job.salary}
          </span>
        )}
        {job.postedAt && (
          <span className="ml-auto text-text-secondary/60">{timeAgo(job.postedAt)}</span>
        )}
      </div>

      {/* Summary */}
      {job.summary && (
        <div>
          <p className={`text-xs text-text-secondary leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
            {job.summary}
          </p>
          {job.summary.length > 120 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-accent-300 hover:text-accent mt-1 transition-colors"
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent-200 text-xs font-semibold hover:bg-accent hover:text-base-900 transition-all duration-200 active:scale-95"
        >
          Apply →
        </a>
        <button
          onClick={() => onSave(job._id)}
          disabled={saving || saved}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95 border ${
            saved
              ? 'bg-accent/20 border-accent/40 text-accent-200 cursor-default'
              : saving
              ? 'bg-base-700 border-base-600 text-text-secondary cursor-wait'
              : 'bg-base-700 border-base-600 text-text-secondary hover:bg-base-600 hover:text-text-primary'
          }`}
        >
          {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save to Tracker'}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const JobListings = () => {
  const [listings, setListings]       = useState<JobListing[]>([]);
  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState(false);
  const [syncMsg, setSyncMsg]         = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [total, setTotal]             = useState(0);
  const [savingIds, setSavingIds]     = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds]       = useState<Set<string>>(new Set());

  // Filters
  const [search, setSearch]           = useState('');
  const [location, setLocation]       = useState('');
  const [source, setSource]           = useState('');

  // Debounced values
  const [debouncedSearch, setDebouncedSearch]     = useState('');
  const [debouncedLocation, setDebouncedLocation] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(location), 500);
    return () => clearTimeout(t);
  }, [location]);

  const fetchListings = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(pg), limit: '12' };
      if (debouncedSearch)   params.q        = debouncedSearch;
      if (debouncedLocation) params.location = debouncedLocation;
      if (source)            params.source   = source;

      const { data } = await axios.get<ListingsResponse>('/api/job-listings', {
        params,
        withCredentials: true,
      });
      setListings(data.listings);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch job listings:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, debouncedLocation, source]);

  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const handlePageChange = (newPage: number) => {
    fetchListings(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const { data } = await axios.post('/api/job-listings/sync', {}, { withCredentials: true });
      setSyncMsg(`✓ Sync done — ${data.stats?.inserted ?? 0} new jobs added`);
      fetchListings(1);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Sync failed';
      setSyncMsg(`⚠ ${msg}`);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 8000);
    }
  };

  const handleSave = async (id: string) => {
    setSavingIds(prev => new Set(prev).add(id));
    try {
      await axios.post(`/api/job-listings/${id}/save`, {}, { withCredentials: true });
      setSavedIds(prev => new Set(prev).add(id));
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Could not save job');
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-base-900 text-text-primary px-4 md:px-10 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-accent-300 to-accent-200 text-transparent bg-clip-text">
            Job Discover
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Live listings scraped from JSearch &amp; Adzuna
            {total > 0 && <span className="text-accent/70 ml-2 font-medium">· {total.toLocaleString()} jobs</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {syncMsg && (
            <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${
              syncMsg.startsWith('✓')
                ? 'text-accent-200 bg-accent/10 border-accent/30'
                : 'text-warning bg-warning/10 border-warning/30'
            }`}>
              {syncMsg}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-600 to-accent text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-accent/20 active:scale-95 disabled:opacity-60 disabled:cursor-wait"
          >
            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing…' : 'Sync Jobs'}
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="relative sm:col-span-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search title, company…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-base-800 border border-base-600 rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            placeholder="Filter by location…"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-base-800 border border-base-600 rounded-xl text-sm text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>

        <select
          value={source}
          onChange={e => setSource(e.target.value)}
          className="w-full px-4 py-2.5 bg-base-800 border border-base-600 rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent/70 focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer"
        >
          <option value="">All Sources</option>
          <option value="jsearch">JSearch only</option>
          <option value="adzuna">Adzuna only</option>
          <option value="internshala">Internshala only</option>
          <option value="naukri">Naukri only</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-base-800 flex items-center justify-center mb-5 border border-base-600/40">
            <svg className="w-10 h-10 text-base-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-text-primary text-lg font-bold">No jobs found</p>
          <p className="text-text-secondary text-sm mt-2 max-w-sm">
            Try adjusting your filters, or click{' '}
            <button onClick={handleSync} className="text-accent font-semibold hover:underline">Sync Jobs</button>{' '}
            to pull fresh listings from external sources.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(job => (
            <JobCard
              key={job._id}
              job={job}
              onSave={handleSave}
              saving={savingIds.has(job._id)}
              saved={savedIds.has(job._id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg bg-base-800 border border-base-600 text-sm text-text-secondary hover:text-text-primary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Prev
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let pg: number;
            if (totalPages <= 7) {
              pg = i + 1;
            } else if (page <= 4) {
              pg = i + 1;
            } else if (page >= totalPages - 3) {
              pg = totalPages - 6 + i;
            } else {
              pg = page - 3 + i;
            }
            return (
              <button
                key={pg}
                onClick={() => handlePageChange(pg)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  pg === page
                    ? 'bg-accent text-base-900 font-bold shadow-md shadow-accent/30'
                    : 'bg-base-800 border border-base-600 text-text-secondary hover:text-text-primary hover:border-accent/50'
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-4 py-2 rounded-lg bg-base-800 border border-base-600 text-sm text-text-secondary hover:text-text-primary hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default JobListings;
