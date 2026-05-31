using JobTrackr.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Domain.Interfaces
{
    public interface INoteRepository
    {
        Task<IEnumerable<Note>> GetByJobApplicationIdAsync(Guid jobApplicationId);
        Task<Note?> GetByIdAsync(string id);
        Task<Note> CreateAsync(Note note);
        Task UpdateAsync(Note note);
        Task DeleteAsync(string id);
    }
}
