using CcdiStudentApi.Data;
using CcdiStudentApi.Models;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("The DefaultConnection string is missing from appsettings.json.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("ReactApp");

app.MapGet("/", () => Results.Ok(new
{
    message = "CCDI Student Account Management API is running."
}));

app.MapGet("/api/students", async (AppDbContext db) =>
{
    var students = await db.Students
        .AsNoTracking()
        .OrderBy(s => s.FullName)
        .Select(s => new
        {
            s.StudentNumber,
            s.FullName,
            s.Course
        })
        .ToListAsync();

    return Results.Ok(students);
});

app.MapPost("/api/students", async (CreateStudentRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.StudentNumber) ||
        string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Course))
    {
        return Results.BadRequest(new
        {
            message = "Student number, full name, and course are required."
        });
    }

    var studentNumber = request.StudentNumber.Trim();

    if (await db.Students.AnyAsync(s => s.StudentNumber == studentNumber))
    {
        return Results.Conflict(new { message = "Student number already exists." });
    }

    var student = new Student
    {
        StudentNumber = studentNumber,
        FullName = request.FullName.Trim(),
        Course = request.Course.Trim()
    };

    db.Students.Add(student);
    await db.SaveChangesAsync();

    return Results.Created($"/api/students/{student.StudentNumber}", student);
});

app.MapPut("/api/students/{studentNumber}", async (
    string studentNumber,
    UpdateStudentRequest request,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) ||
        string.IsNullOrWhiteSpace(request.Course))
    {
        return Results.BadRequest(new
        {
            message = "Full name and course are required."
        });
    }

    var student = await db.Students
        .FirstOrDefaultAsync(s => s.StudentNumber == studentNumber);

    if (student is null)
    {
        return Results.NotFound(new
        {
            message = "Student not found."
        });
    }

    student.FullName = request.FullName.Trim();
    student.Course = request.Course.Trim();

    await db.SaveChangesAsync();

    return Results.Ok(new
    {
        message = "Student information updated successfully.",
        student.StudentNumber,
        student.FullName,
        student.Course
    });
});

app.MapGet("/api/students/{studentNumber}", async (string studentNumber, AppDbContext db) =>
{
    var student = await db.Students
        .AsNoTracking()
        .Where(s => s.StudentNumber == studentNumber)
        .Select(s => new
        {
            s.StudentNumber,
            s.FullName,
            s.Course
        })
        .FirstOrDefaultAsync();

    return student is null
        ? Results.NotFound(new { message = "Student not found." })
        : Results.Ok(student);
});

app.MapGet("/api/payments/{studentNumber}", async (string studentNumber, AppDbContext db) =>
{
    var studentExists = await db.Students.AnyAsync(s => s.StudentNumber == studentNumber);
    if (!studentExists)
    {
        return Results.NotFound(new { message = "Student not found." });
    }

    var payments = await db.Payments
        .AsNoTracking()
        .Where(p => p.StudentNumber == studentNumber)
        .OrderByDescending(p => p.PaymentDate)
        .Select(p => new
        {
            p.Id,
            p.ReceiptNo,
            p.StudentNumber,
            p.PaymentDate,
            p.Amount,
            p.Method,
            p.Status
        })
        .ToListAsync();

    return Results.Ok(payments);
});

app.MapPost("/api/payments", async (CreatePaymentRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.StudentNumber) ||
        string.IsNullOrWhiteSpace(request.ReceiptNo) ||
        request.Amount <= 0)
    {
        return Results.BadRequest(new
        {
            message = "Enter a student number, receipt number, and amount greater than zero."
        });
    }

    var studentNumber = request.StudentNumber.Trim();
    var receiptNo = request.ReceiptNo.Trim();

    var studentExists = await db.Students.AnyAsync(s => s.StudentNumber == studentNumber);
    if (!studentExists)
    {
        return Results.NotFound(new { message = "Student not found. Add the student record first." });
    }

    if (await db.Payments.AnyAsync(p => p.ReceiptNo == receiptNo))
    {
        return Results.Conflict(new { message = "This receipt number already exists." });
    }

    var payment = new Payment
    {
        StudentNumber = studentNumber,
        ReceiptNo = receiptNo,
        PaymentDate = request.PaymentDate?.Date ?? DateTime.Today,
        Amount = request.Amount,
        Method = "Cash",
        Status = "Recorded"
    };

    db.Payments.Add(payment);
    await db.SaveChangesAsync();

    return Results.Created($"/api/payments/{payment.StudentNumber}", new
    {
        payment.Id,
        payment.ReceiptNo,
        payment.StudentNumber,
        payment.PaymentDate,
        payment.Amount,
        payment.Method,
        payment.Status
    });
});

app.Run();

public record CreateStudentRequest(string StudentNumber, string FullName, string Course);
public record UpdateStudentRequest(string FullName, string Course);
public record CreatePaymentRequest(string StudentNumber, string ReceiptNo, decimal Amount, DateTime? PaymentDate);
