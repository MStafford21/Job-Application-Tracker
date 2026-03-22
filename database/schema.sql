-- Job Application Tracker Database Schema
-- Compatible with SQL Server / SQLite

CREATE TABLE IF NOT EXISTS JobApplications (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    CompanyName TEXT NOT NULL,
    JobTitle TEXT NOT NULL,
    JobUrl TEXT,
    Location TEXT,
    Salary TEXT,
    Status TEXT NOT NULL DEFAULT 'Applied',
    -- Status options: Wishlist, Applied, Phone Screen, Interview, Technical, Offer, Rejected, Withdrawn
    Priority TEXT NOT NULL DEFAULT 'Medium',
    -- Priority options: Low, Medium, High
    AppliedDate TEXT,
    FollowUpDate TEXT,
    Notes TEXT,
    ContactName TEXT,
    ContactEmail TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    UpdatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ApplicationEvents (
    Id INTEGER PRIMARY KEY AUTOINCREMENT,
    JobApplicationId INTEGER NOT NULL,
    EventType TEXT NOT NULL,
    EventDate TEXT NOT NULL,
    Notes TEXT,
    CreatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (JobApplicationId) REFERENCES JobApplications(Id) ON DELETE CASCADE
);

-- Sample data
INSERT INTO JobApplications (CompanyName, JobTitle, Location, Salary, Status, Priority, AppliedDate, Notes, ContactName)
VALUES
  ('Stripe', 'Senior Software Engineer', 'Remote', '$180k - $220k', 'Interview', 'High', '2026-02-10', 'Great culture, strong engineering team', 'Sarah Chen'),
  ('Figma', 'Full Stack Developer', 'San Francisco, CA', '$160k - $200k', 'Applied', 'High', '2026-02-15', 'Dream company for design tools', NULL),
  ('Vercel', 'Backend Engineer', 'Remote', '$150k - $180k', 'Phone Screen', 'Medium', '2026-02-12', 'Fast growing, great DX focus', 'Mike Ross'),
  ('Notion', 'Software Engineer', 'San Francisco, CA', '$140k - $170k', 'Rejected', 'Medium', '2026-01-28', 'Good experience, move on', NULL),
  ('Linear', 'Staff Engineer', 'Remote', '$190k - $240k', 'Wishlist', 'High', NULL, 'Check back in March', NULL);
