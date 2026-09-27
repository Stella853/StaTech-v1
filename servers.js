const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const cors = require("cors");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
process.env.JWT_SECRET = jwtSecret;

console.log("JWT secret loaded:", !!process.env.JWT_SECRET);

const Student = require("./models/Student");

const Lesson = require("./models/Lesson1");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const mentorSchoolByEmail = new Map(
    (process.env.MENTOR_SCHOOLS || "")
        .split(",")
        .map((entry) => {
            const separator = entry.indexOf("=");
            return separator > 0
                ? [entry.slice(0, separator).trim().toLowerCase(), entry.slice(separator + 1).trim()]
                : null;
        })
        .filter((entry) => entry && entry[0] && entry[1])
);

function safelyMatchesInviteCode(providedCode, configuredCode) {
    const provided = Buffer.from(String(providedCode || ""));
    const configured = Buffer.from(String(configuredCode || ""));
    return provided.length === configured.length && crypto.timingSafeEqual(provided, configured);
}

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/public-config", (req, res) => {
    res.set("Cache-Control", "public, max-age=300");
    res.json({ contactEmail: process.env.PUBLIC_CONTACT_EMAIL || "" });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send("Access denied!");
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log("JWT verification error:", err.message);
            return res.status(403).send("Invalid token!");
        }

        req.user = user;
        next();
    });
}

async function authenticateMentor(req, res, next) {
    try {
        const mentor = await Student.findById(req.user.studentId).select("role school email");

        if (
            !mentor ||
            mentor.role !== "mentor" ||
            mentorSchoolByEmail.get(String(mentor.email).toLowerCase()) !== mentor.school
        ) {
            return res.status(403).send("Mentor access is not enabled for this account.");
        }

        req.mentor = mentor;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).send("Mentor access could not be checked.");
    }
}

