using JobTrackr.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Application.Interfaces
{
    public interface IJobApplicationService
    {
        Task<IEnumerable<JobApplicationDto>> GetUserApplicationsAsync(Guid userId);
        Task<JobApplicationDto?> GetByIdAsync(Guid id, Guid userId);
        Task<JobApplicationDto> CreateAsync(Guid userId, CreateJobApplicationDto dto);
        Task<JobApplicationDto?> UpdateAsync(Guid id, Guid userId, UpdateJobApplicationDto dto);
        Task<bool> DeleteAsync(Guid id, Guid userId);
    }
}
