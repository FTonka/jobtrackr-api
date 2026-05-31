using JobTrackr.Application.DTOs;
using JobTrackr.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobTrackr.API.Controllers
{
    [ApiController]
    [Route("api/jobapplications/{jobApplicationId}/notes")]
    [Authorize]
    public class NotesController : ControllerBase
    {
        private readonly INoteService _noteService;

        public NotesController(INoteService noteService)
        {
            _noteService = noteService;
        }

        private Guid GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(claim!);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(Guid jobApplicationId)
        {
            var notes = await _noteService.GetByJobApplicationIdAsync(jobApplicationId, GetUserId());
            return Ok(notes);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Guid jobApplicationId, [FromBody] CreateNoteDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Content))
                return BadRequest("Not içeriği boş olamaz.");

            var created = await _noteService.CreateAsync(jobApplicationId, GetUserId(), dto);
            return Ok(created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid jobApplicationId, string id, [FromBody] UpdateNoteDto dto)
        {
            var updated = await _noteService.UpdateAsync(id, GetUserId(), dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid jobApplicationId, string id)
        {
            var result = await _noteService.DeleteAsync(id, GetUserId());
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
