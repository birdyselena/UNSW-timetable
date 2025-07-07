import React from "react";
import "./CourseDetails.css";

/**
 * Course Details Modal Component
 * 显示课程详细信息的模态框
 */
const CourseDetails = ({ course, isOpen, onClose }) => {
  if (!isOpen || !course) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrerequisites = (prereqs) => {
    if (!prereqs || prereqs.length === 0) return "无";
    return prereqs.join(", ");
  };

  const renderScheduleInfo = () => {
    if (!course.sessions || course.sessions.length === 0) {
      return <p className="no-schedule">暂无排课信息</p>;
    }

    return course.sessions.map((session, index) => (
      <div key={index} className="session-info">
        <div className="session-type">{session.type}</div>
        <div className="session-details">
          <span className="session-time">
            {session.day} {session.time} ({session.duration}小时)
          </span>
          {session.location && (
            <span className="session-location">📍 {session.location}</span>
          )}
          {session.instructor && (
            <span className="session-instructor">👨‍🏫 {session.instructor}</span>
          )}
        </div>
      </div>
    ));
  };

  const renderRating = (rating) => {
    if (!rating) return "暂无评分";

    const stars =
      "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
    return (
      <div className="rating-display">
        <span className="stars">{stars}</span>
        <span className="rating-number">({rating}/5)</span>
      </div>
    );
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="course-details-modal">
        <div className="modal-header">
          <div className="course-title-section">
            <h2 className="course-code">{course.code}</h2>
            <h3 className="course-name">{course.name}</h3>
          </div>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="course-basic-info">
            <div className="info-row">
              <label>学分：</label>
              <span>{course.credits || 6} UOC</span>
            </div>
            <div className="info-row">
              <label>学院：</label>
              <span>{course.faculty || "Engineering"}</span>
            </div>
            <div className="info-row">
              <label>课程类型：</label>
              <span className={`course-type ${course.type?.toLowerCase()}`}>
                {course.type || "Core"}
              </span>
            </div>
            <div className="info-row">
              <label>评分：</label>
              {renderRating(course.rating)}
            </div>
          </div>

          <div className="course-description">
            <h4>课程描述</h4>
            <p>{course.description || "暂无课程描述"}</p>
          </div>

          <div className="prerequisites-section">
            <h4>先修要求</h4>
            <p>{formatPrerequisites(course.prerequisites)}</p>
          </div>

          <div className="schedule-section">
            <h4>课程安排</h4>
            {renderScheduleInfo()}
          </div>

          {course.assessments && course.assessments.length > 0 && (
            <div className="assessments-section">
              <h4>考核方式</h4>
              <ul className="assessment-list">
                {course.assessments.map((assessment, index) => (
                  <li key={index} className="assessment-item">
                    <span className="assessment-type">{assessment.type}</span>
                    <span className="assessment-weight">
                      {assessment.weight}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.outcomes && course.outcomes.length > 0 && (
            <div className="outcomes-section">
              <h4>学习成果</h4>
              <ul className="outcomes-list">
                {course.outcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="course-stats">
            <div className="stat-item">
              <label>历史通过率：</label>
              <span>{course.passRate || "85"}%</span>
            </div>
            <div className="stat-item">
              <label>平均成绩：</label>
              <span>{course.averageGrade || "Credit"}</span>
            </div>
            <div className="stat-item">
              <label>课程难度：</label>
              <span
                className={`difficulty ${
                  course.difficulty?.toLowerCase() || "medium"
                }`}
              >
                {course.difficulty || "Medium"}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              // 添加到时间表的逻辑
              onClose();
            }}
          >
            添加到时间表
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
