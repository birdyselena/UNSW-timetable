import React, { useState, useEffect } from "react";
import "./CourseComparison.css";

/**
 * Course Comparison Component
 * 课程对比组件，支持多个课程的详细对比
 */
const CourseComparison = ({ isOpen, onClose, courses: allCourses }) => {
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 重置状态当模态框关闭时
  useEffect(() => {
    if (!isOpen) {
      setSelectedCourses([]);
      setSearchTerm("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCourses = allCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseSelect = (course) => {
    if (selectedCourses.find((c) => c.code === course.code)) {
      setSelectedCourses((prev) => prev.filter((c) => c.code !== course.code));
    } else if (selectedCourses.length < 4) {
      setSelectedCourses((prev) => [...prev, course]);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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

  const getComparisonFields = () => [
    {
      key: "basic",
      label: "基本信息",
      fields: [
        { key: "code", label: "课程代码", format: (value) => value },
        { key: "name", label: "课程名称", format: (value) => value },
        {
          key: "credits",
          label: "学分",
          format: (value) => `${value || 6} UOC`,
        },
        {
          key: "faculty",
          label: "学院",
          format: (value) => value || "Engineering",
        },
        { key: "type", label: "课程类型", format: (value) => value || "Core" },
      ],
    },
    {
      key: "academic",
      label: "学术信息",
      fields: [
        {
          key: "rating",
          label: "评分",
          format: (value) => renderRating(value),
        },
        {
          key: "difficulty",
          label: "难度",
          format: (value) => value || "Medium",
        },
        {
          key: "passRate",
          label: "通过率",
          format: (value) => `${value || 85}%`,
        },
        {
          key: "averageGrade",
          label: "平均成绩",
          format: (value) => value || "Credit",
        },
      ],
    },
    {
      key: "schedule",
      label: "课程安排",
      fields: [
        {
          key: "sessions",
          label: "上课时间",
          format: (value) => {
            if (!value || value.length === 0) return "暂无安排";
            return value
              .map(
                (session) => `${session.type}: ${session.day} ${session.time}`
              )
              .join(", ");
          },
        },
        {
          key: "totalHours",
          label: "总课时",
          format: (value, course) => {
            if (!course.sessions) return "未知";
            const total = course.sessions.reduce(
              (sum, session) => sum + (session.duration || 1),
              0
            );
            return `${total}小时/周`;
          },
        },
      ],
    },
    {
      key: "requirements",
      label: "要求",
      fields: [
        {
          key: "prerequisites",
          label: "先修课程",
          format: (value) => {
            if (!value || value.length === 0) return "无";
            return value.join(", ");
          },
        },
        {
          key: "assessments",
          label: "考核方式",
          format: (value) => {
            if (!value || value.length === 0) return "标准考核";
            return value
              .map((assessment) => `${assessment.type} (${assessment.weight}%)`)
              .join(", ");
          },
        },
      ],
    },
  ];

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="course-comparison-modal">
        <div className="modal-header">
          <h2>课程对比</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="course-selection-section">
          <div className="selection-header">
            <h3>选择要对比的课程</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="selected-courses">
            <h4>已选课程 ({selectedCourses.length}/4)</h4>
            <div className="selected-course-tags">
              {selectedCourses.map((course) => (
                <div key={course.code} className="selected-course-tag">
                  <span>{course.code}</span>
                  <button
                    onClick={() => handleCourseSelect(course)}
                    className="remove-course-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
              {selectedCourses.length === 0 && (
                <p className="no-selection">请选择要对比的课程</p>
              )}
            </div>
          </div>

          <div className="available-courses">
            <h4>可选课程</h4>
            <div className="course-grid">
              {filteredCourses.slice(0, 12).map((course) => (
                <div
                  key={course.code}
                  className={`course-card ${
                    selectedCourses.find((c) => c.code === course.code)
                      ? "selected"
                      : ""
                  } ${
                    selectedCourses.length >= 4 &&
                    !selectedCourses.find((c) => c.code === course.code)
                      ? "disabled"
                      : ""
                  }`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <div className="course-code">{course.code}</div>
                  <div className="course-name">{course.name}</div>
                  <div className="course-rating">
                    {renderRating(course.rating)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedCourses.length >= 2 && (
          <div className="comparison-section">
            <h3>对比结果</h3>
            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th className="category-header">对比项目</th>
                    {selectedCourses.map((course) => (
                      <th key={course.code} className="course-header">
                        <div className="course-header-content">
                          <div className="course-code">{course.code}</div>
                          <div className="course-name">{course.name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getComparisonFields().map((category) => (
                    <React.Fragment key={category.key}>
                      <tr className="category-row">
                        <td
                          className="category-title"
                          colSpan={selectedCourses.length + 1}
                        >
                          {category.label}
                        </td>
                      </tr>
                      {category.fields.map((field) => (
                        <tr key={field.key} className="field-row">
                          <td className="field-label">{field.label}</td>
                          {selectedCourses.map((course) => (
                            <td
                              key={`${course.code}-${field.key}`}
                              className="field-value"
                            >
                              {typeof field.format(
                                course[field.key],
                                course
                              ) === "object" ? (
                                field.format(course[field.key], course)
                              ) : (
                                <span>
                                  {field.format(course[field.key], course)}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="comparison-summary">
              <h4>对比总结</h4>
              <div className="summary-insights">
                {selectedCourses.length >= 2 && (
                  <>
                    <div className="insight-item">
                      <strong>最高评分：</strong>
                      {(() => {
                        const highest = selectedCourses.reduce(
                          (prev, current) =>
                            (current.rating || 0) > (prev.rating || 0)
                              ? current
                              : prev
                        );
                        return `${highest.code} (${highest.rating || "N/A"}/5)`;
                      })()}
                    </div>
                    <div className="insight-item">
                      <strong>最高学分：</strong>
                      {(() => {
                        const highest = selectedCourses.reduce(
                          (prev, current) =>
                            (current.credits || 6) > (prev.credits || 6)
                              ? current
                              : prev
                        );
                        return `${highest.code} (${highest.credits || 6} UOC)`;
                      })()}
                    </div>
                    <div className="insight-item">
                      <strong>课时分布：</strong>
                      {selectedCourses
                        .map((course) => {
                          const totalHours =
                            course.sessions?.reduce(
                              (sum, session) => sum + (session.duration || 1),
                              0
                            ) || 0;
                          return `${course.code}: ${totalHours}h/周`;
                        })
                        .join(", ")}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
          {selectedCourses.length > 0 && (
            <button
              className="btn-primary"
              onClick={() => {
                // 可以添加将对比结果导出或保存的功能
                console.log("导出对比结果", selectedCourses);
              }}
            >
              导出对比
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseComparison;
