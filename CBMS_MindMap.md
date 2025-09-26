# College Budget Management System (CBMS) - Mind Map

## 🎯 Executive Summary & Core Objective
- **Web-based System** with future Android companion app
- **Streamline Budget Allocation** by specific heads to departments
- **Expenditure Recording** with bill verification and approval
- **Consolidated Dashboards** for Principal, Vice Principal, and Office
- **Last Year Comparison** features for trend analysis

## 👥 Key Stakeholders & RBAC
- **System Admin**: User management, categories, system settings
- **Office/Finance Officer**: Budget allocation, verification, final approvals
- **Department User**: Faculty/Attender/Accountant - expenditure entry to go to  hod
- **HOD**: intermediate approver for departmental claims
- **Vice Principal**: Managerial dashboard view and approvals
- **Principal**: Top-level viewing and approval authority
- **Auditor**: Read-only access for audit purposes

## 💼 Core Business Logic

### 3.1 Budget Allocation & Master Data
- **Budget Head Master (CRUD)**: Infrastructure, Lab Equipment, Events
- **Annual Allocation**: Office updates allocated_amount per department/financial_year
- **Allocation Record Fields**: allocation_id, financial_year, department_id, budget_head_id, allocated_amount, created_by, created_at, remarks
- **Bulk Allocation**: CSV upload support at financial year start

### 3.2 Department Expenditure Entry
- **Expenditure Form Fields**:
  - department_id (auto-filled)
  - budget_head_id (dropdown)
  - bill_number, bill_date, bill_amount
  - party_name, expense_details
  - attachment(s) (PDF/JPG/PNG)
  - reference_budget_register_no (optional)
  - submitted_by, submitted_at
- **Initial Status**: Pending upon submission

### 3.3 Approval Workflow & State Transitions
- **Status Flow**: Pending → Verified → Approved/Rejected
- **Approval Step Data**: approver_id, role, decision, remarks, timestamp
- **Critical Deduction Rule**: Only upon final approval is bill_amount deducted
- **Rejection Handling**: No deduction, mandatory remarks, resubmit action
- **Notifications**: Email and in-app for submission, approval, rejection
- **Auto-reminders**: For pending approvals older than N days

### 3.4 Budget Balance Management & Concurrency Control
- **Balance Update**: Atomic update of spent_amount and remaining_amount
- **Prevent Overspend**: Warning when bill_amount exceeds remaining_amount
- **Concurrency**: Database transactions and row locking
- **Override Request**: Configurable by Office rules

### 3.5 Dashboards & Management Views
- **Department Dashboard**: Remaining budget per head, submitted bills status
- **Office/VP/Principal Dashboard**:
  - Consolidated Budget (Total Allotted, Expenses Incurred, Balance Available)
  - Percentage of Fund Utilized
  - Department-wise Breakout
  - Last-year comparison widget

### 3.6 Reporting & Exports
- **Export Formats**: CSV, Excel, PDF
- **Key Reports**:
  - Consolidated Annual Report
  - Department-wise Bill Register
  - Last-year vs Current-year Comparison
- **Report Filters**: Date range, department, budget head, status

### 3.7 Notifications & Audit Trail
- **Notifications**: Email and in-app for key events
- **Audit Log**: Immutable record of all financial data changes
- **Event Types**: allocation_created, expenditure_submitted, expenditure_approved
- **Fields**: event_type, actor_id, details, timestamp

## 🖥️ UI/UX Page Structure
1. **Login/Logout/Forgot Password**
2. **Role-based Home Dashboard**
3. **Submit Expenditure Form** (with attachment upload)
4. **My Submissions** (with statuses, resubmit flow)
5. **Approvals Queue** (HOD → Office → VP/Principal)
6. **Allocations Management Page** (Office)
7. **Consolidated Budget Dashboard** (with charts & last-year comparison)
8. **Department Detail Page** (drilldown with bill list & allocation breakup)
9. **Audit Log & Reports Page** (Admin/Office)
10. **Settings**: Budget heads, Financial years, Notification preferences, RBAC user management

## 🔄 Business Process Sequences

### Normal Approved Flow:
1. Office creates allocation for Dept A: allocated_amount = ₹X
2. Dept user submits expenditure e with bill_amount ₹Y. Status = Pending
3. HOD verifies (optional), forwards to Office
4. Office approves. System updates spent_amount += Y. Status = Approved
5. Notification sent to submitter. Dashboard updates reflect new balances

### Rejected Flow:
1. Office rejects with remarks. Status = Rejected
2. No changes to allocations.spent_amount
3. Submitter receives remarks and resubmits corrected entry

## ✅ Acceptance Criteria & Test Cases

### Allocation Correctness:
- **Scenario**: Office adds allocation ₹100,000 for Dept A head X
- **Expected**: remaining_amount initially equals ₹100,000
- **Test**: GET allocation endpoint returns allocated=100000, spent=0, remaining=100000

### Submission & Approval:
- **Scenario**: Dept submits ₹10,000; Office approves
- **Expected**: allocation.spent increases to ₹10,000, remaining becomes ₹90,000
- **Test**: Approve action must be atomic and appear in audit_logs

### Rejection No-Change:
- **Scenario**: Dept submits ₹5,000; Office rejects
- **Expected**: allocation.spent remains unchanged
- **Test**: Verify spent_amount retains previous value

### Overspend Prevention:
- **Scenario**: Dept tries to submit ₹200,000 when remaining budget is ₹50,000
- **Expected**: System blocks or flags submission per configuration

## 🛠️ Technical Architecture

### Backend Stack:
- **Node.js/Express**: REST APIs with JWT authentication
- **MongoDB**: Document database for flexible schema
- **S3-compatible Storage**: AWS S3 for attachments
- **JWT**: Authentication tokens
- **Multer**: File upload handling
- **Nodemailer**: Email notifications

### Security & Compliance:
- **RBAC**: Prevent unauthorized access
- **Attachment Security**: Virus scanning, size limits (10MB/file), type restrictions
- **Audit Trail**: Immutable audit trail for all financial actions
- **Log Protection**: Sensitive logs encrypted at rest
- **HTTPS**: Secure communication

## 📋 Sprint Breakdown

### Sprint 1: Foundation
- Authentication, Roles
- Department & Budget Head master
- Allocations CRUD
- Department submission form
- Basic approval flow (manual approval by Office)
- Simple department dashboard

### Sprint 2: Advanced Features
- Multi-level approvals
- Notifications
- Attachments
- Audit logs
- Consolidated dashboard

### Sprint 3: Enhancement & Security
- Reports/exports
- Last-year comparison
- Concurrency protections
- Security hardening

## 🎯 Key Success Metrics
- **Budget Accuracy**: Zero overspend incidents
- **Approval Efficiency**: Reduced approval time by 50%
- **User Adoption**: 90% department participation
- **Audit Compliance**: 100% audit trail coverage
- **System Reliability**: 99.9% uptime

## 🚀 Future Enhancements
- **Android Companion App**
- **Integration with College ERP**
- **Advanced Analytics & Forecasting**
- **Multi-currency Support**
- **QR Code/Barcode Scanning**
- **AI-powered Anomaly Detection**
- **Offline Mode**
- **Customizable Workflows**
- **SMS Gateway Integration**
- **Biometric Authentication**

---

*This mind map provides a comprehensive overview of the College Budget Management System, covering all functional and non-functional requirements, technical considerations, and development phases.*
