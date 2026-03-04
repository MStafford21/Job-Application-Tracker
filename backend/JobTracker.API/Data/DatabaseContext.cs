using Dapper;
using Npgsql;
using JobTracker.API.Models;

namespace JobTracker.API.Data;

public class DatabaseContext
{
    private readonly string _connectionString;

    public DatabaseContext(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") 
            ?? "Data Source=jobtracker.db";
        InitializeDatabase();
    }

    private NpgsqlConnection CreateConnection() => new NpgsqlConnection(_connectionString);

    private void InitializeDatabase()
    {
        using var connection = CreateConnection();
        connection.Open();

        connection.Execute(@"
            CREATE TABLE IF NOT EXISTS JobApplications (
                Id SERIAL PRIMARY KEY,
                CompanyName TEXT NOT NULL,
                JobTitle TEXT NOT NULL,
                JobUrl TEXT,
                Location TEXT,
                Salary TEXT,
                Status TEXT NOT NULL DEFAULT 'Applied',
                Priority TEXT NOT NULL DEFAULT 'Medium',
                AppliedDate TIMESTAMPTZ,
                FollowUpDate TIMESTAMPTZ,
                Notes TEXT,
                ContactName TEXT,
                ContactEmail TEXT,
                CreatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UpdatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ApplicationEvents (
                Id SERIAL PRIMARY KEY,
                JobApplicationId INTEGER NOT NULL REFERENCES JobApplications(Id) ON DELETE CASCADE,
                EventType TEXT NOT NULL,
                EventDate TIMESTAMPTZ NOT NULL,
                Notes TEXT,
                CreatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        ");
    }

    // --- JobApplications CRUD ---

    public async Task<IEnumerable<JobApplication>> GetAllAsync(string? status = null, string? search = null)
    {
        using var connection = CreateConnection();
        var sql = "SELECT * FROM JobApplications WHERE 1=1";
        var parameters = new DynamicParameters();

        if (!string.IsNullOrEmpty(status))
        {
            sql += " AND Status = @Status";
            parameters.Add("Status", status);
        }

        if (!string.IsNullOrEmpty(search))
        {
            sql += " AND (CompanyName ILIKE @Search OR JobTitle ILIKE @Search OR Location ILIKE @Search)";
            parameters.Add("Search", $"%{search}%");
        }

        sql += " ORDER BY CreatedAt DESC";
        return await connection.QueryAsync<JobApplication>(sql, parameters);
    }

    public async Task<JobApplication?> GetByIdAsync(int id)
    {
        using var connection = CreateConnection();
        var app = await connection.QueryFirstOrDefaultAsync<JobApplication>(
            "SELECT * FROM JobApplications WHERE Id = @Id", new { Id = id });
        
        if (app != null)
        {
            app.Events = (await connection.QueryAsync<ApplicationEvent>(
                "SELECT * FROM ApplicationEvents WHERE JobApplicationId = @Id ORDER BY EventDate DESC",
                new { Id = id })).ToList();
        }
        
        return app;
    }

    public async Task<JobApplication> CreateAsync(JobApplication app)
    {
        using var connection = CreateConnection();
        var sql = @"
            INSERT INTO JobApplications (CompanyName, JobTitle, JobUrl, Location, Salary, Status, Priority, 
                AppliedDate, FollowUpDate, Notes, ContactName, ContactEmail, CreatedAt, UpdatedAt)
            VALUES (@CompanyName, @JobTitle, @JobUrl, @Location, @Salary, @Status, @Priority,
                @AppliedDate, @FollowUpDate, @Notes, @ContactName, @ContactEmail, @CreatedAt, @UpdatedAt)
            RETURNING Id;";
        
        app.CreatedAt = DateTime.UtcNow;
        app.UpdatedAt = DateTime.UtcNow;
        app.Id = await connection.ExecuteScalarAsync<int>(sql, app);
        return app;
    }

    public async Task<bool> UpdateAsync(JobApplication app)
    {
        using var connection = CreateConnection();
        app.UpdatedAt = DateTime.UtcNow;
        var rows = await connection.ExecuteAsync(@"
            UPDATE JobApplications SET
                CompanyName = @CompanyName, JobTitle = @JobTitle, JobUrl = @JobUrl,
                Location = @Location, Salary = @Salary, Status = @Status, Priority = @Priority,
                AppliedDate = @AppliedDate, FollowUpDate = @FollowUpDate, Notes = @Notes,
                ContactName = @ContactName, ContactEmail = @ContactEmail, UpdatedAt = @UpdatedAt
            WHERE Id = @Id", app);
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(
            "DELETE FROM JobApplications WHERE Id = @Id", new { Id = id });
        return rows > 0;
    }

    // --- Stats ---
    public async Task<Dictionary<string, int>> GetStatusCountsAsync()
    {
        using var connection = CreateConnection();
        var results = await connection.QueryAsync<(string Status, int Count)>(
            "SELECT Status, COUNT(*)::int as Count FROM JobApplications GROUP BY Status");
        return results.ToDictionary(r => r.Status, r => r.Count);
    }

    // --- Events ---
    public async Task<ApplicationEvent> AddEventAsync(ApplicationEvent evt)
    {
        using var connection = CreateConnection();
        var sql = @"
            INSERT INTO ApplicationEvents (JobApplicationId, EventType, EventDate, Notes, CreatedAt)
            VALUES (@JobApplicationId, @EventType, @EventDate, @Notes, @CreatedAt)
            RETURNING Id;";
        evt.CreatedAt = DateTime.UtcNow;
        evt.Id = await connection.ExecuteScalarAsync<int>(sql, evt);
        return evt;
    }
}
