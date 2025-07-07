import React, { useState } from "react";
import "./CourseSearch.css";

/**
 * Course Search Component
 *
 * @param {Object} props - Component props
 * @param {Array} props.courses - Array of available courses
 * @param {Function} props.onSearch - Search callback function
 * @param {Function} props.onCourseSelect - Course selection callback
 * @param {Array} props.selectedCourses - Array of selected courses
 * @param {Function} props.onShowDetails - Show course details callback
 * @param {Function} props.onAddToComparison - Add to comparison callback
 * @returns {JSX.Element} - Course search component
 */
function CourseSearch({
  courses,
  onSearch,
  onCourseSelect,
  selectedCourses,
  onShowDetails,
  onAddToComparison,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
    setIsExpanded(value.length > 0);
  };

  const handleCourseClick = (course) => {
    onCourseSelect(course);
    setSearchTerm("");
    setIsExpanded(false);
  };

  const isCourseSelected = (courseId) => {
    return selectedCourses.some((course) => course.id === courseId);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
    setIsExpanded(false);
  };

  return (
    <div className="course-search-container">
      <div className="search-input-container">
        <input
          type="text"
          placeholder="Search courses by code, name, or type (e.g., COMP1511, lecture, tutorial)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
          onFocus={() => searchTerm && setIsExpanded(true)}
        />
        {searchTerm && (
          <button onClick={clearSearch} className="clear-search-btn">
            ×
          </button>
        )}
        <div className="search-icon">🔍</div>
      </div>

      {isExpanded && searchTerm && (
        <div className="search-results">
          <div className="search-results-header">
            <span>Found {courses.length} courses</span>
          </div>

          {courses.length === 0 ? (
            <div className="no-results">
              <p>No courses found matching "{searchTerm}"</p>
              <p>Try searching by:</p>
              <ul>
                <li>Course code (e.g., COMP1511, MATH1081)</li>
                <li>Course name (e.g., Programming, Calculus)</li>
                <li>Session type (e.g., Lecture, Tutorial, Lab)</li>
              </ul>
            </div>
          ) : (
            <div className="search-results-list">
              {courses.map((course) => {
                const isSelected = isCourseSelected(course.id);
                return (
                  <div
                    key={course.id}
                    className={`search-result-item ${
                      isSelected ? "selected" : ""
                    }`}
                  >
                    <div className="course-header">
                      <div className="course-title">
                        <span
                          className="course-code"
                          style={{ color: course.color }}
                        >
                          {course.code}
                        </span>
                        <span className="course-name">{course.name}</span>
                      </div>
                      <div className="course-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onShowDetails && onShowDetails(course);
                          }}
                          className="action-btn details-btn"
                          title="View Details"
                        >
                          ℹ️
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToComparison && onAddToComparison(course);
                          }}
                          className="action-btn compare-btn"
                          title="Add to Comparison"
                        >
                          ⚖️
                        </button>
                        <button
                          onClick={() => handleCourseClick(course)}
                          className={`action-btn select-btn ${
                            isSelected ? "selected" : ""
                          }`}
                          title={
                            isSelected
                              ? "Remove from Timetable"
                              : "Add to Timetable"
                          }
                        >
                          {isSelected ? "✓" : "+"}
                        </button>
                      </div>
                    </div>

                    <div className="course-description">
                      {course.description}
                    </div>

                    <div className="course-sessions">
                      {course.sessions.map((session) => (
                        <span
                          key={session.id}
                          className="session-tag"
                          style={{
                            backgroundColor: course.color + "20",
                            color: course.color,
                          }}
                        >
                          {session.type} ({session.duration}h)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CourseSearch;
