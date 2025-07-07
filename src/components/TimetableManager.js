import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./TimetableManager.css";

function TimetableManager({
  currentTimetable,
  selectedCourses,
  onLoadTimetable,
}) {
  const [savedTimetables, setSavedTimetables] = useState([]);
  const [publicTimetables, setPublicTimetables] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showPublicModal, setShowPublicModal] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: "",
    isPublic: false,
  });
  const [loading, setLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadSavedTimetables();
    }
  }, [isAuthenticated]);

  const loadSavedTimetables = async () => {
    try {
      const response = await axios.get("http://localhost:3001/api/timetables");
      setSavedTimetables(response.data);
    } catch (error) {
      console.error("Failed to load timetables:", error);
    }
  };

  const loadPublicTimetables = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/public-timetables"
      );
      setPublicTimetables(response.data);
    } catch (error) {
      console.error("Failed to load public timetables:", error);
    }
  };

  const handleSave = async () => {
    if (!saveForm.name.trim()) {
      alert("Please enter a name for your timetable");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:3001/api/timetables", {
        name: saveForm.name,
        courses: selectedCourses,
        timetable: currentTimetable,
        isPublic: saveForm.isPublic,
      });

      setSaveForm({ name: "", isPublic: false });
      setShowSaveModal(false);
      loadSavedTimetables();
      alert("Timetable saved successfully!");
    } catch (error) {
      alert(
        "Failed to save timetable: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = (timetable) => {
    onLoadTimetable(timetable.timetable, timetable.courses);
    setShowLoadModal(false);
    setShowPublicModal(false);
  };

  const handleDelete = async (timetableId) => {
    if (!window.confirm("Are you sure you want to delete this timetable?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/api/timetables/${timetableId}`);
      loadSavedTimetables();
      alert("Timetable deleted successfully!");
    } catch (error) {
      alert(
        "Failed to delete timetable: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const exportTimetable = async (format) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/api/export/${format}`,
        {
          timetable: currentTimetable,
          courses: selectedCourses,
        },
        {
          responseType: format === "ics" ? "blob" : "json",
        }
      );

      if (format === "ics") {
        const blob = new Blob([response.data], { type: "text/calendar" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timetable.ics";
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Calendar file downloaded! Import it into your calendar app.");
      } else if (format === "json") {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "timetable.json";
        a.click();
        window.URL.revokeObjectURL(url);
        alert("Timetable data exported!");
      }
    } catch (error) {
      alert("Export failed: " + (error.response?.data?.error || error.message));
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="timetable-manager">
      <div className="manager-buttons">
        <button
          className="manager-btn save-btn"
          onClick={() => setShowSaveModal(true)}
          disabled={Object.keys(currentTimetable).length === 0}
        >
          💾 Save Timetable
        </button>

        <button
          className="manager-btn load-btn"
          onClick={() => {
            setShowLoadModal(true);
            loadSavedTimetables();
          }}
        >
          📂 Load Timetable
        </button>

        <button
          className="manager-btn public-btn"
          onClick={() => {
            setShowPublicModal(true);
            loadPublicTimetables();
          }}
        >
          🌐 Browse Public
        </button>

        <div className="export-buttons">
          <button
            className="manager-btn export-btn"
            onClick={() => exportTimetable("ics")}
            disabled={Object.keys(currentTimetable).length === 0}
            title="Export to Calendar (ICS)"
          >
            📅 Export Calendar
          </button>

          <button
            className="manager-btn export-btn"
            onClick={() => exportTimetable("json")}
            disabled={Object.keys(currentTimetable).length === 0}
            title="Export as JSON"
          >
            📋 Export Data
          </button>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Save Timetable</h3>
            <div className="form-group">
              <label>Timetable Name:</label>
              <input
                type="text"
                value={saveForm.name}
                onChange={(e) =>
                  setSaveForm({ ...saveForm, name: e.target.value })
                }
                placeholder="e.g., Computer Science T1 2025"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={saveForm.isPublic}
                  onChange={(e) =>
                    setSaveForm({ ...saveForm, isPublic: e.target.checked })
                  }
                />
                Make this timetable public (others can view and copy)
              </label>
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowSaveModal(false)}>Cancel</button>
              <button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal */}
      {showLoadModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>Your Saved Timetables</h3>
            <div className="timetables-list">
              {savedTimetables.length === 0 ? (
                <p>No saved timetables found.</p>
              ) : (
                savedTimetables.map((timetable) => (
                  <div key={timetable.id} className="timetable-item">
                    <div className="timetable-info">
                      <h4>{timetable.name}</h4>
                      <p>
                        {timetable.courses.length} courses •{" "}
                        {new Date(timetable.createdAt).toLocaleDateString()}
                      </p>
                      {timetable.isPublic && (
                        <span className="public-badge">Public</span>
                      )}
                    </div>
                    <div className="timetable-actions">
                      <button onClick={() => handleLoad(timetable)}>
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(timetable.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowLoadModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Public Timetables Modal */}
      {showPublicModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>Public Timetables</h3>
            <div className="timetables-list">
              {publicTimetables.length === 0 ? (
                <p>No public timetables found.</p>
              ) : (
                publicTimetables.map((timetable) => (
                  <div key={timetable.id} className="timetable-item">
                    <div className="timetable-info">
                      <h4>{timetable.name}</h4>
                      <p>
                        By {timetable.author} • {timetable.courses.length}{" "}
                        courses •{" "}
                        {new Date(timetable.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="timetable-actions">
                      <button onClick={() => handleLoad(timetable)}>
                        Copy to My Timetable
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowPublicModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableManager;
