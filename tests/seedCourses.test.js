const test = require('node:test');
const assert = require('node:assert/strict');

const { seedCourseData, lessons } = require('../seedCourses.js');

test('seedCourseData exports lesson data for the app', async () => {
  assert.equal(typeof seedCourseData, 'function');
  assert.ok(Array.isArray(lessons));
  assert.ok(lessons.length > 0);
  const seeded = await seedCourseData();
  assert.ok(Array.isArray(seeded));
  assert.ok(seeded.length >= lessons.length);
});

test('every seeded lesson has a complete quiz with valid answer choices', () => {
  assert.equal(lessons.length, 36);

  for (const lesson of lessons) {
    assert.ok(lesson.quizQuestions.length > 0, `${lesson.title} should have quiz questions`);

    for (const [questionIndex, quizQuestion] of lesson.quizQuestions.entries()) {
      assert.ok(quizQuestion.question.trim(), `${lesson.title} question ${questionIndex + 1} should have text`);
      assert.ok(quizQuestion.options.length >= 2, `${lesson.title} question ${questionIndex + 1} should have answer choices`);
      assert.ok(
        quizQuestion.options.includes(quizQuestion.answer),
        `${lesson.title} question ${questionIndex + 1} answer should appear among its choices`
      );
    }
  }
});
