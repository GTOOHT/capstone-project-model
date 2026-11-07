import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_URL = "http://localhost:5029";
const STUDENT_NUMBER = "2026-001";

function App() {
  
const [page, setPage] = useState("login");
const [activeMenu, setActiveMenu] = useState("Dashboard");
const [activeStudentMenu, setActiveStudentMenu] = useState("Overview");
const [loginRole, setLoginRole] = useState("admin");

const [showPassword, setShowPassword] = useState(false);

const [username, setUsername] = useState("");
const [password, setPassword] = useState("");

const [studentList, setStudentList] = useState([]);
const [studentsLoading, setStudentsLoading] = useState(false);
const [studentsError, setStudentsError] = useState("");
const [studentSearch, setStudentSearch] = useState("");
const [showStudentForm, setShowStudentForm] = useState(false);
const [newStudentNumber, setNewStudentNumber] = useState("");
const [newStudentName, setNewStudentName] = useState("");
const [newStudentCourse, setNewStudentCourse] = useState("");
const [studentMessage, setStudentMessage] = useState("");
const [savingStudent, setSavingStudent] = useState(false);

const [editingStudentNumber, setEditingStudentNumber] = useState("");
const [editStudentName, setEditStudentName] = useState("");
const [editStudentCourse, setEditStudentCourse] = useState("");
const [savingEdit, setSavingEdit] = useState(false);
const handleUpdateStudent = async (e) => {
  e.preventDefault();

  setStudentMessage("");
  setSavingEdit(true);

  try {
    const response = await fetch(
      `${API_URL}/api/students/${editingStudentNumber}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: editStudentName.trim(),
          course: editStudentCourse.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.title || "Failed to update student."
      );
    }

    setStudentMessage("Student information updated successfully.");

    setEditingStudentNumber("");
    setEditStudentName("");
    setEditStudentCourse("");

    await loadStudents();

    if (editingStudentNumber === STUDENT_NUMBER) {
      const response = await fetch(
        `${API_URL}/api/students/${STUDENT_NUMBER}`
      );

      if (response.ok) {
        setStudent(await response.json());
      }
    }
  } catch (error) {
    setStudentMessage(error.message);
  } finally {
    setSavingEdit(false);
  }
};

const [payments, setPayments] = useState([]);
const [paymentLoading, setPaymentLoading] = useState(false);
const [paymentError, setPaymentError] = useState("");

const [student, setStudent] = useState(null);
const [studentLoading, setStudentLoading] = useState(true);
const [studentError, setStudentError] = useState("");

const [receiptNo, setReceiptNo] = useState("");
const [paymentStudentNumber, setPaymentStudentNumber] = useState("2026-001");
const [paymentAmount, setPaymentAmount] = useState("");
const [paymentDate, setPaymentDate] = useState(
  new Date().toLocaleDateString("en-CA")
);
const [paymentMessage, setPaymentMessage] = useState("");
const [savingPayment, setSavingPayment] = useState(false);

const studentName = student?.fullName || "Student Name";
const studentNumber = student?.studentNumber || STUDENT_NUMBER;
const studentCourse = student?.course || "Course not provided";
const studentInitials = studentName === "Student Name"
  ? "ST"
  : studentName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

useEffect(() => {
  const loadStudent = async () => {
    setStudentLoading(true);
    setStudentError("");

    try {
      const response = await fetch(
        `${API_URL}/api/students/${STUDENT_NUMBER}`
      );

      if (!response.ok) {
        throw new Error("Failed to load student information.");
      }

      const data = await response.json();
      setStudent(data);
    } catch (error) {
      setStudentError(error.message);
    } finally {
      setStudentLoading(false);
    }
  };

  loadStudent();
}, []);

useEffect(() => {
  const loadPayments = async () => {
    setPaymentLoading(true);
    setPaymentError("");

    try {
      const response = await fetch(
        `${API_URL}/api/payments/${STUDENT_NUMBER}`
      );

      if (!response.ok) {
        throw new Error("Failed to load payment records.");
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      setPaymentError(error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  loadPayments();
}, []);

const loadStudents = async () => {
  setStudentsLoading(true);
  setStudentsError("");

  try {
    const response = await fetch(`${API_URL}/api/students`);

    if (!response.ok) {
      throw new Error("Failed to load student records.");
    }

    const data = await response.json();
    setStudentList(data);
  } catch (error) {
    setStudentsError(error.message);
  } finally {
    setStudentsLoading(false);
  }
};

useEffect(() => {
  loadStudents();
}, []);

const filteredStudents = studentList.filter((item) => {
  const search = studentSearch.toLowerCase();

  return (
    item.studentNumber?.toLowerCase().includes(search) ||
    item.fullName?.toLowerCase().includes(search) ||
    item.course?.toLowerCase().includes(search)
  );
});

const handleCreateStudent = async (e) => {
  e.preventDefault();
  setStudentMessage("");
  setSavingStudent(true);

  try {
    const response = await fetch(`${API_URL}/api/students`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentNumber: newStudentNumber.trim(),
        fullName: newStudentName.trim(),
        course: newStudentCourse.trim(),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.title || "Failed to register student."
      );
    }

    setStudentMessage("Student successfully registered.");
    setNewStudentNumber("");
    setNewStudentName("");
    setNewStudentCourse("");
    setShowStudentForm(false);
    await loadStudents();
  } catch (error) {
    setStudentMessage(error.message);
  } finally {
    setSavingStudent(false);
  }
};

const handleRecordPayment = async (e) => {
  e.preventDefault();

  setPaymentMessage("");
  setSavingPayment(true);

  try {
    const response = await fetch(`${API_URL}/api/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentNumber: paymentStudentNumber,
        receiptNo: receiptNo,
        amount: Number(paymentAmount),
        paymentDate: paymentDate,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || result.title || "Failed to record payment."
      );
    }

    setPaymentMessage("Payment successfully recorded!");

    setReceiptNo("");
    setPaymentAmount("");

    if (paymentStudentNumber === STUDENT_NUMBER) {
      const paymentResponse = await fetch(
        `${API_URL}/api/payments/${STUDENT_NUMBER}`
      );

      if (paymentResponse.ok) {
        const data = await paymentResponse.json();
        setPayments(data);
      }
    }
  } catch (error) {
    setPaymentMessage(error.message);
  } finally {
    setSavingPayment(false);
  }
};


  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginRole === "student") {
      setActiveStudentMenu("Overview");
      setPage("student-dashboard");
      return;
    }
    setPage("dashboard");
  };

  // LOGOUT
  const handleLogout = () => {
    setPage("login");
    setUsername("");
    setPassword("");
    setLoginRole("admin");
    setActiveMenu("Dashboard");
    setActiveStudentMenu("Overview");
  };

  // ========================================
  // LOGIN PAGE
  // ========================================

  if (page === "login") {
    return (
      <div className="auth-page">
        <div className="auth-card">

          {/* LOGO / BRAND */}

          <div className="brand">
            <div className="brand-logo">
              C
            </div>

            <div>
              <h1>CCDI</h1>
              <span>CCDI Portal</span>
            </div>
          </div>

          {/* LOGIN HEADING */}

          <div className="auth-heading">

            <p className="eyebrow">
              STUDENT ACCOUNT MANAGEMENT SYSTEM FOR COMPUTER COMMUNICATION DEVELOPMENT INSTITUTE
            </p>

            <p>
              Log in.
            </p>

          </div>

          {/* LOGIN FORM */}

          <form onSubmit={handleLogin}>

            {/* USERNAME */}

            <label>
              Username
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                👤
              </span>

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />

            </div>

            {/* ACCOUNT TYPE */}

            <label>
              Sign in as
            </label>

            <div className="input-wrapper role-select-wrapper">
              <span className="input-icon">▣</span>
              <select
                value={loginRole}
                onChange={(e) => setLoginRole(e.target.value)}
                aria-label="Sign in as"
              >
                <option value="admin">Administrator</option>
                <option value="student">Student</option>
              </select>
            </div>

            {/* PASSWORD */}

            <label>
              Password
            </label>

            <div className="input-wrapper">

              <span className="input-icon">
                🔒
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {/* OPTIONS */}

            <div className="login-options">

              <label className="remember">

                <input
                  type="checkbox"
                />

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
              >
                Forgot password?
              </button>

            </div>

            {/* LOGIN BUTTON */}

            <button
              className="primary-button"
              type="submit"
            >
              Login
            </button>

          </form>

          {/* DIVIDER */}

          <div className="divider">
            <span>or</span>
          </div>

          {/* REGISTER */}

          <p className="register-text">

            Don't have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("register")
              }
            >
              Register
            </button>

          </p>

          {/* SECURITY */}

          <p className="security-message">
            🔐 Your account information is
            securely protected.
          </p>

        </div>
      </div>
    );
  }

  // ========================================
  // REGISTER PAGE
  // ========================================

  if (page === "register") {
    return (
      <div className="auth-page">

        <div className="auth-card register-card">

          {/* BACK */}

          <button
            className="back-button"
            onClick={() =>
              setPage("login")
            }
          >
            ← Back to Login
          </button>

          {/* BRAND */}

          <div className="brand">

            <div className="brand-logo">
              C
            </div>

            <div>
              <h1>CCDI</h1>
              <span>CCDI Portal</span>
            </div>

          </div>

          {/* REGISTER HEADING */}

          <div className="auth-heading">

            <p className="eyebrow">
              CREATE ACCOUNT
            </p>

            <p>
              Fill in your details to create
              a student account.
            </p>

          </div>

          {/* FIRST / LAST NAME */}

          <div className="two-column">

            <div>

              <label>
                First Name
              </label>

              <input
                className="normal-input"
                placeholder="First name"
              />

            </div>

            <div>

              <label>
                Last Name
              </label>

              <input
                className="normal-input"
                placeholder="Last name"
              />

            </div>

          </div>

          {/* STUDENT ID */}

          <label>
            Student ID
          </label>

          <input
            className="normal-input"
            placeholder="e.g. 2026-001"
          />

          {/* EMAIL */}

          <label>
            Email Address
          </label>

          <input
            className="normal-input"
            type="email"
            placeholder="student@example.com"
          />

          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            className="normal-input"
            type="password"
            placeholder="Create a password"
          />

          {/* CREATE ACCOUNT */}

          <button
            className="primary-button register-button"
            onClick={() =>
              setPage("login")
            }
          >
            Create Account
          </button>

          {/* LOGIN LINK */}

          <p className="register-text">

            Already have an account?

            <button
              className="link-button"
              onClick={() =>
                setPage("login")
              }
            >
              Login
            </button>

          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // STUDENT ACCOUNT DASHBOARD
  // ========================================

  if (page === "student-dashboard") {
    const studentMenuItems = ["Overview", "My Account", "Payment History", "Discounts"];
    return (
      <div className="student-portal">
        <aside className="student-sidebar">
          <div className="student-brand">
            <div className="student-brand-logo">C</div>
            <div><strong>CCDI</strong><small>Student Portal</small></div>
          </div>
          <div className="student-profile-block">
            <div className="student-avatar">{studentInitials}</div>
            <div><strong>{studentLoading ? "Loading student..." : studentName}</strong><small>{studentNumber} · {studentCourse}</small></div>
          </div>
          <p className="student-nav-label">MY PORTAL</p>
          <nav className="student-nav">
            {studentMenuItems.map((item) => (
              <button key={item} className={activeStudentMenu === item ? "student-nav-item selected" : "student-nav-item"} onClick={() => setActiveStudentMenu(item)}>
                <span>{item === "Overview" ? "⌂" : item === "My Account" ? "▣" : item === "Payment History" ? "▤" : "✦"}</span>{item}
              </button>
            ))}
          </nav>
          <button className="student-logout" onClick={handleLogout}>↪ Log out</button>
        </aside>

        <main className="student-main">
          <header className="student-topbar">
            <div><p className="student-eyebrow">STUDENT ACCOUNT MANAGEMENT SYSTEM</p><h1>{activeStudentMenu}</h1></div>
            <div className="student-topbar-user"><div className="student-avatar small-avatar">{studentInitials}</div><div><strong>{studentName}</strong><small>Student</small></div></div>
          </header>

          {studentError && (
            <p className="student-note">{studentError} Check that the backend is running and that student {STUDENT_NUMBER} exists in the database.</p>
          )}

          {activeStudentMenu === "Overview" && (
            <>
              <section className="student-welcome">
                <div><p>STUDENT PORTAL</p><h2>Hello, {studentName === "Student Name" ? "Student" : studentName.split(" ")[0]}!</h2><span>View your school account, payment records, and available discounts here.</span></div>
                <div className="welcome-mark">CCDI</div>
              </section>
              <section className="student-summary-grid">
                <article className="student-summary-card balance-card"><div className="summary-card-top"><span className="summary-icon">₱</span><span className="summary-tag">Current balance</span></div><p>Remaining Balance</p><h3>₱10,000.00</h3><small>Updated October 20, 2026</small></article>
                <article className="student-summary-card"><div className="summary-card-top"><span className="summary-icon green-icon">✓</span><span className="summary-tag paid-tag">Payments</span></div><p>Total Paid</p><h3>₱20,000.00</h3><small>Across all recorded payments</small></article>
                <article className="student-summary-card"><div className="summary-card-top"><span className="summary-icon purple-icon">▤</span><span className="summary-tag">School fees</span></div><p>Total Assessed Fees</p><h3>₱30,000.00</h3><small>For the current school year</small></article>
              </section>
              <section className="student-content-grid">
                <article className="student-panel student-account-panel">
                  <div className="student-panel-heading"><div><h3>Student Account</h3><p>Your personal and enrollment details</p></div><span className="account-status">Active</span></div>
                  <div className="student-details-grid">
                    <div><span>Student Name</span><strong>{studentLoading ? "Loading..." : studentName}</strong></div>
                    <div><span>Student Number</span><strong>{studentNumber}</strong></div>
                    <div><span>Course</span><strong>{studentCourse}</strong></div>
                    <div><span>Year Level</span><strong>Not provided</strong></div>
                    <div><span>School Year</span><strong>2026–2027</strong></div>
                    <div><span>Account Status</span><strong>In good standing</strong></div>
                  </div>
                  <button className="student-outline-button" onClick={() => setActiveStudentMenu("My Account")}>View account details</button>
                </article>
                <article className="student-panel discount-panel">
                  <div className="discount-symbol">✦</div><h3>Student Discount</h3><p>Check if a scholarship, student discount, or approved adjustment is available for your account.</p>
                  <div className="discount-status"><span>Current status</span><strong>No discount recorded</strong></div>
                  <button className="student-outline-button" onClick={() => setActiveStudentMenu("Discounts")}>View discount details</button>
                </article>
              </section>
              <section className="student-panel recent-payments-panel">
                <div className="student-panel-heading"><div><h3>Recent Payments</h3><p>Your latest recorded transactions</p></div><button className="student-text-button" onClick={() => setActiveStudentMenu("Payment History")}>View all payments →</button></div>
                <div className="student-table-wrap"><table className="student-table"><thead><tr><th>Receipt No.</th><th>Date</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                    {paymentLoading ? (
                      <tr><td colSpan="5">Loading payments...</td></tr>
                    ) : paymentError ? (
                      <tr><td colSpan="5">{paymentError}</td></tr>
                    ) : payments.length === 0 ? (
                      <tr><td colSpan="5">No payment records found.</td></tr>
                    ) : (
                      payments.slice(0, 3).map((payment) => (
                        <tr key={payment.id}>
                          <td><strong>{payment.receiptNo}</strong></td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td>{payment.method}</td>
                          <td className="payment-amount">
                            ₱{Number(payment.amount).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td><span className="payment-status">{payment.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody></table></div>
              </section>
            </>
          )}

          {activeStudentMenu === "My Account" && (
            <section className="student-panel student-page-panel"><h3>My Account Details</h3><p className="student-page-description">Review your student information, current fees, and account balance.</p><div className="student-details-grid"><div><span>Student Name</span><strong>{studentLoading ? "Loading..." : studentName}</strong></div><div><span>Student Number</span><strong>{studentNumber}</strong></div><div><span>Course</span><strong>{studentCourse}</strong></div></div><div className="account-total-row"><span>Total assessed fees</span><strong>₱30,000.00</strong></div><div className="account-total-row"><span>Total payments</span><strong className="positive-value">− ₱20,000.00</strong></div><div className="account-total-row final-total"><span>Remaining balance</span><strong>₱10,000.00</strong></div><p className="student-note">Student name, number, and course are loaded from the school database. Fee and balance figures are still sample data.</p></section>
          )}

          {activeStudentMenu === "Payment History" && (
            <section className="student-panel student-page-panel"><div className="student-panel-heading"><div><h3>Payment History and Receipts</h3><p>Payments recorded for your student account</p></div></div><div className="student-table-wrap"><table className="student-table"><thead><tr><th>Receipt No.</th><th>Date</th><th>Payment Method</th><th>Amount</th><th>Status</th></tr></thead><tbody>
                    {paymentLoading ? (
                      <tr><td colSpan="5">Loading payments...</td></tr>
                    ) : paymentError ? (
                      <tr><td colSpan="5">{paymentError}</td></tr>
                    ) : payments.length === 0 ? (
                      <tr><td colSpan="5">No payment records found.</td></tr>
                    ) : (
                      payments.map((payment) => (
                        <tr key={payment.id}>
                          <td><strong>{payment.receiptNo}</strong></td>
                          <td>
                            {new Date(payment.paymentDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </td>
                          <td>{payment.method}</td>
                          <td className="payment-amount">
                            ₱{Number(payment.amount).toLocaleString("en-PH", {
                              minimumFractionDigits: 2,
                            })}
                          </td>
                          <td><span className="payment-status">{payment.status}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody></table></div></section>
          )}

          {activeStudentMenu === "Discounts" && (
            <section className="student-panel student-page-panel"><div className="discount-symbol">✦</div><h3>Discounts and Scholarships</h3><p className="student-page-description">Approved discounts will appear here when recorded by the school administrator.</p><div className="discount-status"><span>Current status</span><strong>No discount recorded</strong></div><p className="student-note">Ask the school office to confirm your eligibility. This demo does not apply discounts to the balance.</p></section>
          )}
        </main>
      </div>
    );
  }

  // ========================================
  // ADMIN/CASHIER DASHBOARD
  // ========================================

  const menuItems = [
    "Dashboard",
    "Students",
    "Accounts",
    "Reports",
    "Settings",
  ];

  return (
    <div className="dashboard">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="brand-logo">
            C
          </div>

          <div>
            <strong>
              CCDI
            </strong>

            <small>
              CCDI Portal
            </small>
          </div>

        </div>

        {/* ADMIN PROFILE */}

        <div className="admin-profile">

          <div className="admin-avatar">
            AD
          </div>

          <div>

            <strong>
              Admin User
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav>

          <p className="navigation-title">
            MAIN MENU
          </p>

          {menuItems.map((item) => (

            <button
              key={item}
              className={
                activeMenu === item
                  ? "navigation-item active"
                  : "navigation-item"
              }
              onClick={() =>
                setActiveMenu(item)
              }
            >

              <span className="navigation-icon">

                {item === "Dashboard" && "⌂"}
                {item === "Students" && "♙"}
                {item === "Accounts" && "▣"}
                {item === "Reports" && "▤"}
                {item === "Settings" && "⚙"}

              </span>

              {item}

            </button>

          ))}

        </nav>

        {/* LOGOUT */}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          ↪ Logout
        </button>

      </aside>

      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              STUDENT ACCOUNT MANAGEMENT SYSTEM for Computer Communication Development Institute
            </p>

            <h1>
              {activeMenu}
            </h1>

          </div>

          <div className="topbar-right">

            <button className="notification-button">
              🔔
            </button>

            <div className="mini-profile">

              <span>
                AD
              </span>

              <strong>
                Admin User
              </strong>

            </div>

          </div>

        </header>

        {/* DASHBOARD */}

        {activeMenu === "Dashboard" && (
          <>

            {/* WELCOME CARD */}

            <section className="welcome-card">

              <div>

                <h2>
                  Good day,👋
                </h2>

                <p>
                  Here is an overview of the
                  student account system.
                </p>

              </div>

              <button
                className="white-button"
                onClick={() =>
                  setActiveMenu("Students")
                }
              >
                View Students
              </button>

            </section>

            {/* STATISTICS */}

            <section className="statistics-grid">

              <StatCard
                icon="♙"
                title="Total Students"
                value={studentsLoading ? "..." : studentList.length}
              />

              <StatCard
                icon="✓"
                title="Active Accounts"
                value="231"
              />

              <StatCard
                icon="◷"
                title="Pending Accounts"
                value="12"
              />

              <StatCard
                icon="⊘"
                title="Inactive Accounts"
                value="5"
              />

            </section>

            {/* DASHBOARD GRID */}

            <section className="dashboard-grid">

              {/* RECENT STUDENTS */}

              <div className="panel students-panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Recent Students
                    </h3>

                    <p>
                      Latest student accounts
                    </p>

                  </div>

                  <button
                    className="outline-button"
                    onClick={() =>
                      setActiveMenu("Students")
                    }
                  >
                    View All
                  </button>

                </div>

                <StudentTable students={studentList.slice(0, 4)} loading={studentsLoading} error={studentsError} />

              </div>

              {/* ACCOUNT ACTIVITY */}

              <div className="panel">

                <div className="panel-header">

                  <div>

                    <h3>
                      Account Activity
                    </h3>

                    <p>
                      Recent system actions
                    </p>

                  </div>

                </div>

                <div className="activity-list">

                  <Activity
                    icon="✓"
                    text="New student account created"
                    time="10 minutes ago"
                  />

                  <Activity
                    icon="↻"
                    text="Password updated"
                    time="32 minutes ago"
                  />

                  <Activity
                    icon="✓"
                    text="Account verified"
                    time="1 hour ago"
                  />

                  <Activity
                    icon="!"
                    text="Pending account review"
                    time="2 hours ago"
                  />

                </div>

              </div>

            </section>

          </>
        )}

        {/* STUDENTS PAGE */}

        {activeMenu === "Students" && (
          <section className="panel page-panel">
            <div className="panel-header">
              <div>
                <h3>Student Accounts</h3>
                <p>Manage registered student accounts stored in MySQL.</p>
              </div>

              <button
                className="primary-button small-button"
                type="button"
                onClick={() => {
                  setShowStudentForm(!showStudentForm);
                  setStudentMessage("");
                }}
              >
                {showStudentForm ? "Cancel" : "+ Add Student"}
              </button>
            </div>

            {showStudentForm && (
              <form onSubmit={handleCreateStudent}>
                <div>
                  <label>Student Number</label>
                  <input
                    className="normal-input"
                    type="text"
                    value={newStudentNumber}
                    onChange={(e) => setNewStudentNumber(e.target.value)}
                    placeholder="e.g. 2026-002"
                    required
                  />
                </div>

                <div>
                  <label>Full Name</label>
                  <input
                    className="normal-input"
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div>
                  <label>Course</label>
                  <input
                    className="normal-input"
                    type="text"
                    value={newStudentCourse}
                    onChange={(e) => setNewStudentCourse(e.target.value)}
                    placeholder="e.g. BSIT"
                    required
                  />
                </div>

                {studentMessage && <p>{studentMessage}</p>}

                <button
                  className="primary-button small-button"
                  type="submit"
                  disabled={savingStudent}
                >
                  {savingStudent ? "Saving..." : "Save Student"}
                </button>
              </form>
            )}

            {editingStudentNumber && (
  <form onSubmit={handleUpdateStudent}>
    <h3>Edit Student Information</h3>

    <div>
      <label>Student Number</label>
      <input
        className="normal-input"
        type="text"
        value={editingStudentNumber}
        readOnly
      />
    </div>

    <div>
      <label>Full Name</label>
      <input
        className="normal-input"
        type="text"
        value={editStudentName}
        onChange={(e) => setEditStudentName(e.target.value)}
        required
      />
    </div>

    <div>
      <label>Course</label>
      <input
        className="normal-input"
        type="text"
        value={editStudentCourse}
        onChange={(e) => setEditStudentCourse(e.target.value)}
        required
      />
    </div>

    <button
      className="primary-button small-button"
      type="submit"
      disabled={savingEdit}
    >
      {savingEdit ? "Updating..." : "Save Changes"}
    </button>

    <button
      className="outline-button"
      type="button"
      onClick={() => {
        setEditingStudentNumber("");
        setEditStudentName("");
        setEditStudentCourse("");
      }}
    >
      Cancel
    </button>
  </form>
)}

            {!showStudentForm && studentMessage && <p>{studentMessage}</p>}

            <div className="search-row">
              <input
                className="normal-input"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="🔎 Search by student number, name, or course..."
              />
            </div>

            {studentsError && <p>{studentsError}</p>}

            <StudentTable
  students={filteredStudents}
  loading={studentsLoading}
  error={studentsError}
  showActions={true}
  onEdit={(item) => {
    setEditingStudentNumber(item.studentNumber);
    setEditStudentName(item.fullName);
    setEditStudentCourse(item.course);
    setShowStudentForm(false);
    setStudentMessage("");
  }}
/>
          </section>
        )}

        {/* OTHER PAGES */}

        {activeMenu === "Accounts" && (
  <section className="panel page-panel">
    <div className="panel-header">
      <div>
        <h3>Record Student Cash Payment</h3>
        <p>Enter the details of the student's payment.</p>
      </div>
    </div>

    <form onSubmit={handleRecordPayment}>
      <div>
        <label>Student Number</label>
        <input
          className="normal-input"
          type="text"
          value={paymentStudentNumber}
          onChange={(e) =>
            setPaymentStudentNumber(e.target.value)
          }
          placeholder="Enter student number"
          required
        />
      </div>

      <div>
        <label>Receipt Number</label>
        <input
          className="normal-input"
          type="text"
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
          placeholder="e.g. OR-2026-0001"
          required
        />
      </div>

      <div>
        <label>Payment Date</label>
        <input
          className="normal-input"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Payment Method</label>
        <input
          className="normal-input"
          type="text"
          value="Cash"
          readOnly
        />
      </div>

      <div>
        <label>Amount Paid (₱)</label>
        <input
          className="normal-input"
          type="number"
          min="0.01"
          step="0.01"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="Enter amount"
          required
        />
      </div>

      {paymentMessage && (
        <p>{paymentMessage}</p>
      )}

      <button
        className="primary-button small-button"
        type="submit"
        disabled={savingPayment}
      >
        {savingPayment ? "Saving..." : "Record Payment"}
      </button>
    </form>
  </section>
)}

{activeMenu !== "Dashboard" &&
  activeMenu !== "Students" &&
  activeMenu !== "Accounts" && (
    <section className="panel empty-panel">
      <h2>{activeMenu}</h2>
      <p>This section is ready for your next module.</p>
    </section>
)}

      </main>

    </div>
  );
}

// ========================================
// STAT CARD
// ========================================

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="stat-card">

      <div className="stat-icon">
        {icon}
      </div>

      <div>

        <p>
          {title}
        </p>

        <h2>
          {value}
        </h2>

      </div>

      <span className="trend">
        +4.2%
      </span>

    </div>
  );
}

// ========================================
// ACTIVITY
// ========================================

function Activity({
  icon,
  text,
  time,
}) {
  return (
    <div className="activity-item">

      <div className="activity-icon">
        {icon}
      </div>

      <div>

        <strong>
          {text}
        </strong>

        <small>
          {time}
        </small>

      </div>

    </div>
  );
}

// ========================================
// STUDENT TABLE
// ========================================

function StudentTable({
  students = [],
  loading = false,
  error = "",
  showActions = false,
  onEdit,
}) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Course</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={showActions ? 4 : 3}>
                Loading student records...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={showActions ? 4 : 3}>
                {error}
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 4 : 3}>
                No student records found.
              </td>
            </tr>
          ) : (
            students.map((item) => (
              <tr key={item.studentNumber}>
                <td>
                  <strong>{item.studentNumber}</strong>
                </td>

                <td>{item.fullName}</td>

                <td>{item.course}</td>

                {showActions && (
                  <td>
                    <button
                      type="button"
                      className="outline-button"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ========================================
// RENDER APP
// ========================================

createRoot(
  document.getElementById("root")
).render(
  <App />
);