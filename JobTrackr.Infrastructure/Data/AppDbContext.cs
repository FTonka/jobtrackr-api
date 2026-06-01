using JobTrackr.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<JobApplication> JobApplications => Set<JobApplication>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(256);
                entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
            });

            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.CompanyName).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Position).IsRequired().HasMaxLength(200);
                entity.Property(e => e.SalaryMin).HasPrecision(18, 2);
                entity.Property(e => e.SalaryMax).HasPrecision(18, 2);
                entity.Property(e => e.Status)
                      .HasConversion<string>();

                entity.HasOne(e => e.User)
                      .WithMany(u => u.JobApplications)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
