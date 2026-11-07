namespace CcdiStudentApi.Models;

public class Student
{
    public string StudentNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Course { get; set; } = string.Empty;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
