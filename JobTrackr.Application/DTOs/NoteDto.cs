using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Application.DTOs
{
    public class NoteDto
    {
        public string Id { get; set; } = string.Empty;
        public Guid JobApplicationId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string NoteType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateNoteDto
    {
        public string Content { get; set; } = string.Empty;
        public string NoteType { get; set; } = "General";
    }

    public class UpdateNoteDto
    {
        public string? Content { get; set; }
        public string? NoteType { get; set; }
    }
}
