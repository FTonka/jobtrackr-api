using JobTrackr.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Application.Interfaces
{
    public interface INoteService
    {
        Task<IEnumerable<NoteDto>> GetByJobApplicationIdAsync(Guid jobApplicationId, Guid userId);
        Task<NoteDto> CreateAsync(Guid jobApplicationId, Guid userId, CreateNoteDto dto);
        Task<NoteDto?> UpdateAsync(string id, Guid userId, UpdateNoteDto dto);
        Task<bool> DeleteAsync(string id, Guid userId);
    }
}
