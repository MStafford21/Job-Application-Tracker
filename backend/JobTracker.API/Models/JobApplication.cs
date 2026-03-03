namespace JobTracker.API.Models;

public class JobApplication
{
    public int Id { get; set; }
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public List<ApplicationEvent> Events { get; set; } = new();
}

public class ApplicationEvent
{
    public int Id { get; set; }
    public int JobApplicationId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public DateTime EventDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public static class ApplicationStatus
{
    public const string Wishlist = "Wishlist";
    public const string Applied = "Applied";
    public const string PhoneScreen = "Phone Screen";
    public const string Interview = "Interview";
    public const string Technical = "Technical";
    public const string Offer = "Offer";
    public const string Rejected = "Rejected";
    public const string Withdrawn = "Withdrawn";
    
    public static readonly string[] All = { Wishlist, Applied, PhoneScreen, Interview, Technical, Offer, Rejected, Withdrawn };
}

public static class ApplicationPriority
{
    public const string Low = "Low";
    public const string Medium = "Medium";
    public const string High = "High";
    
    public static readonly string[] All = { Low, Medium, High };
}
