using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobTrackr.Domain.Entities
{
    public class Note
    {
        public string Id { get; set; } = string.Empty;
        public Guid JobApplicationId { get; set; }
        public Guid UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string NoteType { get; set; } = "General"; // General, Interview, Research
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
