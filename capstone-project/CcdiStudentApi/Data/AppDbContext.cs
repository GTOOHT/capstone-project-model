using CcdiStudentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CcdiStudentApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>(entity =>
        {
            entity.HasKey(student => student.StudentNumber);
            entity.Property(student => student.StudentNumber).HasMaxLength(30);
            entity.Property(student => student.FullName).HasMaxLength(150).IsRequired();
            entity.Property(student => student.Course).HasMaxLength(100).IsRequired();
        });

        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(payment => payment.Id);
            entity.Property(payment => payment.ReceiptNo).HasMaxLength(50).IsRequired();
            entity.Property(payment => payment.StudentNumber).HasMaxLength(30).IsRequired();
            entity.Property(payment => payment.Amount).HasPrecision(10, 2);
            entity.Property(payment => payment.Method).HasMaxLength(30).IsRequired();
            entity.Property(payment => payment.Status).HasMaxLength(30).IsRequired();
            entity.HasIndex(payment => payment.ReceiptNo).IsUnique();

            entity.HasOne(payment => payment.Student)
                .WithMany(student => student.Payments)
                .HasForeignKey(payment => payment.StudentNumber)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
