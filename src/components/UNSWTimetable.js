import React, { useState, useRef, useEffect } from "react";
import "./UNSWTimetable.css";

/**
 * UNSW Draggable Timetable Component
 *
 * @param {Object} props - Component props
 * @param {Array} props.courses - Array of course objects with id, name, color, sessions
 * @param {Function} props.onTimetableChange - Callback for timetable changes
 * @param {Function} props.onConflictsChange - Callback for conflicts changes
 * @returns {JSX.Element} - Draggable timetable component
 * @description Creates a draggable timetable for UNSW courses with conflict detection
 */
function UNSWTimetable({ courses = [], onTimetableChange, onConflictsChange }) {
  const [timetable, setTimetable] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const dragRef = useRef(null);

  const timeSlots = [
    "8:00",
    "9:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Check for time conflicts
  const checkConflicts = (newTimetable) => {
    const conflictList = [];
    Object.entries(newTimetable).forEach(([slot1, session1]) => {
      Object.entries(newTimetable).forEach(([slot2, session2]) => {
        if (slot1 !== slot2 && session1 && session2) {
          const [day1, time1] = slot1.split("-");
          const [day2, time2] = slot2.split("-");

          if (day1 === day2) {
            const time1Index = timeSlots.indexOf(time1);
            const time2Index = timeSlots.indexOf(time2);
            const duration1 = session1.session?.duration || 1;
            const duration2 = session2.session?.duration || 1;

            // Check if sessions overlap
            const session1End = time1Index + duration1;
            const session2End = time2Index + duration2;

            if (time1Index < session2End && session1End > time2Index) {
              conflictList.push([slot1, slot2]);
            }
          }
        }
      });
    });
    setConflicts(conflictList);
    if (onConflictsChange) {
      onConflictsChange(conflictList);
    }
  };

  // Update parent component when timetable changes
  useEffect(() => {
    if (onTimetableChange) {
      onTimetableChange(timetable);
    }
  }, [timetable, onTimetableChange]);

  const handleDragStart = (e, course, session) => {
    const item = { course, session };
    setDraggedItem(item);
    dragRef.current = item;
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e, day, time) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (!draggedItem) return;

    const slotKey = `${day}-${time}`;
    const newTimetable = { ...timetable };

    // Remove from previous position if exists
    Object.keys(newTimetable).forEach((key) => {
      if (
        newTimetable[key]?.course?.id === draggedItem.course.id &&
        newTimetable[key]?.session?.id === draggedItem.session.id
      ) {
        delete newTimetable[key];
      }
    });

    // Check if the slot would create conflicts due to duration
    const duration = draggedItem.session?.duration || 1;
    const timeIndex = timeSlots.indexOf(time);

    // Clear any slots that would be occupied by this session's duration
    for (let i = 0; i < duration; i++) {
      const currentTimeSlot = timeSlots[timeIndex + i];
      if (currentTimeSlot) {
        const currentSlotKey = `${day}-${currentTimeSlot}`;
        if (
          newTimetable[currentSlotKey] &&
          newTimetable[currentSlotKey].course.id !== draggedItem.course.id
        ) {
          // Would overwrite another course, cancel the drop
          setDraggedItem(null);
          return;
        }
      }
    }

    // Add to new position
    newTimetable[slotKey] = draggedItem;

    setTimetable(newTimetable);
    checkConflicts(newTimetable);
    setDraggedItem(null);
  };

  const handleRemoveSession = (day, time) => {
    const slotKey = `${day}-${time}`;
    const newTimetable = { ...timetable };
    delete newTimetable[slotKey];
    setTimetable(newTimetable);
    checkConflicts(newTimetable);
  };

  const isConflicted = (day, time) => {
    const slotKey = `${day}-${time}`;
    return conflicts.some((conflict) => conflict.includes(slotKey));
  };

  return (
    <div className="unsw-timetable-container">
      {/* Course List */}
      <div className="course-list">
        <h3>Available Courses</h3>
        {courses.length === 0 ? (
          <div className="empty-courses">
            <p>No courses selected.</p>
            <p>Use the search above to add courses.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="course-item">
              <h4 style={{ color: course.color }}>{course.code}</h4>
              <p className="course-name">{course.name}</p>
              {course.sessions.map((session) => (
                <div
                  key={session.id}
                  className="session-item"
                  draggable
                  onDragStart={(e) => handleDragStart(e, course, session)}
                  onDragEnd={handleDragEnd}
                  style={{ backgroundColor: course.color }}
                >
                  <div>{session.type}</div>
                  <div>{session.duration}h</div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Timetable Grid */}
      <div className="timetable-grid">
        <div className="time-header"></div>
        {days.map((day) => (
          <div key={day} className="day-header">
            {day}
          </div>
        ))}

        {timeSlots.map((time) => (
          <React.Fragment key={time}>
            <div className="time-slot">{time}</div>
            {days.map((day) => {
              const slotKey = `${day}-${time}`;
              const session = timetable[slotKey];
              const hasConflict = isConflicted(day, time);

              return (
                <div
                  key={slotKey}
                  className={`timetable-cell ${hasConflict ? "conflict" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day, time)}
                >
                  {session && (
                    <div
                      className="session-block"
                      style={{ backgroundColor: session.course.color }}
                      onClick={() => handleRemoveSession(day, time)}
                    >
                      <div className="session-name">{session.course.code}</div>
                      <div className="session-type">{session.session.type}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default UNSWTimetable;
