using JobTrackr.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace JobTrackr.Domain.Entities;

public class JobApplication : BaseEntity
{
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? JobUrl { get; set; }
    public JobStatus Status { get; set; } = JobStatus.Applied;
    public string? Location { get; set; }
    public decimal? SalaryMin { get; set; }
    public decimal? SalaryMax { get; set; }
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
    public DateTime? InterviewDate { get; set; }

    // Navigation property
    public User User { get; set; } = null!;
}

