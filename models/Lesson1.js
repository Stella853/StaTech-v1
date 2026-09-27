const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({

    title: String,

    subject: String,

    grade: Number,

    content: String,

    quizQuestions: [{
        question: String,
        options: [String],
        answer: String
    }],

    order: Number

});

module.exports = mongoose.model("Lesson", lessonSchema);