app.post("/register", async (req, res) => {
    try {
        const payload = req.body || {};

        if (!payload.name || !payload.email || !payload.password) {
            return res.status(400).json({ message: "Name, email, and password are required." });
        }

        const normalizedEmail = String(payload.email).trim().toLowerCase();
        if (mentorSchoolByEmail.has(normalizedEmail)) {
            return res.status(409).json({ message: "This email must use the staff registration page." });
        }

        const existingStudent = await Student.findOne({ email: normalizedEmail });

        if (existingStudent) {
            return res.status(409).json({ message: "An account with that email already exists." });
        }

        const studentData = {
            name: String(payload.name).trim(),
            email: normalizedEmail,
            password: await bcrypt.hash(payload.password, 10),
            school: String(payload.school || "").trim(),
            grade: Number(payload.grade),
            age: Number(payload.age),
            gender: String(payload.gender || "").trim(),
            role: "student"
        };

        const student = await Student.create(studentData);
        console.log("Registered student:", student.email);
        res.status(201).json({ message: "Student registered successfully! Please log in." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Registration failed!" });
    }
});
app.post("/register/mentor", async (req, res) => {
    try {
        const payload = req.body || {};
        const name = String(payload.name || "").trim();
        const email = String(payload.email || "").trim().toLowerCase();
        const password = String(payload.password || "");
        const configuredInviteCode = process.env.MENTOR_INVITE_CODE || "";

        if (!name || !email || password.length < 12 || !payload.inviteCode) {
            return res.status(400).send("Complete every field and use a password of at least 12 characters.");
        }

        if (
            configuredInviteCode.length < 16 ||
            !mentorSchoolByEmail.has(email) ||
            !safelyMatchesInviteCode(payload.inviteCode, configuredInviteCode)
        ) {
            return res.status(403).send("Staff access could not be verified.");
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(409).send("An account with that email already exists. Contact the StaTech administrator.");
        }

        await Student.create({
            name,
            school: mentorSchoolByEmail.get(email),
            email,
            password: await bcrypt.hash(password, 10),
            role: "mentor"
        });

        res.status(201).send("Mentor account created. You can now sign in.");
    } catch (error) {
        console.log(error);
        res.status(500).send("Mentor registration failed.");
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");

        const student = await Student.findOne({ email });

        if (!student) {
            return res.status(401).send("Invalid email or password!");
        }

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).send("Invalid email or password!");
        }

        const token = jwt.sign(
            {
                studentId: student._id,
                role: student.role === "mentor" && mentorSchoolByEmail.get(email) === student.school ? "mentor" : "student"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
);

        res.send(token);
    } catch (error) {
        console.log(error);
        res.status(500).send("Login failed!");
    }
});

app.get("/dashboard", authenticateToken, async (req, res) => {
    console.log("Student ID:", req.user.studentId);
    const student = await Student.findById(req.user.studentId).select("-password");
    res.json(student);
});

app.put("/dashboard", authenticateToken, async (req, res) => {
    try {
        const profileFields = ["name", "school", "grade", "age", "gender"];
        const profileUpdates = Object.fromEntries(
            profileFields
                .filter((field) => Object.hasOwn(req.body || {}, field))
                .map((field) => [field, req.body[field]])
        );

        if (Object.keys(profileUpdates).length === 0) {
            return res.status(400).send("No profile fields were provided.");
        }

        const student = await Student.findByIdAndUpdate(
            req.user.studentId,
            profileUpdates,
            { new: true }
        ).select("-password");

        if (!student) {
            return res.status(404).send("Student not found!");
        }

        res.json(student);
    } catch (error) {
        console.log(error);
        res.status(500).send("Profile update failed!");
    }
});

app.get("/lessons", async (req, res) => {
    try {
        const lessons = await Lesson.find().sort({ grade: 1, order: 1 });
        res.json(lessons);
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to load lessons!");
    }
});

app.get("/progress", authenticateToken, async (req, res) => {
    try {
        const [student, totalLessons] = await Promise.all([
            Student.findById(req.user.studentId).select("completedLessons completedQuizLessons"),
            Lesson.countDocuments()
        ]);

        if (!student) {
            return res.status(404).send("Student not found!");
        }

        res.json({
            completedLessonIds: student.completedLessons || [],
            completedLessons: (student.completedLessons || []).length,
            completedQuizLessons: student.completedQuizLessons || [],
            completedQuizzes: (student.completedQuizLessons || []).length,
            totalLessons
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to load progress!");
    }
});

app.get("/mentor/learners", authenticateToken, authenticateMentor, async (req, res) => {
    try {
        const [learners, totalLessons] = await Promise.all([
            Student.find({ school: req.mentor.school, role: { $ne: "mentor" } })
                .select("name grade completedLessons completedQuizLessons")
                .sort({ name: 1 })
                .limit(200)
                .lean(),
            Lesson.countDocuments()
        ]);

        res.json({
            school: req.mentor.school,
            totalLessons,
            learners: learners.map((learner) => ({
                name: learner.name,
                grade: learner.grade,
                completedLessons: (learner.completedLessons || []).length,
                completedQuizzes: (learner.completedQuizLessons || []).length
            }))
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Learner activity could not be loaded.");
    }
});

app.post("/progress/lessons/:lessonId", authenticateToken, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId).select("_id");

        if (!lesson) {
            return res.status(404).send("Lesson not found!");
        }

        const student = await Student.findByIdAndUpdate(
            req.user.studentId,
            { $addToSet: { completedLessons: lesson._id } },
            { returnDocument: "after" }
        ).select("completedLessons completedQuizLessons");

        if (!student) {
            return res.status(404).send("Student not found!");
        }

        res.json({
            completedLessonIds: student.completedLessons || [],
            completedLessons: (student.completedLessons || []).length,
            completedQuizLessons: student.completedQuizLessons || [],
            completedQuizzes: (student.completedQuizLessons || []).length
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to update progress!");
    }
});

app.post("/progress/quizzes/:lessonId", authenticateToken, async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId).select("_id");

        if (!lesson) {
            return res.status(404).send("Lesson not found!");
        }

        const student = await Student.findByIdAndUpdate(
            req.user.studentId,
            { $addToSet: { completedQuizLessons: lesson._id } },
            { returnDocument: "after" }
        ).select("completedQuizLessons");

        if (!student) {
            return res.status(404).send("Student not found!");
        }

        res.json({
            completedQuizLessons: student.completedQuizLessons || [],
            completedQuizzes: (student.completedQuizLessons || []).length
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to update quiz progress!");
    }
});

app.post("/lessons", async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);

        res.status(201).json(lesson);
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to create lesson!");
    }
});

app.listen(PORT, () => {
    console.log(`StaTech server is running on port ${PORT}`);
});

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log("MongoDB connected!");
        })
        .catch((err) => {
            console.log("MongoDB connection error:", err.message);
        });
} else {
    console.log("MongoDB not configured; continuing without database connection.");
}