import React, { useState } from "react";
import "./ConflictResolver.css";

function ConflictResolver({
  isOpen,
  timetable,
  conflicts,
  courses,
  onClose,
  onResolve,
}) {
  const [selectedResolution, setSelectedResolution] = useState({});

  if (!isOpen || !conflicts || conflicts.length === 0) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getConflictDetails = (conflict) => {
    const [slot1, slot2] = conflict;
    const session1 = timetable[slot1];
    const session2 = timetable[slot2];

    // Add null checks
    if (!session1 || !session2) {
      return null;
    }

    return {
      slot1,
      slot2,
      session1,
      session2,
      day: slot1.split("-")[0],
      time1: slot1.split("-")[1],
      time2: slot2.split("-")[1],
    };
  };

  const generateResolutionOptions = (conflictDetails) => {
    const { session1, session2, day } = conflictDetails;

    // Add null checks for sessions
    if (!session1 || !session2 || !session1.course || !session2.course) {
      return [];
    }

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

    const options = [];

    // Option 1: Keep session1, remove session2
    options.push({
      type: "keep_first",
      title: `Keep ${session1.course.code} ${
        session1.session?.type || "Session"
      }`,
      description: `Remove ${session2.course.code} ${
        session2.session?.type || "Session"
      } from ${day} ${conflictDetails.time2}`,
      impact: "You will need to reschedule the removed session",
    });

    // Option 2: Keep session2, remove session1
    options.push({
      type: "keep_second",
      title: `Keep ${session2.course.code} ${
        session2.session?.type || "Session"
      }`,
      description: `Remove ${session1.course.code} ${
        session1.session?.type || "Session"
      } from ${day} ${conflictDetails.time1}`,
      impact: "You will need to reschedule the removed session",
    });

    // Option 3: Find alternative slots for session1
    const alternativeSlots1 = [];
    days.forEach((altDay) => {
      timeSlots.forEach((altTime) => {
        const altSlot = `${altDay}-${altTime}`;
        if (
          !timetable[altSlot] &&
          altSlot !== conflictDetails.slot1 &&
          altSlot !== conflictDetails.slot2
        ) {
          alternativeSlots1.push({ day: altDay, time: altTime, slot: altSlot });
        }
      });
    });

    if (alternativeSlots1.length > 0) {
      options.push({
        type: "move_first",
        title: `Move ${session1.course.code} ${
          session1.session?.type || "Session"
        }`,
        description: "Move to an available time slot",
        alternatives: alternativeSlots1.slice(0, 3), // Show top 3 alternatives
        impact: "Session will be moved to a different time",
      });
    }

    // Option 4: Find alternative slots for session2
    const alternativeSlots2 = [];
    days.forEach((altDay) => {
      timeSlots.forEach((altTime) => {
        const altSlot = `${altDay}-${altTime}`;
        if (
          !timetable[altSlot] &&
          altSlot !== conflictDetails.slot1 &&
          altSlot !== conflictDetails.slot2
        ) {
          alternativeSlots2.push({ day: altDay, time: altTime, slot: altSlot });
        }
      });
    });

    if (alternativeSlots2.length > 0) {
      options.push({
        type: "move_second",
        title: `Move ${session2.course.code} ${
          session2.session?.type || "Session"
        }`,
        description: "Move to an available time slot",
        alternatives: alternativeSlots2.slice(0, 3),
        impact: "Session will be moved to a different time",
      });
    }

    return options;
  };

  const handleResolveConflict = (conflictIndex, resolution) => {
    const conflict = conflicts[conflictIndex];
    const conflictDetails = getConflictDetails(conflict);

    if (!conflictDetails) return;

    let resolvedTimetable = { ...timetable };

    switch (resolution.type) {
      case "keep_first":
        delete resolvedTimetable[conflictDetails.slot2]; // Remove second session
        break;
      case "keep_second":
        delete resolvedTimetable[conflictDetails.slot1]; // Remove first session
        break;
      case "move_first":
        if (resolution.targetSlot) {
          delete resolvedTimetable[conflictDetails.slot1]; // Remove from current slot
          resolvedTimetable[resolution.targetSlot] = conflictDetails.session1; // Add to new slot
        }
        break;
      case "move_second":
        if (resolution.targetSlot) {
          delete resolvedTimetable[conflictDetails.slot2]; // Remove from current slot
          resolvedTimetable[resolution.targetSlot] = conflictDetails.session2; // Add to new slot
        }
        break;
      default:
        break;
    }

    onResolve(resolvedTimetable);
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="conflict-resolver-modal">
        <div className="modal-header">
          <h3>⚠️ Resolve Time Conflicts</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p>
            You have {conflicts.length} scheduling conflict
            {conflicts.length > 1 ? "s" : ""} that need to be resolved
          </p>

          <div className="conflicts-list">
            {conflicts.map((conflict, index) => {
              const conflictDetails = getConflictDetails(conflict);

              // Skip if conflict details are null
              if (!conflictDetails) {
                return null;
              }

              const resolutionOptions =
                generateResolutionOptions(conflictDetails);

              return (
                <div key={index} className="conflict-item">
                  <div className="conflict-header">
                    <h4>Conflict #{index + 1}</h4>
                    <div className="conflict-info">
                      <span className="conflict-day">
                        {conflictDetails.day}
                      </span>
                      <span className="conflict-times">
                        {conflictDetails.time1} - {conflictDetails.time2}
                      </span>
                    </div>
                  </div>

                  <div className="conflicting-sessions">
                    <div
                      className="session-card"
                      style={{
                        borderColor:
                          conflictDetails.session1.course?.color || "#ccc",
                      }}
                    >
                      <div className="session-title">
                        {conflictDetails.session1.course?.code || "Unknown"} -{" "}
                        {conflictDetails.session1.session?.type || "Session"}
                      </div>
                      <div className="session-time">
                        {conflictDetails.time1}
                      </div>
                    </div>

                    <div className="vs-separator">VS</div>

                    <div
                      className="session-card"
                      style={{
                        borderColor:
                          conflictDetails.session2.course?.color || "#ccc",
                      }}
                    >
                      <div className="session-title">
                        {conflictDetails.session2.course?.code || "Unknown"} -{" "}
                        {conflictDetails.session2.session?.type || "Session"}
                      </div>
                      <div className="session-time">
                        {conflictDetails.time2}
                      </div>
                    </div>
                  </div>

                  <div className="resolution-options">
                    <h5>Resolution Options:</h5>
                    {resolutionOptions.map((option, optionIndex) => (
                      <div key={optionIndex} className="resolution-option">
                        <div className="option-header">
                          <input
                            type="radio"
                            name={`conflict-${index}`}
                            value={optionIndex}
                            onChange={(e) => {
                              setSelectedResolution({
                                ...selectedResolution,
                                [index]: {
                                  ...option,
                                  optionIndex: parseInt(e.target.value),
                                },
                              });
                            }}
                          />
                          <label className="option-title">{option.title}</label>
                        </div>

                        <div className="option-description">
                          {option.description}
                        </div>

                        {option.alternatives && (
                          <div className="alternatives">
                            <span>Suggested times:</span>
                            {option.alternatives.map((alt, altIndex) => (
                              <button
                                key={altIndex}
                                className="alternative-slot"
                                onClick={() => {
                                  setSelectedResolution({
                                    ...selectedResolution,
                                    [index]: {
                                      ...option,
                                      targetSlot: alt.slot,
                                      optionIndex,
                                    },
                                  });
                                }}
                              >
                                {alt.day} {alt.time}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="option-impact">{option.impact}</div>
                      </div>
                    ))}

                    <button
                      className="resolve-btn"
                      disabled={!selectedResolution[index]}
                      onClick={() =>
                        handleResolveConflict(index, selectedResolution[index])
                      }
                    >
                      Apply Resolution
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="resolver-footer">
            <div className="conflict-tips">
              <h4>💡 Tips for Avoiding Conflicts</h4>
              <ul>
                <li>Check course schedules before adding multiple sessions</li>
                <li>Consider the duration of each session type</li>
                <li>Plan buffer time between back-to-back classes</li>
                <li>Review prerequisite chains when selecting courses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConflictResolver;
