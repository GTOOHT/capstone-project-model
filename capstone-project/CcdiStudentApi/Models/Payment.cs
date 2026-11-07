namespace CcdiStudentApi.Models;

public class Payment
{
    public int Id { get; set; }
    public string ReceiptNo { get; set; } = string.Empty;
    public string StudentNumber { get; set; } = string.Empty;
    public DateTime PaymentDate { get; set; } = DateTime.Today;
    public decimal Amount { get; set; }
    public string Method { get; set; } = "Cash";
    public string Status { get; set; } = "Recorded";
    public Student Student { get; set; } = null!;
}
