import React, { useState, useEffect } from "react";
import "./ParentTeacherConnect.css";

const initialFeedback = [
  {
    id: 1,
    parent: "Aarav's Parent",
    student: "Aarav Sharma",
    teacher: "Priya Mehta",
    subject: "Java Programming",
    message: "My child is finding exception handling difficult. Please suggest extra practice.",
    reply: "",
    status: "Pending",
    date: "2026-10-24"
  }
];

function ParentTeacherConnect() {
  const [role, setRole] = useState("Parent");

  const [feedback, setFeedback] = useState(() => {
    try {
      const saved = localStorage.getItem("ptc_feedback");
      return saved ? JSON.parse(saved) : initialFeedback;
    } catch {
      return initialFeedback;
    }
  });

  const [meetings, setMeetings] = useState(() => {
    try {
      const saved = localStorage.getItem("ptc_meetings");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("ptc_messages");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [student, setStudent] = useState("Aarav Sharma");
  const [teacher, setTeacher] = useState("Priya Mehta");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState({});
  const [activeTab, setActiveTab] = useState("feedback");

  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("14:00");
  const [meetingReason, setMeetingReason] = useState("");

  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    localStorage.setItem("ptc_feedback", JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    localStorage.setItem("ptc_meetings", JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem("ptc_messages", JSON.stringify(messages));
  }, [messages]);

  function submitFeedback(e) {
    e.preventDefault();

    const newFeedback = {
      id: Date.now(),
      parent: "Parent",
      student,
      teacher,
      subject,
      message,
      reply: "",
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    setFeedback([newFeedback, ...feedback]);

    setSubject("");
    setMessage("");

    alert("Feedback submitted successfully!");
  }

  function sendReply(id) {
    if (!reply[id] || !reply[id].trim()) {
      alert("Please enter a reply.");
      return;
    }

    setFeedback(
      feedback.map((item) =>
        item.id === id
          ? {
              ...item,
              reply: reply[id],
              status: "Replied"
            }
          : item
      )
    );

    setReply({ ...reply, [id]: "" });

    alert("Reply submitted successfully!");
  }

  function requestMeeting(e) {
    e.preventDefault();

    const newMeeting = {
      id: Date.now(),
      student,
      teacher,
      date: meetingDate,
      time: meetingTime,
      reason: meetingReason,
      status: "Pending"
    };

    setMeetings([newMeeting, ...meetings]);

    setMeetingDate("");
    setMeetingTime("14:00");
    setMeetingReason("");

    alert("Meeting request submitted!");
  }

  function updateMeeting(id, status) {
    setMeetings(
      meetings.map((meeting) =>
        meeting.id === id
          ? { ...meeting, status }
          : meeting
      )
    );
  }

  function sendMessage(e) {
    e.preventDefault();

    if (!chatMessage.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: role,
      text: chatMessage,
      date: new Date().toLocaleString()
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");
  }

  const pendingFeedback = feedback.filter(
    (item) => item.status === "Pending"
  ).length;

  const pendingMeetings = meetings.filter(
    (item) => item.status === "Pending"
  ).length;

  return (
    <div className="ptc-container">

      <div className="ptc-header">
        <div>
          <p className="ptc-label">WORKFORCE CONNECT</p>
          <h1>Parent–Teacher Connect</h1>
          <p className="ptc-subtitle">
            Better communication for better student success.
          </p>
        </div>

        <div className="ptc-role-box">
          <label>Demo Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Parent">Parent</option>
            <option value="Teacher">Teacher</option>
          </select>
        </div>
      </div>

      <div className="ptc-banner">
        <div>
          <h2>Hello, {role}!</h2>
          <p>
            Share feedback, connect with teachers and schedule meetings.
          </p>
        </div>

        <div className="ptc-banner-icon">🤝</div>
      </div>

      <div className="ptc-stats">

        <div className="ptc-stat">
          <span>Total Feedback</span>
          <h2>{feedback.length}</h2>
        </div>

        <div className="ptc-stat">
          <span>Pending Feedback</span>
          <h2>{pendingFeedback}</h2>
        </div>

        <div className="ptc-stat">
          <span>Meeting Requests</span>
          <h2>{pendingMeetings}</h2>
        </div>

      </div>

      <div className="ptc-tabs">
        <button
          className={activeTab === "feedback" ? "selected" : ""}
          onClick={() => setActiveTab("feedback")}
        >
          Feedback
        </button>

        <button
          className={activeTab === "messages" ? "selected" : ""}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>

        <button
          className={activeTab === "meetings" ? "selected" : ""}
          onClick={() => setActiveTab("meetings")}
        >
          Meetings
        </button>
      </div>

      {activeTab === "feedback" && (
        <div className="ptc-grid">

          {role === "Parent" && (
            <div className="ptc-card">
              <h2>Send Feedback</h2>

              <form onSubmit={submitFeedback}>

                <label>Student Name</label>
                <input
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  required
                />

                <label>Teacher</label>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                >
                  <option>Priya Mehta</option>
                  <option>Rahul Verma</option>
                  <option>Neha Kapoor</option>
                </select>

                <label>Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Java Programming"
                  required
                />

                <label>Feedback Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your concern or feedback..."
                  rows="4"
                  required
                />

                <button className="ptc-primary" type="submit">
                  Submit Feedback
                </button>

              </form>
            </div>
          )}

          <div className="ptc-card">
            <h2>
              {role === "Parent" ? "My Feedback" : "Feedback Inbox"}
            </h2>

            {feedback.length === 0 && (
              <p>No feedback available.</p>
            )}

            {feedback.map((item) => (
              <div className="ptc-feedback-item" key={item.id}>

                <div className="ptc-item-heading">
                  <span>{item.subject}</span>

                  <span
                    className={
                      item.status === "Replied"
                        ? "ptc-status replied"
                        : "ptc-status"
                    }
                  >
                    {item.status}
                  </span>
                </div>

                <p>
                  <b>Student:</b> {item.student}
                </p>

                <p>
                  <b>Teacher:</b> {item.teacher}
                </p>

                <p>{item.message}</p>

                {item.reply && (
                  <div className="ptc-reply">
                    <b>Teacher's Reply</b>
                    <p>{item.reply}</p>
                  </div>
                )}

                {role === "Teacher" && !item.reply && (
                  <div className="ptc-reply-form">

                    <textarea
                      rows="3"
                      placeholder="Write your reply..."
                      value={reply[item.id] || ""}
                      onChange={(e) =>
                        setReply({
                          ...reply,
                          [item.id]: e.target.value
                        })
                      }
                    />

                    <button
                      className="ptc-primary"
                      onClick={() => sendReply(item.id)}
                    >
                      Send Reply
                    </button>

                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      {activeTab === "messages" && (
        <div className="ptc-card">
          <h2>Parent–Teacher Messages</h2>

          <p className="ptc-hint">
            Demo conversation. Messages are stored in this browser.
          </p>

          <div className="ptc-chat">

            {messages.length === 0 && (
              <p>No messages yet. Start a conversation!</p>
            )}

            {messages.map((item) => (
              <div className="ptc-chat-message" key={item.id}>
                <div className="ptc-chat-meta">
                  <b>{item.sender}</b>
                  <span>{item.date}</span>
                </div>

                <p>{item.text}</p>
              </div>
            ))}

          </div>

          <form className="ptc-chat-form" onSubmit={sendMessage}>
            <input
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={`Write a message as ${role}...`}
              required
            />

            <button className="ptc-primary" type="submit">
              Send
            </button>
          </form>
        </div>
      )}

      {activeTab === "meetings" && (
        <div className="ptc-grid">

          {role === "Parent" && (
            <div className="ptc-card">
              <h2>Request a Meeting</h2>

              <form onSubmit={requestMeeting}>

                <label>Student Name</label>
                <input
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  required
                />

                <label>Teacher</label>
                <select
                  value={teacher}
                  onChange={(e) => setTeacher(e.target.value)}
                >
                  <option>Priya Mehta</option>
                  <option>Rahul Verma</option>
                  <option>Neha Kapoor</option>
                </select>

                <label>Meeting Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                />

                <label>Meeting Time</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  required
                />

                <label>Reason for Meeting</label>
                <textarea
                  rows="3"
                  value={meetingReason}
                  onChange={(e) => setMeetingReason(e.target.value)}
                  placeholder="What would you like to discuss?"
                  required
                />

                <button className="ptc-primary" type="submit">
                  Request Meeting
                </button>

              </form>
            </div>
          )}

          <div className="ptc-card">
            <h2>Meeting Requests</h2>

            {meetings.length === 0 && (
              <p>No meeting requests yet.</p>
            )}

            {meetings.map((meeting) => (
              <div className="ptc-feedback-item" key={meeting.id}>

                <h3>{meeting.student}</h3>

                <p>
                  <b>Teacher:</b> {meeting.teacher}
                </p>

                <p>
                  <b>Date:</b> {meeting.date}
                </p>

                <p>
                  <b>Time:</b> {meeting.time}
                </p>

                <p>
                  <b>Reason:</b> {meeting.reason}
                </p>

                <p>
                  <b>Status:</b> {meeting.status}
                </p>

                {role === "Teacher" && meeting.status === "Pending" && (
                  <div className="ptc-meeting-actions">

                    <button
                      className="ptc-primary"
                      onClick={() => updateMeeting(meeting.id, "Confirmed")}
                    >
                      Confirm
                    </button>

                    <button
                      className="ptc-danger"
                      onClick={() => updateMeeting(meeting.id, "Declined")}
                    >
                      Decline
                    </button>

                  </div>
                )}

              </div>
            ))}
          </div>

        </div>
      )}

      <footer className="ptc-footer">
        WorkForce · Parent–Teacher Connect
      </footer>

    </div>
  );
}

export default ParentTeacherConnect;