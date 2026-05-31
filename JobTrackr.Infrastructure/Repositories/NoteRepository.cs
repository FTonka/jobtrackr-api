using JobTrackr.Domain.Entities;
using JobTrackr.Domain.Interfaces;
using JobTrackr.Infrastructure.Data;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Infrastructure.Repositories
{
    public class NoteRepository : INoteRepository
    {
        private readonly MongoDbContext _context;

        public NoteRepository(MongoDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Note>> GetByJobApplicationIdAsync(Guid jobApplicationId)
        {
            var filter = Builders<Note>.Filter.Eq(n => n.JobApplicationId, jobApplicationId);
            return await _context.Notes.Find(filter).ToListAsync();
        }

        public async Task<Note?> GetByIdAsync(string id)
        {
            var filter = Builders<Note>.Filter.Eq(n => n.Id, id);
            return await _context.Notes.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<Note> CreateAsync(Note note)
        {
            note.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
            await _context.Notes.InsertOneAsync(note);
            return note;
        }

        public async Task UpdateAsync(Note note)
        {
            note.UpdatedAt = DateTime.UtcNow;
            var filter = Builders<Note>.Filter.Eq(n => n.Id, note.Id);
            await _context.Notes.ReplaceOneAsync(filter, note);
        }

        public async Task DeleteAsync(string id)
        {
            var filter = Builders<Note>.Filter.Eq(n => n.Id, id);
            await _context.Notes.DeleteOneAsync(filter);
        }
    }
}
