using JobTrackr.Application.DTOs;
using JobTrackr.Application.Interfaces;
using JobTrackr.Domain.Entities;
using JobTrackr.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Application.Services
{
    public class JobApplicationService : IJobApplicationService
    {
        private readonly IJobApplicationRepository _repository;
        private readonly ICacheService _cache;

        public JobApplicationService(IJobApplicationRepository repository,
        ICacheService cache)
        {
            _repository = repository;
            _cache = cache;
        }

        public async Task<IEnumerable<JobApplicationDto>> GetUserApplicationsAsync(Guid userId)
        {
            var cacheKey = $"applications:user:{userId}";

            var cached = await _cache.GetAsync<IEnumerable<JobApplicationDto>>(cacheKey);
            if (cached != null) return cached;

            var applications = await _repository.GetByUserIdAsync(userId);
            var dtos = applications.Select(MapToDto).ToList();

            await _cache.SetAsync(cacheKey, dtos, TimeSpan.FromMinutes(5));
            return dtos;
        }

        public async Task<JobApplicationDto?> GetByIdAsync(Guid id, Guid userId)
        {
            var cacheKey = $"application:{id}";

            var cached = await _cache.GetAsync<JobApplicationDto>(cacheKey);
            if (cached != null && cached != null) return cached;

            var application = await _repository.GetByIdAsync(id);
            if (application == null || application.UserId != userId) return null;

            var dto = MapToDto(application);
            await _cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(10));
            return dto;
        }


        public async Task<JobApplicationDto> CreateAsync(Guid userId, CreateJobApplicationDto dto)
        {
            var application = new JobApplication
            {
                UserId = userId,
                CompanyName = dto.CompanyName,
                Position = dto.Position,
                JobUrl = dto.JobUrl,
                Location = dto.Location,
                SalaryMin = dto.SalaryMin,
                SalaryMax = dto.SalaryMax,
                InterviewDate = dto.InterviewDate
            };

            var created = await _repository.CreateAsync(application);

            // Cache'i temizle — liste güncellenmeli
            await _cache.RemoveAsync($"applications:user:{userId}");

            return MapToDto(created);
        }

        public async Task<JobApplicationDto?> UpdateAsync(Guid id, Guid userId, UpdateJobApplicationDto dto)
        {
            var application = await _repository.GetByIdAsync(id);
            if (application == null || application.UserId != userId) return null;

            if (dto.CompanyName != null) application.CompanyName = dto.CompanyName;
            if (dto.Position != null) application.Position = dto.Position;
            if (dto.JobUrl != null) application.JobUrl = dto.JobUrl;
            if (dto.Status != null) application.Status = dto.Status.Value;
            if (dto.Location != null) application.Location = dto.Location;
            if (dto.SalaryMin != null) application.SalaryMin = dto.SalaryMin;
            if (dto.SalaryMax != null) application.SalaryMax = dto.SalaryMax;
            if (dto.InterviewDate != null) application.InterviewDate = dto.InterviewDate;

            await _repository.UpdateAsync(application);

            // Cache'i temizle
            await _cache.RemoveAsync($"application:{id}");
            await _cache.RemoveAsync($"applications:user:{userId}");

            return MapToDto(application);
        }

        public async Task<bool> DeleteAsync(Guid id, Guid userId)
        {
            var application = await _repository.GetByIdAsync(id);
            if (application == null || application.UserId != userId) return false;

            await _repository.DeleteAsync(id);

            // Cache'i temizle
            await _cache.RemoveAsync($"application:{id}");
            await _cache.RemoveAsync($"applications:user:{userId}");

            return true;
        }

        private static JobApplicationDto MapToDto(JobApplication app) => new()
        {
            Id = app.Id,
            CompanyName = app.CompanyName,
            Position = app.Position,
            JobUrl = app.JobUrl,
            Status = app.Status.ToString(),
            Location = app.Location,
            SalaryMin = app.SalaryMin,
            SalaryMax = app.SalaryMax,
            AppliedDate = app.AppliedDate,
            InterviewDate = app.InterviewDate
        };
    }
}
