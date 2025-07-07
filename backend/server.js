const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const http = require("http");
const helmet = require("helmet");
const { RateLimiterMemory } = require("rate-limiter-flexible");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3002"],
    methods: ["GET", "POST"],
  },
});

// Security middleware
app.use(helmet());

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyGenerator: (req) => req.ip,
  points: 100, // Number of requests
  duration: 60, // Per 60 seconds
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).send("Too Many Requests");
  }
});

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB (using local fallback for demo)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/unsw-timetable";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch(() => {
    console.log("MongoDB not available, using in-memory storage");
  });

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timetables: [
    {
      name: String,
      courses: Array,
      timetable: Object,
      createdAt: { type: Date, default: Date.now },
      isPublic: { type: Boolean, default: false },
    },
  ],
  preferences: {
    notifications: { type: Boolean, default: true },
    theme: { type: String, default: "light" },
    autoSave: { type: Boolean, default: true },
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Course Schema
const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  color: String,
  sessions: Array,
  prerequisites: [String],
  credits: Number,
  faculty: String,
  semester: String,
  year: Number,
  ratings: [
    {
      userId: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  averageRating: { type: Number, default: 0 },
});

const Course = mongoose.model("Course", courseSchema);

// In-memory storage fallback
let inMemoryUsers = [];
let inMemoryCourses = [];
try {
  inMemoryCourses = require("./data/courses.json");
} catch (error) {
  console.log("Could not load courses.json, using empty array");
  inMemoryCourses = [];
}
let inMemoryTimetables = [];

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = new User({ username, email, password: hashedPassword });
      await user.save();

      const token = jwt.sign({ userId: user._id, username }, JWT_SECRET);
      res.json({ token, user: { id: user._id, username, email } });
    } else {
      // In-memory fallback
      const existingUser = inMemoryUsers.find(
        (u) => u.email === email || u.username === username
      );
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      const user = {
        id: Date.now().toString(),
        username,
        email,
        password: hashedPassword,
      };
      inMemoryUsers.push(user);

      const token = jwt.sign({ userId: user.id, username }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username, email } });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email });
    } else {
      user = inMemoryUsers.find((u) => u.email === email);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id || user.id, username: user.username },
      JWT_SECRET
    );
    res.json({
      token,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Course Routes
app.get("/api/courses", async (req, res) => {
  try {
    const { search, faculty, semester, year } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (faculty) query.faculty = faculty;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);

    let courses;
    if (mongoose.connection.readyState === 1) {
      courses = await Course.find(query);
    } else {
      courses = inMemoryCourses.filter((course) => {
        if (search) {
          const searchLower = search.toLowerCase();
          return (
            course.code.toLowerCase().includes(searchLower) ||
            course.name.toLowerCase().includes(searchLower) ||
            (course.description &&
              course.description.toLowerCase().includes(searchLower))
          );
        }
        return true;
      });
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/courses/:courseId/rate", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.userId;

    if (mongoose.connection.readyState === 1) {
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Remove existing rating from this user
      course.ratings = course.ratings.filter((r) => r.userId !== userId);

      // Add new rating
      course.ratings.push({ userId, rating, comment });

      // Calculate average rating
      course.averageRating =
        course.ratings.reduce((sum, r) => sum + r.rating, 0) /
        course.ratings.length;

      await course.save();
      res.json({
        message: "Rating added successfully",
        averageRating: course.averageRating,
      });
    } else {
      res.json({ message: "Rating saved (demo mode)" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Timetable Routes
app.get("/api/timetables", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    let timetables;
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      timetables = user ? user.timetables : [];
    } else {
      timetables = inMemoryTimetables.filter((t) => t.userId === userId);
    }

    res.json(timetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/timetables", authenticateToken, async (req, res) => {
  try {
    const { name, courses, timetable, isPublic } = req.body;
    const userId = req.user.userId;

    const newTimetable = {
      id: Date.now().toString(),
      name,
      courses,
      timetable,
      isPublic: isPublic || false,
      createdAt: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await User.findByIdAndUpdate(userId, {
        $push: { timetables: newTimetable },
      });
    } else {
      newTimetable.userId = userId;
      inMemoryTimetables.push(newTimetable);
    }

    // Emit to connected clients
    io.emit("timetable-saved", { userId, timetable: newTimetable });

    res.json(newTimetable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/api/timetables/:timetableId", authenticateToken, async (req, res) => {
  try {
    const { timetableId } = req.params;
    const { name, courses, timetable, isPublic } = req.body;
    const userId = req.user.userId;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      const timetableIndex = user.timetables.findIndex(
        (t) => t.id === timetableId
      );

      if (timetableIndex === -1) {
        return res.status(404).json({ error: "Timetable not found" });
      }

      user.timetables[timetableIndex] = {
        ...user.timetables[timetableIndex],
        name,
        courses,
        timetable,
        isPublic,
      };
      await user.save();

      res.json(user.timetables[timetableIndex]);
    } else {
      const timetableIndex = inMemoryTimetables.findIndex(
        (t) => t.id === timetableId && t.userId === userId
      );
      if (timetableIndex === -1) {
        return res.status(404).json({ error: "Timetable not found" });
      }

      inMemoryTimetables[timetableIndex] = {
        ...inMemoryTimetables[timetableIndex],
        name,
        courses,
        timetable,
        isPublic,
      };
      res.json(inMemoryTimetables[timetableIndex]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete(
  "/api/timetables/:timetableId",
  authenticateToken,
  async (req, res) => {
    try {
      const { timetableId } = req.params;
      const userId = req.user.userId;

      if (mongoose.connection.readyState === 1) {
        await User.findByIdAndUpdate(userId, {
          $pull: { timetables: { id: timetableId } },
        });
      } else {
        const index = inMemoryTimetables.findIndex(
          (t) => t.id === timetableId && t.userId === userId
        );
        if (index > -1) {
          inMemoryTimetables.splice(index, 1);
        }
      }

      res.json({ message: "Timetable deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Public timetables
app.get("/api/public-timetables", async (req, res) => {
  try {
    let publicTimetables;
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({ "timetables.isPublic": true });
      publicTimetables = users.flatMap((user) =>
        user.timetables
          .filter((t) => t.isPublic)
          .map((t) => ({
            ...t,
            author: user.username,
          }))
      );
    } else {
      publicTimetables = inMemoryTimetables.filter((t) => t.isPublic);
    }

    res.json(publicTimetables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Conflict detection API
app.post("/api/detect-conflicts", (req, res) => {
  try {
    const { timetable } = req.body;
    const conflicts = [];
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

    Object.entries(timetable).forEach(([slot1, session1]) => {
      Object.entries(timetable).forEach(([slot2, session2]) => {
        if (slot1 !== slot2 && session1 && session2) {
          const [day1, time1] = slot1.split("-");
          const [day2, time2] = slot2.split("-");

          if (day1 === day2) {
            const time1Index = timeSlots.indexOf(time1);
            const time2Index = timeSlots.indexOf(time2);
            const duration1 = session1.session?.duration || 1;
            const duration2 = session2.session?.duration || 1;

            const session1End = time1Index + duration1;
            const session2End = time2Index + duration2;

            if (time1Index < session2End && session1End > time2Index) {
              conflicts.push({
                slots: [slot1, slot2],
                courses: [session1.course.code, session2.course.code],
                day: day1,
                time: `${time1} - ${time2}`,
              });
            }
          }
        }
      });
    });

    res.json({ conflicts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export timetable as PDF/ICS
app.post("/api/export/:format", authenticateToken, async (req, res) => {
  try {
    const { format } = req.params;
    const { timetable, courses } = req.body;

    if (format === "ics") {
      const ical = require("ical-generator");
      const cal = ical({ name: "UNSW Timetable" });

      Object.entries(timetable).forEach(([slot, session]) => {
        const [day, time] = slot.split("-");
        const dayIndex = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ].indexOf(day);

        // Create recurring events for the semester
        cal.createEvent({
          start: new Date(
            2025,
            1,
            3 + dayIndex,
            parseInt(time.split(":")[0]),
            parseInt(time.split(":")[1])
          ),
          end: new Date(
            2025,
            1,
            3 + dayIndex,
            parseInt(time.split(":")[0]) + session.session.duration,
            parseInt(time.split(":")[1])
          ),
          summary: `${session.course.code} - ${session.session.type}`,
          description: session.course.name,
          repeating: {
            freq: "WEEKLY",
            count: 13, // 13 weeks in a semester
          },
        });
      });

      res.setHeader("Content-Type", "text/calendar");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="timetable.ics"'
      );
      res.send(cal.toString());
    } else if (format === "json") {
      res.json({ timetable, courses });
    } else {
      res.status(400).json({ error: "Unsupported format" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io for real-time features
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("timetable-update", (data) => {
    socket.to(data.room).emit("timetable-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
