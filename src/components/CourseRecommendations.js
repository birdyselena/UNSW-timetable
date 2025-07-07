import React, { useState, useEffect } from "react";
import axios from "axios";
import { sampleCourses } from "../data/sampleCourses";
import "./CourseRecommendations.css";

function CourseRecommendations({ selectedCourses, onCourseSelect }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    faculty: "",
    semester: "",
    credits: "",
    difficulty: "",
  });

  useEffect(() => {
    generateRecommendations();
  }, [selectedCourses]);

  const generateRecommendations = async () => {
    console.log(
      "Generating recommendations for selected courses:",
      selectedCourses
    );
    setLoading(true);
    try {
      // Try to fetch from backend first
      let allCourses;
      try {
        const response = await axios.get("http://localhost:3001/api/courses", {
          params: {
            search: "",
            ...filters,
          },
        });
        allCourses = response.data;
        console.log("Fetched courses from backend:", allCourses);
      } catch (error) {
        console.log("Backend not available, using local data");
        // Fallback to local sample courses
        allCourses = sampleCourses;
        console.log("Using local courses:", allCourses);
      }

      // Filter out already selected courses
      const selectedCodes = selectedCourses.map((c) => c.code);
      allCourses = allCourses.filter(
        (course) => !selectedCodes.includes(course.code)
      );

      // Generate recommendations based on prerequisites and course relationships
      const recommendedCourses = allCourses.map((course) => {
        let score = 0;
        let reasons = [];

        // Check if selected courses satisfy prerequisites
        const hasPrerequisites = course.prerequisites?.every((prereq) =>
          selectedCodes.includes(prereq)
        );

        if (hasPrerequisites && course.prerequisites?.length > 0) {
          score += 50;
          reasons.push(
            `Prerequisites satisfied (${course.prerequisites.join(", ")})`
          );
        }

        // Same faculty bonus
        const sameFaculty = selectedCourses.some(
          (selected) => selected.faculty === course.faculty
        );
        if (sameFaculty) {
          score += 20;
          reasons.push(`Same faculty (${course.faculty})`);
        }

        // Course level progression
        const selectedLevels = selectedCourses.map((c) =>
          parseInt(c.code.match(/\d+/)?.[0] || "0")
        );
        const courseLevel = parseInt(course.code.match(/\d+/)?.[0] || "0");
        const maxSelectedLevel = Math.max(...selectedLevels, 0);

        if (
          courseLevel > maxSelectedLevel &&
          courseLevel <= maxSelectedLevel + 1000
        ) {
          score += 30;
          reasons.push("Natural progression from your current courses");
        }

        // High rating bonus
        if (course.averageRating >= 4) {
          score += 15;
          reasons.push(`Highly rated (${course.averageRating.toFixed(1)}/5)`);
        }

        // Popular combination bonus (simulated)
        const popularCombinations = {
          COMP1511: ["COMP1521", "COMP1531", "MATH1081"],
          COMP1521: ["COMP2511", "COMP2521"],
          COMP1531: ["COMP2511", "COMP3900"],
          MATH1081: ["COMP2521", "COMP3311"],
        };

        selectedCourses.forEach((selected) => {
          if (popularCombinations[selected.code]?.includes(course.code)) {
            score += 25;
            reasons.push(`Commonly taken with ${selected.code}`);
          }
        });

        return {
          ...course,
          recommendationScore: score,
          recommendationReasons: reasons,
        };
      });

      // Sort by recommendation score and take top 6
      const topRecommendations = recommendedCourses
        .filter((course) => course.recommendationScore > 0)
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 6);

      setRecommendations(topRecommendations);
    } catch (error) {
      console.error("Failed to generate recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    generateRecommendations();
  };

  if (selectedCourses.length === 0) {
    return (
      <div className="recommendations-container">
        <div className="recommendations-header">
          <h3>📚 Course Recommendations</h3>
          <p>Select some courses to get personalized recommendations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-container">
      <div className="recommendations-header">
        <h3>📚 Recommended Courses</h3>
        <p>Based on your selected courses and academic progression</p>
      </div>

      <div className="recommendation-filters">
        <select
          value={filters.faculty}
          onChange={(e) => handleFilterChange("faculty", e.target.value)}
        >
          <option value="">All Faculties</option>
          <option value="Engineering">Engineering</option>
          <option value="Science">Science</option>
          <option value="Business">Business</option>
          <option value="Arts">Arts</option>
        </select>

        <select
          value={filters.semester}
          onChange={(e) => handleFilterChange("semester", e.target.value)}
        >
          <option value="">All Semesters</option>
          <option value="T1">Term 1</option>
          <option value="T2">Term 2</option>
          <option value="T3">Term 3</option>
        </select>

        <select
          value={filters.credits}
          onChange={(e) => handleFilterChange("credits", e.target.value)}
        >
          <option value="">All Credit Points</option>
          <option value="3">3 Credit Points</option>
          <option value="6">6 Credit Points</option>
          <option value="9">9 Credit Points</option>
        </select>
      </div>

      {loading ? (
        <div className="recommendations-loading">
          <div className="loading-spinner"></div>
          <p>Generating personalized recommendations...</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.length === 0 ? (
            <div className="no-recommendations">
              <p>No recommendations found with current filters.</p>
              <button
                onClick={() => {
                  setFilters({
                    faculty: "",
                    semester: "",
                    credits: "",
                    difficulty: "",
                  });
                  generateRecommendations();
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            recommendations.map((course) => (
              <div key={course.id} className="recommendation-card">
                <div className="recommendation-header">
                  <div className="course-code" style={{ color: course.color }}>
                    {course.code}
                  </div>
                  <div className="recommendation-score">
                    {course.recommendationScore}% match
                  </div>
                </div>

                <h4 className="course-title">{course.name}</h4>

                <div className="course-details">
                  <span className="course-detail">🏛️ {course.faculty}</span>
                  <span className="course-detail">📅 {course.semester}</span>
                  <span className="course-detail">
                    ⭐{" "}
                    {course.averageRating > 0
                      ? course.averageRating.toFixed(1)
                      : "No rating"}
                  </span>
                </div>

                <div className="recommendation-reasons">
                  <h5>Why recommended:</h5>
                  <ul>
                    {course.recommendationReasons.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
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

                <button
                  className="add-course-btn"
                  onClick={() => onCourseSelect(course)}
                >
                  + Add to Timetable
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="recommendation-tips">
        <h4>💡 Tips for Course Selection</h4>
        <ul>
          <li>Check prerequisites carefully before enrolling</li>
          <li>Balance your workload across different course types</li>
          <li>Consider the semester when courses are offered</li>
          <li>Read course reviews and ratings from other students</li>
          <li>Plan your academic progression towards your degree goals</li>
        </ul>
      </div>
    </div>
  );
}

export default CourseRecommendations;
