using JobTrackr.Application.DTOs;
using JobTrackr.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobTrackr.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobApplicationsController : ControllerBase
    {
        private readonly IJobApplicationService _service;

        public JobApplicationsController(IJobApplicationService service)
        {
            _service = service;
        }

        private Guid GetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(claim!);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = GetUserId();
            var applications = await _service.GetUserApplicationsAsync(userId);
            return Ok(applications);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var userId = GetUserId();
            var application = await _service.GetByIdAsync(id, userId);
            if (application == null) return NotFound();
            return Ok(application);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateJobApplicationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CompanyName) ||
                string.IsNullOrWhiteSpace(dto.Position))
                return BadRequest("Şirket adı ve pozisyon zorunludur.");

            var userId = GetUserId();
            var created = await _service.CreateAsync(userId, dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateJobApplicationDto dto)
        {
            var userId = GetUserId();
            var updated = await _service.UpdateAsync(id, userId, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserId();
            var result = await _service.DeleteAsync(id, userId);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
