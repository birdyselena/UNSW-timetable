import React, { useState } from "react";
import "./TimetableStats.css";

/**
 * Timetable Statistics Component
 *
 * @param {Object} props - Component props
 * @param {Object} props.timetable - Current timetable state
 * @param {Array} props.conflicts - Array of conflicts
 * @param {Array} props.selectedCourses - Array of selected courses
 * @returns {JSX.Element} - Timetable statistics component
 */
function TimetableStats({ timetable, conflicts, selectedCourses }) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate statistics
  const totalSessions = Object.keys(timetable).length;
  const totalHours = Object.values(timetable).reduce((sum, session) => {
    return sum + (session?.session?.duration || 1);
  }, 0);

  const sessionsByDay = {};
  const hoursByDay = {};
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  days.forEach((day) => {
    sessionsByDay[day] = 0;
    hoursByDay[day] = 0;
  });

  Object.entries(timetable).forEach(([slot, session]) => {
    const [day] = slot.split("-");
    if (sessionsByDay[day] !== undefined) {
      sessionsByDay[day]++;
      hoursByDay[day] += session?.session?.duration || 1;
    }
  });

  const busiestDay = Object.entries(hoursByDay).reduce(
    (max, [day, hours]) => {
      return hours > max.hours ? { day, hours } : max;
    },
    { day: "None", hours: 0 }
  );

  const unscheduledSessions = selectedCourses.reduce((count, course) => {
    return (
      count +
      course.sessions.filter((session) => {
        return !Object.values(timetable).some(
          (scheduled) =>
            scheduled.course.id === course.id &&
            scheduled.session.id === session.id
        );
      }).length
    );
  }, 0);

  return (
    <div className="timetable-stats">
      <div
        className="stats-header"
        onClick={() => setShowDetails(!showDetails)}
      >
        <h4>📊 Timetable Statistics</h4>
        <span className="toggle-icon">{showDetails ? "▼" : "▶"}</span>
      </div>

      {showDetails && (
        <div className="stats-content">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{totalSessions}</div>
              <div className="stat-label">Sessions Scheduled</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">{totalHours}h</div>
              <div className="stat-label">Total Hours</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">{conflicts.length}</div>
              <div className="stat-label">Conflicts</div>
            </div>

            <div className="stat-item">
              <div className="stat-value">{unscheduledSessions}</div>
              <div className="stat-label">Unscheduled</div>
            </div>
          </div>

          <div className="daily-breakdown">
            <h5>Daily Breakdown</h5>
            {days.map((day) => (
              <div key={day} className="day-stat">
                <span className="day-name">{day.substring(0, 3)}</span>
                <div className="day-bar">
                  <div
                    className="day-fill"
                    style={{
                      width: `${
                        (hoursByDay[day] /
                          Math.max(...Object.values(hoursByDay))) *
                        100
                      }%`,
                      backgroundColor:
                        day === busiestDay.day ? "#ff6b6b" : "#4dabf7",
                    }}
                  ></div>
                </div>
                <span className="day-hours">{hoursByDay[day]}h</span>
              </div>
            ))}
          </div>

          {busiestDay.hours > 0 && (
            <div className="highlight-stat">
              🏆 Busiest day: <strong>{busiestDay.day}</strong> (
              {busiestDay.hours} hours)
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="warning-stat">
              ⚠️ You have {conflicts.length} scheduling conflict
              {conflicts.length > 1 ? "s" : ""}
            </div>
          )}

          {unscheduledSessions > 0 && (
            <div className="info-stat">
              📝 {unscheduledSessions} session
              {unscheduledSessions > 1 ? "s" : ""} still need
              {unscheduledSessions === 1 ? "s" : ""} to be scheduled
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TimetableStats;
