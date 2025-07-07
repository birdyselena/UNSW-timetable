import React, { useState, useEffect } from "react";
import UNSWTimetable from "./components/UNSWTimetable";
import CourseSearch from "./components/CourseSearch";
import TimetableStats from "./components/TimetableStats";
import TimetableManager from "./components/TimetableManager";
import CourseRecommendations from "./components/CourseRecommendations";
import Auth from "./components/Auth";
import NotificationSystem from "./components/NotificationSystem";
import CourseDetails from "./components/CourseDetails";
import CourseComparison from "./components/CourseComparison";
import ConflictResolver from "./components/ConflictResolver";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { sampleCourses } from "./data/sampleCourses";
import "./App.css";

function AppContent() {
  const [courses, setCourses] = useState(sampleCourses);
  const [filteredCourses, setFilteredCourses] = useState(sampleCourses);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] =
    useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [coursesToCompare, setCoursesToCompare] = useState([]);
  const [showConflictResolver, setShowConflictResolver] = useState(false);

  const { isAuthenticated, currentUser, logout } = useAuth();

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);

  // Show conflict resolver when conflicts are detected
  useEffect(() => {
    if (conflicts.length > 0) {
      if (window.addNotification) {
        window.addNotification({
          type: "warning",
          title: "Schedule Conflicts Detected",
          message: `Found ${conflicts.length} conflict(s) in your timetable. Click to resolve.`,
          duration: 8000,
          action: {
            label: "Resolve Conflicts",
            onClick: () => setShowConflictResolver(true),
          },
        });
      }
    }
  }, [conflicts]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    document.body.classList.toggle("dark-mode", newDarkMode);
  };

  const handleSearch = (searchTerm) => {
    console.log("Search term:", searchTerm);
    console.log("All courses:", courses);

    if (!searchTerm.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.sessions.some((session) =>
          session.type.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    console.log("Filtered courses:", filtered);
    setFilteredCourses(filtered);
  };

  const handleCourseSelect = (course) => {
    const isAlreadySelected = selectedCourses.some(
      (selected) => selected.id === course.id
    );

    if (isAlreadySelected) {
      setSelectedCourses(
        selectedCourses.filter((selected) => selected.id !== course.id)
      );
    } else {
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleLoadTimetable = (loadedTimetable, loadedCourses) => {
    setTimetable(loadedTimetable);
    setSelectedCourses(loadedCourses);
  };

  const handleRemoveCourse = (courseId) => {
    setSelectedCourses(
      selectedCourses.filter((course) => course.id !== courseId)
    );

    // Remove course sessions from timetable
    const newTimetable = { ...timetable };
    Object.keys(newTimetable).forEach((slot) => {
      if (newTimetable[slot]?.course?.id === courseId) {
        delete newTimetable[slot];
      }
    });
    setTimetable(newTimetable);
  };

  const handleShowCourseDetails = (course) => {
    setSelectedCourseForDetails(course);
    setShowCourseDetails(true);
  };

  const handleAddToComparison = (course) => {
    if (
      coursesToCompare.length < 3 &&
      !coursesToCompare.find((c) => c.id === course.id)
    ) {
      setCoursesToCompare([...coursesToCompare, course]);
      if (window.addNotification) {
        window.addNotification({
          type: "success",
          title: "Course Added to Comparison",
          message: `${course.code} has been added to comparison list.`,
          duration: 3000,
        });
      }
    }
  };

  const handleShowComparison = () => {
    if (coursesToCompare.length >= 2) {
      setShowComparison(true);
    } else {
      if (window.addNotification) {
        window.addNotification({
          type: "warning",
          title: "Not Enough Courses",
          message: "Please add at least 2 courses to compare.",
          duration: 4000,
        });
      }
    }
  };

  const handleConflictResolution = (resolvedTimetable) => {
    setTimetable(resolvedTimetable);
    setShowConflictResolver(false);
    if (window.addNotification) {
      window.addNotification({
        type: "success",
        title: "Conflicts Resolved",
        message: "Your timetable conflicts have been successfully resolved.",
        duration: 4000,
      });
    }
  };

  return (
    <div className={`App ${darkMode ? "dark-mode" : ""}`}>
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1>UNSW Course Timetable Planner</h1>
            <p>Search and drag courses to create your perfect timetable</p>
          </div>

          <div className="header-right">
            <button
              className="theme-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? "☀️" : "🌙"}
            </button>

            {isAuthenticated ? (
              <div className="user-menu">
                <span className="welcome-text">
                  Welcome, {currentUser?.username}!
                </span>
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="login-btn" onClick={() => setShowAuth(true)}>
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="search-section">
          <CourseSearch
            courses={filteredCourses}
            onSearch={handleSearch}
            onCourseSelect={handleCourseSelect}
            selectedCourses={selectedCourses}
            onShowDetails={handleShowCourseDetails}
            onAddToComparison={handleAddToComparison}
          />
        </div>

        <div className="timetable-section">
          <TimetableManager
            currentTimetable={timetable}
            selectedCourses={selectedCourses}
            onLoadTimetable={handleLoadTimetable}
          />

          <TimetableStats
            timetable={timetable}
            conflicts={conflicts}
            selectedCourses={selectedCourses}
          />

          {/* Control buttons for new features */}
          <div className="control-buttons">
            <button
              className="comparison-btn"
              onClick={handleShowComparison}
              disabled={coursesToCompare.length < 2}
            >
              Compare Courses ({coursesToCompare.length})
            </button>

            {conflicts.length > 0 && (
              <button
                className="resolve-conflicts-btn"
                onClick={() => setShowConflictResolver(true)}
              >
                Resolve Conflicts ({conflicts.length})
              </button>
            )}
          </div>

          <div className="selected-courses">
            <h3>Selected Courses ({selectedCourses.length})</h3>
            <div className="selected-courses-list">
              {selectedCourses.map((course) => (
                <div key={course.id} className="selected-course-item">
                  <span style={{ color: course.color }}>
                    {course.code} - {course.name}
                  </span>
                  <div className="course-actions">
                    <button
                      onClick={() => handleShowCourseDetails(course)}
                      className="details-btn"
                      title="View Details"
                    >
                      ℹ️
                    </button>
                    <button
                      onClick={() => handleAddToComparison(course)}
                      className="compare-btn"
                      title="Add to Comparison"
                    >
                      ⚖️
                    </button>
                    <button
                      onClick={() => handleRemoveCourse(course.id)}
                      className="remove-btn"
                      title="Remove Course"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <UNSWTimetable
            courses={selectedCourses}
            onTimetableChange={setTimetable}
            onConflictsChange={setConflicts}
          />
        </div>

        <CourseRecommendations
          selectedCourses={selectedCourses}
          onCourseSelect={handleCourseSelect}
        />
      </main>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}

      {/* Notification System */}
      <NotificationSystem />

      {/* Course Details Modal */}
      <CourseDetails
        course={selectedCourseForDetails}
        isOpen={showCourseDetails}
        onClose={() => setShowCourseDetails(false)}
      />

      {/* Course Comparison Modal */}
      <CourseComparison
        courses={coursesToCompare}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemoveCourse={(courseId) => {
          setCoursesToCompare(
            coursesToCompare.filter((c) => c.id !== courseId)
          );
        }}
      />

      {/* Conflict Resolver Modal */}
      <ConflictResolver
        isOpen={showConflictResolver}
        timetable={timetable}
        conflicts={conflicts}
        courses={selectedCourses}
        onClose={() => setShowConflictResolver(false)}
        onResolve={handleConflictResolution}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
