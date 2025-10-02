# EduChain-AI-frontend
/educhain-ai-frontend
|
├── .env                  # Environment variables (e.g., VITE_REACT_APP_API_URL)
├── package.json          # Project dependencies and scripts
├── vite.config.js        # Vite build configuration
|
└── /src
    |
    ├── /api              # API Calls (Axios wrappers for each backend module)
    |   ├── axiosInstance.js    # Base Axios instance with JWT interceptors
    |   ├── auth.js             # User/Auth endpoints (login, register, reset, token)
    |   ├── schools.js          # School admin endpoints (timetable, inventory, finance)
    |   ├── students.js         # Student/Parent/Teacher endpoints (attendance, assessments)
    |   ├── chat.js             # Chat and message-related endpoints
    |   └── dashboard.js        # Dashboard data fetching endpoints (teacher, parent, officer)
    |
    ├── /auth             # Authentication and Onboarding Pages
    |   ├── LoginPage.jsx
    |   ├── SignupPage.jsx
    |   ├── GoogleAuthHandler.jsx # Component to handle Google callback and token exchange
    |   ├── ForgotPasswordPage.jsx
    |   ├── ResetPasswordPage.jsx
    |   └── OnboardingPage.jsx    # User picks role + fills profile details
    |
    ├── /components       # Reusable, DUMB UI components (Buttons, Cards, Forms, Layouts)
    |   ├── /layout
    |   |   ├── MainLayout.jsx  # Primary app layout (sidebar, header)
    |   |   └── AuthLayout.jsx  # Layout for login/signup pages
    |   ├── /forms
    |   |   └── InputField.jsx  # Reusable form elements
    |   ├── /ui
    |   |   ├── Button.jsx
    |   |   ├── Modal.jsx
    |   |   └── Alert.jsx
    |   └── /shared
    |       └── LoadingSpinner.jsx
    |
    ├── /context          # Global State Management (React Context)
    |   ├── AuthContext.jsx       # Manages user session, login/logout, JWT refresh, User object
    |   └── NavigationContext.jsx # Maybe for sidebar state, active route
    |
    ├── /dashboard        # Role-Specific Dashboard Views (SMART components)
    |   ├── /teacher              # Teacher/Headteacher Views
    |   |   ├── SchoolOverview.jsx
    |   |   ├── TeacherDashboard.jsx
    |   |   └── LeaveManagement.jsx # Form/View for managing leave
    |   ├── /parent               # Parent Views
    |   |   ├── StudentProgress.jsx
    |   |   └── ParentDashboard.jsx
    |   |   └── WellbeingLog.jsx  # View for nutrition/wellbeing data
    |   └── /officer              # County Officer Views
    |       ├── CountyDashboard.jsx
    |       └── SchoolOversight.jsx
    |
    ├── /features         # Feature-specific, non-dashboard modules (can be shared)
    |   ├── /students             # Student Profile & Management CRUD
    |   |   ├── StudentList.jsx
    |   |   ├── StudentProfile.jsx
    |   |   └── StudentForm.jsx
    |   ├── /assessments          # Recording and viewing assessment data
    |   |   ├── RecordAssessment.jsx
    |   |   └── AssessmentReport.jsx
    |   ├── /chat                 # Chat UI
    |   |   ├── ConversationList.jsx
    |   |   └── MessageThread.jsx
    |   └── /schools              # School Admin Features (Timetable, Finance, etc.)
    |       └── InventoryManager.jsx
    |
    ├── /hooks            # Custom Hooks (Logic reuse)
    |   ├── useAuth.js          # Hook to consume AuthContext
    |   ├── usePushNotifications.js # Hook for OneSignal setup/token registration
    |   └── useFetch.js         # Generic data fetching hook
    |
    ├── /styles           # CSS/Styling configuration (e.g., Tailwind base styles)
    |   └── index.css
    |
    ├── /utils            # General Helpers and utility functions
    |   ├── constants.js          # Role Enums (PARENT, TEACHER, etc.)
    |   └── helpers.js            # Date formatting, validation, role checks
    |
    ├── main.jsx          # Root rendering file (wraps App in Contexts/Router)
    └── App.jsx           # Main routing component (uses AuthContext for protected routes)

