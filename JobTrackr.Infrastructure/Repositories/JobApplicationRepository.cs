using JobTrackr.Domain.Entities;
using JobTrackr.Domain.Interfaces;
using JobTrackr.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Infrastructure.Repositories
{
    public class JobApplicationRepository : IJobApplicationRepository
    {
        private readonly AppDbContext _context;

        public JobApplicationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<JobApplication?> GetByIdAsync(Guid id)
            => await _context.JobApplications
                .Include(j => j.User)
                .FirstOrDefaultAsync(j => j.Id == id);

        public async Task<IEnumerable<JobApplication>> GetByUserIdAsync(Guid userId)
            => await _context.JobApplications
                .Where(j => j.UserId == userId)
                .OrderByDescending(j => j.AppliedDate)
                .ToListAsync();

        public async Task<JobApplication> CreateAsync(JobApplication application)
        {
            _context.JobApplications.Add(application);
            await _context.SaveChangesAsync();
            return application;
        }

        public async Task UpdateAsync(JobApplication application)
        {
            application.UpdatedAt = DateTime.UtcNow;
            _context.JobApplications.Update(application);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var application = await _context.JobApplications.FindAsync(id);
            if (application != null)
            {
                _context.JobApplications.Remove(application);
                await _context.SaveChangesAsync();
            }
        }
    }
}
