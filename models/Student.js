const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    email: String,
    password: String,
    school: String,
    grade: Number,
    role: {
        type: String,
        enum: ["student", "mentor"],
        default: "student"
    },
    completedLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }],
    completedQuizzes: {
        type: Number,
        default: 0
    },
    completedQuizLessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
    }]
});

module.exports = mongoose.model("Student", studentSchema);