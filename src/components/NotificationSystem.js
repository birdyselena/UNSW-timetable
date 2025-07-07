import React, { useState, useEffect, useCallback } from "react";
import "./NotificationSystem.css";

/**
 * Notification System Component
 * 全局通知系统，支持多种类型的通知
 */
const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // 添加通知的方法
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || "info",
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      action: notification.action,
      timestamp: new Date(),
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);

    // 自动移除通知
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // 移除通知
  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  // 清空所有通知
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // 将通知方法暴露到全局
  useEffect(() => {
    window.addNotification = addNotification;
    window.removeNotification = removeNotification;
    window.clearAllNotifications = clearAllNotifications;

    return () => {
      delete window.addNotification;
      delete window.removeNotification;
      delete window.clearAllNotifications;
    };
  }, [addNotification, removeNotification, clearAllNotifications]);

  const getIconForType = (type) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      case "conflict":
        return "⚡";
      case "schedule":
        return "📅";
      default:
        return "ℹ️";
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      <div className="notification-header">
        <h4>通知中心</h4>
        {notifications.length > 1 && (
          <button
            className="clear-all-btn"
            onClick={clearAllNotifications}
            title="清空所有通知"
          >
            清空全部
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-item ${notification.type}`}
            style={{
              animation: `slideInRight 0.3s ease-out`,
              animationDelay: "0.1s",
            }}
          >
            <div className="notification-icon">
              {getIconForType(notification.type)}
            </div>

            <div className="notification-content">
              <div className="notification-header-row">
                <h5 className="notification-title">{notification.title}</h5>
                <span className="notification-time">
                  {formatTime(notification.timestamp)}
                </span>
              </div>

              <p className="notification-message">{notification.message}</p>

              {notification.action && (
                <div className="notification-actions">
                  <button
                    className="notification-action-btn"
                    onClick={() => {
                      if (notification.action.onClick) {
                        notification.action.onClick();
                      } else if (notification.action.callback) {
                        notification.action.callback();
                      }
                      removeNotification(notification.id);
                    }}
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>

            <button
              className="notification-close"
              onClick={() => removeNotification(notification.id)}
              title="关闭通知"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// 便捷的通知方法
export const notify = {
  success: (title, message, options = {}) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "success",
        title,
        message,
        ...options,
      });
    }
  },

  error: (title, message, options = {}) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "error",
        title,
        message,
        duration: 8000, // 错误通知显示更久
        ...options,
      });
    }
  },

  warning: (title, message, options = {}) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "warning",
        title,
        message,
        duration: 7000,
        ...options,
      });
    }
  },

  info: (title, message, options = {}) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "info",
        title,
        message,
        ...options,
      });
    }
  },

  conflict: (title, message, action = null) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "conflict",
        title,
        message,
        duration: 10000,
        action,
      });
    }
  },

  schedule: (title, message, options = {}) => {
    if (window.addNotification) {
      return window.addNotification({
        type: "schedule",
        title,
        message,
        ...options,
      });
    }
  },
};

export default NotificationSystem;
