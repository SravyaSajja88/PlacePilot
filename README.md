# PlacePilot

PlacePilot is a state-of-the-art campus recruitment and placement cell management portal. It connects students and placement officers in a seamless, automated, and secure digital ecosystem, simplifying the job application process, managing recruitment pipelines, and providing rich data insights.

---

## Tech Stack

PlacePilot is engineered using a robust and modern full-stack architecture:

- **Frontend:**
  - **React (Vite):** A fast, single-page application wrapper.
  - **React Router v7:** Structured client-side routing.
  - **Tailwind CSS:** Premium styling, clean layout components, and fluid responsive design.
  - **Axios:** Asynchronous API clients with credentials support.
- **Backend:**
  - **Node.js & Express.js:** Fast, asynchronous REST API architecture.
  - **Prisma ORM:** Typesafe database schema mapping, migrations, and transactions.
  - **PostgreSQL:** Reliable relational data store.
- **Security & Cloud:**
  - **JWT & Cookie-Parser:** Secure authentication using HTTP-only cookies.
  - **Bcrypt.js:** Industry-standard password hashing.
  - **Cloudinary & Multer:** Secure cloud hosting for student resumes.
  - **Express Rate Limit & Express Validator:** Request throttling and input sanitization.

---

##  Project Architecture

The codebase is split into two primary components:

```
placepilot/
├── client-simplified/        # React + Vite Frontend
│   ├── src/
│   │   ├── pages/            # View components (Student & Officer)
│   │   ├── components/       # Reusable UI elements (Navbar, Cards, Alerts)
│   │   ├── api/              # Axios configuration
│   │   └── App.jsx           # Main routing & state configuration
└── server/                   # Express.js Backend
    ├── prisma/               # Schema configuration & seed script
    └── src/
        ├── controllers/      # Route handler controllers
        ├── middleware/       # JWT auth, validation & rate limiters
        ├── routes/           # REST endpoints mapping
        └── services/         # State machine, analytics & eligibility engines
```

---

## Key Features

### For Students
- **Interactive Dashboard:** Track active placement drives, pending invitations, and application statuses.
- **Profile Management:** Dynamic record keeping of CGPA, branch, active backlogs, and contact information.
- **Eligibility Engine:** Automatic validation checks preventing application if the student does not meet the drive's GPA, year, backlog, or branch criteria.
- **Resume Upload:** Cloud-hosted PDF resume submission via Cloudinary.
- **Offer Decisions:** Interactive options to accept or reject job offers.

### For Placement Officers
- **Analytics Dashboard:** Visual representation of key metrics, including overall placement rates, average CTCs, active drives, and application distribution.
- **Placement Drive Management:** Create, close, and edit corporate recruitment drives with specific eligibility gates.
- **Recruitment Pipeline Tracker:** Visual state-machine management to transition applicants through pipeline stages:
  $$\text{Applied} \longrightarrow \text{Shortlisted} \longrightarrow \text{Technical} \longrightarrow \text{HR} \longrightarrow \text{Offer Made} \longrightarrow \text{Offer Accepted / Rejected}$$
- **Student Directory:** Searchable table of student profiles with activation/deactivation controls.
- **Placement Policy Configurator:** Toggle the **One-Offer Lock** policy to restrict placed students from applying to other drives once an offer is accepted.

---

## Technical Highlights

### 1. Robust Hiring Pipeline State Machine
Recruitment stages are governed by a strict state-machine system ([pipeline.service.js](file:///c:/Users/Sravya_Sajja/Desktop/placepilot/server/src/services/pipeline.service.js)). Only legal transitions are allowed:
- `APPLIED` $\rightarrow$ `SHORTLISTED` $\rightarrow$ `TECHNICAL` $\rightarrow$ `HR` $\rightarrow$ `OFFER_MADE` $\rightarrow$ `OFFER_ACCEPTED`.
- A candidate can withdraw (`WITHDRAWN`) or be rejected (`REJECTED`) at any stage prior to final acceptance.

### 2. Transaction-Safe Application Autoflow
Upon a student clicking **Accept Offer**, a database transaction wraps four distinct operations to prevent race conditions:
1. Progresses the candidate's status to `OFFER_ACCEPTED`.
2. Automatically flags the student profile's placement status to `isPlaced = true`.
3. Finds all other active applications for that student and automatically changes their status to `WITHDRAWN`.
4. Appends a detailed audit event to each affected application's history trace.

### 3. Server-Side Eligibility Gatekeeping
The backend enforces student eligibility server-side ([eligibility.service.js](file:///c:/Users/Sravya_Sajja/Desktop/placepilot/server/src/services/eligibility.service.js)). Students are blocked from applying if:
- Their CGPA is lower than the drive's minimum required CGPA.
- Their academic branch is not in the drive's list of allowed departments.
- Their active backlogs exceed the drive's maximum limit.
- Their graduating year is not accepted by the recruiter.

---

## Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database instance
- Cloudinary developer account

### Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the environment template:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://<username>:<password>@localhost:5432/placepilot"
   JWT_SECRET="your_jwt_secret_key"
   CLOUDINARY_CLOUD_NAME="your_cloudinary_name"
   CLOUDINARY_API_KEY="your_cloudinary_key"
   CLOUDINARY_API_SECRET="your_cloudinary_secret"
   ```
4. Push database migrations and seed default setup:
   ```bash
   npx prisma migrate dev
   node prisma/seed.js
   ```
5. Run backend development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the client directory:
   ```bash
   cd ../client-simplified
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Security Measures

- **HTTP-Only Cookies:** Tokens are stored in HttpOnly cookies, protecting the application from Cross-Site Scripting (XSS) extraction.
- **Request Throttling:** Throttles rapid API requests using `express-rate-limit` to prevent brute force and DDoS attacks.
- **Input Sanitization:** Uses `express-validator` to sanitize all incoming forms, preventing SQL injection or script insertion.
- **Audit Trails:** The system logs every stage transition with a record of the initiator, timestamps, and optional comments, enabling administrative audits.
