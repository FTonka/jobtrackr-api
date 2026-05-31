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
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id)
            => await _context.Users.FindAsync(id);

        public async Task<User?> GetByEmailAsync(string email)
            => await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email.ToLower());

        public async Task<User> CreateAsync(User user)
        {
            user.Email = user.Email.ToLower();
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user;
        }
    }
}
