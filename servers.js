const express = require("express");

const path = require("path");

const mongoose = require("mongoose");

const cors = require("cors");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();

console.log("JWT secret loaded:", !!process.env.JWT_SECRET);

const Student = require("./models/Student");

const Lesson = require("./models/Lesson1");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
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

app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        const student = await Student.create(req.body);
        console.log(student);
        res.send("Student registered successfully!");
    } catch (error) {
        console.log(error);
        res.status(500).send("Registration failed!");
    }
});
app.post("/login", async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.body.email });

        if (!student) {
            return res.status(401).send("Invalid email or password!");
        }

        const passwordMatch = await bcrypt.compare(
            req.body.password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).send("Invalid email or password!");
        }

        const token = jwt.sign(
            { studentId: student._id },
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
        const student = await Student.findByIdAndUpdate(
            req.user.studentId,
            req.body,
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

app.post("/lessons", async (req, res) => {
    try {
        const lesson = await Lesson.create(req.body);

        res.status(201).json(lesson);
    } catch (error) {
        console.log(error);
        res.status(500).send("Failed to create lesson!");
    }
});

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected!");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err);
    });
console.log("THIS IS THE STatech servers.js FILE");

app.listen(PORT, () => {
    console.log(`StaTech server is running on port ${PORT}`);
});