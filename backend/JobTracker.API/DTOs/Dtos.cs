namespace JobTracker.API.DTOs;

public class CreateJobApplicationDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string JobTitle { get; set; } = string.Empty;
    public string? JobUrl { get; set; }
    public string? Location { get; set; }
    public string? Salary { get; set; }
    public string Status { get; set; } = "Applied";
    public string Priority { get; set; } = "Medium";
    public DateTime? AppliedDate { get; set; }
    public DateTime? FollowUpDate { get; set; }
    public string? Notes { get; set; }
    public string? ContactName { get; set; }
    public string? ContactEmail { get; set; }
}

public class UpdateJobApplicationDto : CreateJobApplicationDto { }

public class AddEventDto
{
    public string EventType { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string? Notes { get; set; }
}

public class StatsDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Offers { get; set; }
    public int Rejected { get; set; }
    public Dictionary<string, int> ByStatus { get; set; } = new();
}
