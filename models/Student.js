const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: String,
    age: Number,
    gender: String,
    email: String,
    password: String,
    school: String,
    grade: Number
});

module.exports = mongoose.model("Student", studentSchema);