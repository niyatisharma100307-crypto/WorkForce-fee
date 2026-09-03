import { Routes, Route } from 'react-router-dom';

import PublicLayout from './components/PublicLayout.jsx';
import AppLayout from './components/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';

import CampusGuide from './pages/public/CampusGuide.jsx';
import JuniorHub from './pages/public/JuniorHub.jsx';
import Clubs from './pages/public/Clubs.jsx';
import Emergency from './pages/public/Emergency.jsx';
import Suggestions from './pages/public/Suggestions.jsx';
import CampusUpdates from './pages/public/CampusUpdates.jsx';
import StudyZone from './pages/public/StudyZone.jsx';
import Opportunities from './pages/public/Opportunities.jsx';

import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentGrades from './pages/student/Grades.jsx';
import StudentAttendance from './pages/student/Attendance.jsx';
import StudentEvents from './pages/student/Events.jsx';
import StudentComplaints from './pages/student/Complaints.jsx';
import StudentTests from './pages/student/Tests.jsx';
import StudentHackathon from './pages/student/Hackathon.jsx';
import StudentTimetable from './pages/student/Timetable.jsx';
import StudentAssignments from './pages/student/Assignments.jsx';
import StudentMessages from './pages/student/Messages.jsx';
import StudentProjects from './pages/student/Projects.jsx';
import StudentExchange from './pages/student/Exchange.jsx';
import StudentServiceRequests from './pages/student/ServiceRequests.jsx';
import StudentProfile from './pages/student/Profile.jsx';

import TeacherDashboard from './pages/teacher/Dashboard.jsx';
import TeacherAnnouncements from './pages/teacher/Announcements.jsx';
import TeacherEvents from './pages/teacher/Events.jsx';
import TeacherAttendance from './pages/teacher/Attendance.jsx';
import TeacherGrades from './pages/teacher/Grades.jsx';
import TeacherTimetable from './pages/teacher/Timetable.jsx';
import TeacherComplaints from './pages/teacher/Complaints.jsx';
import TeacherAssignments from './pages/teacher/Assignments.jsx';
import TeacherMessages from './pages/teacher/Messages.jsx';
import TeacherProfile from './pages/teacher/Profile.jsx';
import TeacherRoster from './pages/teacher/Roster.jsx';
import AdminContent from './pages/admin/Content.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public pages — no login required */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/campus-guide" element={<CampusGuide />} />
        <Route path="/junior-hub" element={<JuniorHub />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/suggestions" element={<Suggestions />} />
        <Route path="/campus-updates" element={<CampusUpdates />} />
        <Route path="/study-zone" element={<StudyZone />} />
        <Route path="/opportunities" element={<Opportunities />} />
      </Route>

      {/* Student portal — requires student login */}
      <Route
        element={
          <ProtectedRoute role="student">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/grades" element={<StudentGrades />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/events" element={<StudentEvents />} />
        <Route path="/student/complaints" element={<StudentComplaints />} />
        <Route path="/student/tests" element={<StudentTests />} />
        <Route path="/student/hackathon" element={<StudentHackathon />} />
        <Route path="/student/timetable" element={<StudentTimetable />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/messages" element={<StudentMessages />} />
        <Route path="/student/projects" element={<StudentProjects />} />
        <Route path="/student/exchange" element={<StudentExchange />} />
        <Route path="/student/service-requests" element={<StudentServiceRequests />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Route>

      {/* Teacher portal — requires teacher login */}
      <Route
        element={
          <ProtectedRoute role="teacher">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/announcements" element={<TeacherAnnouncements />} />
        <Route path="/teacher/events" element={<TeacherEvents />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/grades" element={<TeacherGrades />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/complaints" element={<TeacherComplaints />} />
        <Route path="/teacher/roster" element={<TeacherRoster />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/messages" element={<TeacherMessages />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />
      </Route>

      {/* Content manager portal — controls public events, clubs, opportunities and updates */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/content" element={<AdminContent />} />
      </Route>

      {/* Fallback — send anything unmatched home */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
