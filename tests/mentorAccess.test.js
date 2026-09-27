const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (relativePath) => fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
const server = read('servers.js');
const studentSchema = read('models/Student.js');
const mentorPage = read('public/mentor.html');
const mentorClient = read('public/mentor.js');
const mentorRegistrationPage = read('public/mentor-register.html');
const mentorRegistrationClient = read('public/mentor-register.js');
const loginClient = read('public/login.js');
const gitignore = read('.gitignore');
const envExample = read('.env.example');

test('mentor roles are explicit and student APIs cannot assign them', () => {
  assert.match(studentSchema, /enum: \["student", "mentor"\]/);
  assert.match(studentSchema, /default: "student"/);
  assert.match(server, /role: "student"/);
  assert.match(server, /const profileFields = \["name", "school", "grade", "age", "gender"\]/);
  assert.doesNotMatch(server, /\.\.\.payload/);
});

test('mentor registration requires approved email, assigned school, and a private invite code', () => {
  assert.match(server, /MENTOR_SCHOOLS/);
  assert.match(server, /MENTOR_INVITE_CODE/);
  assert.match(server, /crypto\.timingSafeEqual/);
  assert.match(server, /school: mentorSchoolByEmail\.get\(email\)/);
  assert.match(mentorRegistrationPage, /name="inviteCode"/);
  assert.match(mentorRegistrationClient, /\/register\/mentor/);
  assert.doesNotMatch(mentorRegistrationPage, /name="school"|name="grade"|name="age"|name="gender"/);
});

test('mentor activity API is role-gated, school-scoped, and returns limited progress data', () => {
  assert.match(server, /mentor\.role !== "mentor"/);
  const routeStart = server.indexOf('app.get("/mentor/learners"');
  const routeEnd = server.indexOf('app.post("/progress/lessons', routeStart);
  const mentorRoute = server.slice(routeStart, routeEnd);

  assert.match(mentorRoute, /authenticateToken, authenticateMentor/);
  assert.match(mentorRoute, /school: req\.mentor\.school/);
  assert.match(mentorRoute, /\.select\("name grade completedLessons completedQuizLessons"\)/);
  assert.doesNotMatch(mentorRoute, /email|password|gender|age/);
  assert.doesNotMatch(mentorClient, /innerHTML/);
  assert.match(mentorPage, /<th scope="col">Learner<\/th>/);
  assert.match(loginClient, /getRoleFromToken\(token\) === "mentor" \? "mentor\.html"/);
});

test('mentor credentials are documented with placeholders and private env files are ignored', () => {
  assert.match(gitignore, /^\.env$/m);
  assert.match(gitignore, /^\.env\.\*$/m);
  assert.match(envExample, /MENTOR_SCHOOLS=mentor@example\.org=Example School/);
  assert.match(envExample, /MENTOR_INVITE_CODE=replace-with-/);
});