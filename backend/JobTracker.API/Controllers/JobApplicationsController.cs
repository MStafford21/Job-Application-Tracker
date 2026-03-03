using Microsoft.AspNetCore.Mvc;
using JobTracker.API.Data;
using JobTracker.API.Models;
using JobTracker.API.DTOs;

namespace JobTracker.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly DatabaseContext _db;

    public JobApplicationsController(DatabaseContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] string? search)
    {
        var apps = await _db.GetAllAsync(status, search);
        return Ok(apps);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var app = await _db.GetByIdAsync(id);
        return app is null ? NotFound() : Ok(app);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateJobApplicationDto dto)
    {
        var app = new JobApplication
        {
            CompanyName = dto.CompanyName,
            JobTitle = dto.JobTitle,
            JobUrl = dto.JobUrl,
            Location = dto.Location,
            Salary = dto.Salary,
            Status = dto.Status,
            Priority = dto.Priority,
            AppliedDate = dto.AppliedDate,
            FollowUpDate = dto.FollowUpDate,
            Notes = dto.Notes,
            ContactName = dto.ContactName,
            ContactEmail = dto.ContactEmail
        };

        var created = await _db.CreateAsync(app);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateJobApplicationDto dto)
    {
        var existing = await _db.GetByIdAsync(id);
        if (existing is null) return NotFound();

        existing.CompanyName = dto.CompanyName;
        existing.JobTitle = dto.JobTitle;
        existing.JobUrl = dto.JobUrl;
        existing.Location = dto.Location;
        existing.Salary = dto.Salary;
        existing.Status = dto.Status;
        existing.Priority = dto.Priority;
        existing.AppliedDate = dto.AppliedDate;
        existing.FollowUpDate = dto.FollowUpDate;
        existing.Notes = dto.Notes;
        existing.ContactName = dto.ContactName;
        existing.ContactEmail = dto.ContactEmail;

        await _db.UpdateAsync(existing);
        return Ok(existing);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _db.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        var counts = await _db.GetStatusCountsAsync();
        var total = counts.Values.Sum();
        var active = counts.Where(k => new[] { "Applied", "Phone Screen", "Interview", "Technical" }.Contains(k.Key))
                          .Sum(k => k.Value);
        var stats = new StatsDto
        {
            Total = total,
            Active = active,
            Offers = counts.GetValueOrDefault("Offer", 0),
            Rejected = counts.GetValueOrDefault("Rejected", 0),
            ByStatus = counts
        };
        return Ok(stats);
    }

    [HttpPost("{id}/events")]
    public async Task<IActionResult> AddEvent(int id, [FromBody] AddEventDto dto)
    {
        var existing = await _db.GetByIdAsync(id);
        if (existing is null) return NotFound();

        var evt = new ApplicationEvent
        {
            JobApplicationId = id,
            EventType = dto.EventType,
            EventDate = dto.EventDate,
            Notes = dto.Notes
        };

        var created = await _db.AddEventAsync(evt);
        return Ok(created);
    }

    [HttpGet("statuses")]
    public IActionResult GetStatuses()
    {
        return Ok(ApplicationStatus.All);
    }
}
