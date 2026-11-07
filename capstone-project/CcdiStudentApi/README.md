# CCDI Student Account Management API

Backend API for the CCDI Student Account Management System.

## Requirements

- .NET 10 SDK
- XAMPP with MySQL running
- A database named `ccdi_student_system`

## Database connection

The default `appsettings.json` connection expects MySQL on localhost port 3306, database `ccdi_student_system`, user `root`, and a blank password. Change it to match your local XAMPP settings.

## Create the database tables

Create an empty database named `ccdi_student_system` in phpMyAdmin first. Then open a terminal in this folder and run:

```powershell
dotnet restore
dotnet tool install --global dotnet-ef --version 9.0.22
dotnet ef migrations add InitialCreate
dotnet ef database update
```

If dotnet-ef is already installed, use `dotnet tool update --global dotnet-ef --version 9.0.22`.

## Run the API

```powershell
dotnet run
```

API base URL: `http://localhost:5029`

Scalar documentation: `http://localhost:5029/scalar`

## Endpoints

- `GET /` API health check
- `POST /api/students` add a student
- `GET /api/students/{studentNumber}` get a student
- `GET /api/payments/{studentNumber}` get payment history
- `POST /api/payments` record a cash payment

## Example student request

```json
{
  "studentNumber": "2026-001",
  "fullName": "Juan Dela Cruz",
  "course": "BSIT"
}
```

## Example payment request

```json
{
  "studentNumber": "2026-001",
  "receiptNo": "OR-2026-0001",
  "amount": 5000,
  "paymentDate": "2026-11-07"
}
```

The API sets payment method to Cash and status to Recorded. Use sample data for testing. Do not commit real student information or database passwords to a public repository.
