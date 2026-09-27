const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dashboardHtml = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'dashboard.html'),
  'utf8'
);
const dashboardJs = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'dashboard.js'),
  'utf8'
);
const navigationJs = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'navigation.js'),
  'utf8'
);
const loginJs = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'login.js'),
  'utf8'
);
const loginHtml = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'login.html'),
  'utf8'
);
const registerHtml = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'register.html'),
  'utf8'
);
const homepageHtml = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'index.html'),
  'utf8'
);
const homepageCss = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'style.css'),
  'utf8'
);
const supportTickerJs = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'supportTicker.js'),
  'utf8'
);
const serviceWorkerJs = fs.readFileSync(
  path.join(__dirname, '..', 'public', 'service-worker.js'),
  'utf8'
);

test('dashboard uses the current roadmap buttons and subject containers', () => {
  assert.match(dashboardHtml, /data-roadmap-subject=/);
  assert.match(dashboardHtml, /id="activeCourseLessons"[^>]*hidden/);
  assert.ok(dashboardHtml.indexOf('class="roadmapSteps"') < dashboardHtml.indexOf('id="activeCourseLessons"'));
  assert.match(dashboardHtml, /aria-expanded="false"/);
  assert.doesNotMatch(dashboardJs, /getElementById\(["']programmingButton["']\)/);
  assert.doesNotMatch(dashboardJs, /getElementById\(["']lessonCategories["']\)/);
  assert.match(dashboardJs, /querySelectorAll\(["']\.roadmapButton["']\)/);
  assert.match(dashboardJs, /roadmapSteps\?\.classList\.add\(["']hasActiveCourse["']\)/);
  assert.match(dashboardJs, /renderLessonsBySubject\(subject, "activeCourseLessonList"\)/);
  assert.match(dashboardJs, /activeCourseLessons\.hidden = true/);
});

test('valid login sessions survive browser back navigation', () => {
  assert.match(loginJs, /return getRoleFromToken\(token\) === "mentor" \? "mentor\.html" : "dashboard\.html"/);
  assert.match(loginJs, /window\.location\.replace\(getSignedInPage\(token\)\)/);
  assert.match(loginJs, /window\.addEventListener\(["']pageshow["'], redirectIfAlreadySignedIn\)/);
  assert.match(dashboardJs, /response\.status !== 401 && response\.status !== 403/);
  assert.match(dashboardJs, /window\.location\.replace\(["']login\.html["']\)/);
  assert.match(dashboardJs, /showDashboardStatus\("We couldn't connect\./);
});

test('homepage course previews link to registration', () => {
  const courseLinks = homepageHtml.match(/<a class="coursePreview [^"]+" href="register\.html"/g) || [];
  assert.equal(courseLinks.length, 4);
  assert.equal((homepageHtml.match(/class="coursePreviewAction"/g) || []).length, 4);
});

test('homepage donation message can be paused and respects reduced motion', () => {
  assert.match(homepageHtml, /id="supportTicker"/);
  assert.match(homepageHtml, /href="#contact">Ask how to contribute/);
  assert.match(homepageCss, /@keyframes supportMessageTravel/);
  assert.match(homepageCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(supportTickerJs, /animationPlayState = isPaused \? "running" : "paused"/);
});

test('homepage provides an email contact without linking to the restricted profile', () => {
  assert.match(homepageHtml, /id="publicContactEmail" hidden/);
  assert.doesNotMatch(homepageHtml, /facebook\.com\/stella\.chabwera\.3/);
});

test("dashboard recommends lessons for the signed-in student's grade and offers all grades", () => {
  assert.match(dashboardJs, /Number\(lesson\.grade\) === studentGrade/);
  assert.match(dashboardJs, /Show all grade levels/);
  assert.match(dashboardJs, /There are no lessons for Grade/);
  assert.match(dashboardJs, /renderLessonsBySubject\(subject, containerId, !includeAllGrades\)/);
});

test('offline support caches app pages and lessons without reusing another student profile', () => {
  assert.match(navigationJs, /navigator\.serviceWorker\.register\("service-worker\.js"\)/);
  assert.match(serviceWorkerJs, /LESSON_CACHE/);
  assert.match(serviceWorkerJs, /requestUrl\.pathname\.endsWith\("\/lessons"\)/);
  assert.match(dashboardJs, /cachedStudent\?\.token === token/);
  assert.match(dashboardJs, /localStorage\.removeItem\(CACHED_STUDENT_KEY\)/);
  assert.match(dashboardJs, /getCachedLessons\(\)/);
  assert.match(dashboardJs, /function fetchWithTimeout\(url, options = \{\}\)/);
  assert.match(dashboardJs, /fetchWithTimeout\("http:\/\/localhost:3000\/lessons"\)/);
});

test('primary pages provide skip links and visible keyboard focus styles', () => {
  const pagesAndTargets = [
    [homepageHtml, "mainContent"],
    [dashboardHtml, "dashboardMain"],
    [loginHtml, "loginContainer"],
    [registerHtml, "registerContainer"]
  ];

  for (const [page, targetId] of pagesAndTargets) {
    assert.match(page, new RegExp(`class="skipLink" href="#${targetId}"`));
    assert.match(page, new RegExp(`id="${targetId}"`));
  }

  assert.match(homepageCss, /a:focus-visible,[\s\S]*\[tabindex\]:focus-visible/);
  assert.match(homepageCss, /\.authForm input:focus-visible/);
  assert.match(homepageCss, /\.sectionLabel\s*\{\s*color:\s*#176b87;/);
  assert.match(homepageCss, /\.homeNav \.navRegisterLink\s*\{[^}]*background:\s*#a3471f;/);
});

test('homepage includes offline-ready projects for local community topics', () => {
  assert.match(homepageHtml, /<section id="communityProjects"/);
  assert.equal((homepageHtml.match(/<details class="communityProject">/g) || []).length, 5);

  for (const topic of ["Water", "Farming", "Health", "Weather", "Energy"]) {
    assert.match(homepageHtml, new RegExp(`<span class="projectTheme">${topic}</span>`));
  }

  assert.match(homepageHtml, /Do not drink or handle water you are unsure is safe/);
  assert.match(homepageHtml, /do not diagnose illness or collect private health details/);
  assert.match(serviceWorkerJs, /statech-app-v9/);
});
