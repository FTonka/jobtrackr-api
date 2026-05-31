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
    public class NoteService : INoteService
    {
        private readonly INoteRepository _noteRepository;

        public NoteService(INoteRepository noteRepository)
        {
            _noteRepository = noteRepository;
        }

        public async Task<IEnumerable<NoteDto>> GetByJobApplicationIdAsync(Guid jobApplicationId, Guid userId)
        {
            var notes = await _noteRepository.GetByJobApplicationIdAsync(jobApplicationId);
            return notes.Where(n => n.UserId == userId).Select(MapToDto);
        }

        public async Task<NoteDto> CreateAsync(Guid jobApplicationId, Guid userId, CreateNoteDto dto)
        {
            var note = new Note
            {
                JobApplicationId = jobApplicationId,
                UserId = userId,
                Content = dto.Content,
                NoteType = dto.NoteType
            };

            var created = await _noteRepository.CreateAsync(note);
            return MapToDto(created);
        }

        public async Task<NoteDto?> UpdateAsync(string id, Guid userId, UpdateNoteDto dto)
        {
            var note = await _noteRepository.GetByIdAsync(id);
            if (note == null || note.UserId != userId) return null;

            if (dto.Content != null) note.Content = dto.Content;
            if (dto.NoteType != null) note.NoteType = dto.NoteType;

            await _noteRepository.UpdateAsync(note);
            return MapToDto(note);
        }

        public async Task<bool> DeleteAsync(string id, Guid userId)
        {
            var note = await _noteRepository.GetByIdAsync(id);
            if (note == null || note.UserId != userId) return false;

            await _noteRepository.DeleteAsync(id);
            return true;
        }

        private static NoteDto MapToDto(Note note) => new()
        {
            Id = note.Id,
            JobApplicationId = note.JobApplicationId,
            Content = note.Content,
            NoteType = note.NoteType,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}
