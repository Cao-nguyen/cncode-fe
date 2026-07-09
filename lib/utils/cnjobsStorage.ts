import { CNJob, CNJobFormData, JobType } from '@/types/cnjobs.type';

const STORAGE_KEY = 'cnjobs_data';

export const cnjobsStorage = {
    // Get all jobs
    getAllJobs(): CNJob[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    // Get job by ID
    getJobById(id: string): CNJob | null {
        const jobs = this.getAllJobs();
        return jobs.find(job => job.id === id) || null;
    },

    // Add new job
    addJob(formData: CNJobFormData, userId: string, username: string): CNJob {
        const jobs = this.getAllJobs();
        const newJob: CNJob = {
            id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ...formData,
            postedBy: {
                userId,
                username,
                avatar: undefined
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            applications: 0
        };
        jobs.unshift(newJob);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        return newJob;
    },

    // Update job
    updateJob(id: string, updates: Partial<CNJobFormData>): CNJob | null {
        const jobs = this.getAllJobs();
        const index = jobs.findIndex(job => job.id === id);
        if (index === -1) return null;

        jobs[index] = {
            ...jobs[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        return jobs[index];
    },

    // Delete job
    deleteJob(id: string): boolean {
        const jobs = this.getAllJobs();
        const filtered = jobs.filter(job => job.id !== id);
        if (filtered.length === jobs.length) return false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    },

    // Increment view count
    incrementViews(id: string): void {
        const jobs = this.getAllJobs();
        const index = jobs.findIndex(job => job.id === id);
        if (index !== -1) {
            jobs[index].views += 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        }
    },

    // Increment application count
    incrementApplications(id: string): void {
        const jobs = this.getAllJobs();
        const index = jobs.findIndex(job => job.id === id);
        if (index !== -1) {
            jobs[index].applications += 1;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
        }
    },

    // Filter jobs by type
    getJobsByType(type: JobType): CNJob[] {
        const jobs = this.getAllJobs();
        return jobs.filter(job => job.type === type);
    },

    // Search jobs
    searchJobs(query: string): CNJob[] {
        const jobs = this.getAllJobs();
        const lowerQuery = query.toLowerCase();
        return jobs.filter(job =>
            job.title.toLowerCase().includes(lowerQuery) ||
            job.description.toLowerCase().includes(lowerQuery) ||
            job.company?.toLowerCase().includes(lowerQuery) ||
            job.sellerName?.toLowerCase().includes(lowerQuery) ||
            job.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    },

    // Filter jobs by multiple criteria
    filterJobs(filters: {
        type?: JobType;
        workType?: string;
        tags?: string[];
        search?: string;
    }): CNJob[] {
        let jobs = this.getAllJobs();

        if (filters.type) {
            jobs = jobs.filter(job => job.type === filters.type);
        }

        if (filters.workType) {
            jobs = jobs.filter(job => job.workType === filters.workType);
        }

        if (filters.tags && filters.tags.length > 0) {
            jobs = jobs.filter(job =>
                filters.tags!.some(tag => job.tags.includes(tag))
            );
        }

        if (filters.search) {
            const lowerQuery = filters.search.toLowerCase();
            jobs = jobs.filter(job =>
                job.title.toLowerCase().includes(lowerQuery) ||
                job.description.toLowerCase().includes(lowerQuery) ||
                job.company?.toLowerCase().includes(lowerQuery) ||
                job.sellerName?.toLowerCase().includes(lowerQuery)
            );
        }

        return jobs;
    },

    // Get user's jobs
    getUserJobs(userId: string): CNJob[] {
        const jobs = this.getAllJobs();
        return jobs.filter(job => job.postedBy.userId === userId);
    },

    // Clear all jobs (for testing)
    clearAllJobs(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};