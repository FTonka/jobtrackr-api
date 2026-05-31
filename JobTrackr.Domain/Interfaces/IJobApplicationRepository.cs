using JobTrackr.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Domain.Interfaces
{
    public interface IJobApplicationRepository
    {
       

        Task<JobApplication?> GetByIdAsync(Guid id);
        Task<IEnumerable<JobApplication>> GetByUserIdAsync(Guid userId);
        Task<JobApplication> CreateAsync(JobApplication application);
        Task UpdateAsync(JobApplication application);
        Task DeleteAsync(Guid id);
    }
}
