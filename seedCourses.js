require("dotenv").config();

const mongoose = require("mongoose");
const Lesson = require("./models/Lesson1");

const subjectGuides = {
  "Computer Science": "Computer science is a way of thinking carefully about information, systems, and people’s needs. When you learn a concept, connect it to something you already know, such as organizing schoolwork, sharing a message, measuring rainfall, or planning a journey. There is more than one correct solution to many problems. A strong solution is understandable, testable, useful to its intended users, and respectful of privacy and safety.",
  "Programming": "Programming is learned through a cycle of planning, writing, running, reading errors, and improving. Do not worry if the first version is not perfect. Start with a small example, predict what should happen, and compare that prediction with the result. Explain your thinking aloud or in a notebook. This makes invisible computer processes easier to understand and helps you become an independent problem solver.",
  "Web Development": "A useful webpage begins with its audience and purpose. Before choosing colors or effects, decide what a visitor should understand or do. Build the simplest working version first, then improve its structure, appearance, accessibility, and speed. A web creator should consider learners using small screens, shared devices, keyboard navigation, screen readers, or an unreliable connection.",
  "Python": "Python becomes easier when you change one small example at a time. Before running a program, predict its output. After running it, explain every line in your own words. Keep a notebook of new vocabulary, errors, and discoveries. You can practise Python with local files and printed notes when internet access is unavailable, then share your work later when a connection is available."
};

function expandLesson(subject, title, content, order) {
  const activity = subject === "Computer Science"
    ? `Draw or describe a system connected to "${title}" in your community. Label what goes in, what happens, what comes out, and who benefits. Then identify one possible risk and one way to make the system safer or fairer.`
    : subject === "Programming"
      ? `Create a small example related to "${title}". First write the steps in plain language, then write or adapt code, test it with at least three different inputs, and record what happened. Change one part and predict how the result will change.`
      : subject === "Web Development"
        ? `Make a paper sketch or a simple offline page about "${title}" for another learner. Include a clear heading, short sections, an example, and one action the visitor can take. Ask a friend to find information on the page and note anything that was confusing.`
        : `Practise "${title}" by writing a short Python program or changing the example from this lesson. Test a normal input, an unusual input, and an empty or boundary input. Write down the error message if something fails and explain how you fixed it.`;

  return `${content}\n\nWhy this matters\n${subjectGuides[subject]}\n\nLearning goals\nBy the end of this lesson, you should be able to explain the main idea of ${title.toLowerCase()}, use the new vocabulary in your own words, and connect the idea to a real need in your home, school, or community. You are not expected to memorise every word. Understanding, asking questions, and trying examples are more important than getting everything right on the first attempt.\n\nTry it\n${activity}\n\nCheck your understanding\n1. What is the most important idea from this lesson, and how would you explain it to a younger learner?\n2. What could go wrong when someone uses this idea carelessly?\n3. How could this knowledge help a girl in your community learn, create, earn, stay safe, or solve a local problem?\n\nMini checkpoint\nWrite three new words from this lesson and define them. Then write one question you still have. Bring the question to a teacher, study partner, or trusted adult, and add the answer to your learning notebook.\n\nLesson ${order} challenge\nUse what you learned to make one small improvement to an object, process, program, or webpage around you. Describe the problem, your idea, what you tried, and what you would improve next time.`;
}

function createQuiz(subject, title) {
  const quizBank = {
    "What Is Computer Science?": [
      ["What does computer science study?", ["How information is represented and processed", "Only how to repair screens", "Only how to type quickly", "Only how to use social media"], "How information is represented and processed"],
      ["Which area can use computer science?", ["Health and farming", "Only games", "Only drawing", "None of these"], "Health and farming"],
      ["Who decides which problems technology should solve?", ["People", "The keyboard", "The battery", "The screen"], "People"]
    ],
    "Computer Hardware and Software": [
      ["What is hardware?", ["The physical parts of a computer", "Instructions only", "A website address", "A password"], "The physical parts of a computer"],
      ["What does software provide?", ["Instructions for hardware", "Electricity for a building", "A chair for a computer", "Paper for printing"], "Instructions for hardware"],
      ["Which is an input device?", ["Keyboard", "Screen", "Speaker", "Projector"], "Keyboard"]
    ],
    "Files, Folders, and Storage": [
      ["What is a file?", ["Saved information such as a document or photo", "A computer chair", "A type of keyboard", "A network cable"], "Saved information such as a document or photo"],
      ["What helps organize files?", ["Folders", "Speakers", "Passwords", "Browsers"], "Folders"],
      ["Which unit is larger?", ["A gigabyte", "A byte", "A bit", "A single character"], "A gigabyte"]
    ],
    "The Internet and Networks": [
      ["What does a network do?", ["Connects devices to share information", "Deletes every file", "Only charges phones", "Prints without instructions"], "Connects devices to share information"],
      ["What does a browser request?", ["A webpage from a server", "A new keyboard", "A battery", "A school uniform"], "A webpage from a server"],
      ["Why should you use trusted websites?", ["Information and links can affect your safety", "They make the screen brighter", "They remove all passwords", "They never contain information"], "Information and links can affect your safety"]
    ],
    "Algorithms and Problem Solving": [
      ["What is an algorithm?", ["A clear list of steps", "A computer screen", "A storage device", "A type of paint"], "A clear list of steps"],
      ["What does decomposition mean?", ["Breaking a problem into smaller parts", "Deleting a program", "Making a screen larger", "Sharing a password"], "Breaking a problem into smaller parts"],
      ["What should you do before coding a solution?", ["Describe the problem and plan steps", "Guess without testing", "Skip the problem", "Turn off the computer"], "Describe the problem and plan steps"]
    ],
    "Data and Information": [
      ["What is data?", ["Facts such as numbers or survey answers", "Only a computer cable", "A password", "A chair"], "Facts such as numbers or survey answers"],
      ["What can a chart reveal?", ["Patterns in organized data", "A hidden password", "The age of a computer", "How to repair a screen"], "Patterns in organized data"],
      ["What should you consider before collecting data?", ["Whether it is necessary, fair, and permitted", "Whether it is colorful", "Whether it is secret from everyone", "Whether it uses the biggest file"], "Whether it is necessary, fair, and permitted"]
    ],
    "Digital Safety and Responsible Technology": [
      ["Which password habit is safest?", ["Use a long, unique password", "Share it publicly", "Use the same short password everywhere", "Write it in a public post"], "Use a long, unique password"],
      ["What should you do with a worrying message?", ["Tell a trusted adult", "Forward it to everyone", "Share your verification code", "Click every link"], "Tell a trusted adult"],
      ["What should you do before sharing someone’s photo?", ["Ask for permission", "Share it secretly", "Remove their name only", "Post it immediately"], "Ask for permission"]
    ],
    "Designing a Solution": [
      ["What should designers do first?", ["Listen to a real need", "Choose decorations", "Publish without testing", "Ignore users"], "Listen to a real need"],
      ["What is a prototype?", ["An early version used for testing", "A final password", "A type of network", "A computer virus"], "An early version used for testing"],
      ["Why test a design with users?", ["Their feedback can reveal improvements", "To hide mistakes", "To make it more expensive", "To avoid learning"], "Their feedback can reveal improvements"]
    ],
    "Computing and Your Future": [
      ["Which is a computing career?", ["Data scientist", "Only driver", "Only singer", "None of these"], "Data scientist"],
      ["What builds evidence of your ability?", ["Small projects and practice", "Avoiding every challenge", "Copying all work", "Never asking questions"], "Small projects and practice"],
      ["Who belongs in technology spaces?", ["Everyone, including girls", "Only adults", "Only people in cities", "Only people with expensive devices"], "Everyone, including girls"]
    ],
    "Programming and Instructions": [
      ["What does a program contain?", ["Precise instructions for a computer", "Only pictures", "A paper map", "A battery"], "Precise instructions for a computer"],
      ["What is pseudocode?", ["Plain-language steps before coding", "A computer virus", "A type of screen", "A password"], "Plain-language steps before coding"],
      ["What are input and output?", ["Information entering and leaving a program", "Two types of batteries", "Two web browsers", "Two folders"], "Information entering and leaving a program"]
    ],
    "Values, Variables, and Types": [
      ["What does a variable do?", ["Names and stores a value", "Deletes all code", "Repairs hardware", "Connects to Wi-Fi"], "Names and stores a value"],
      ["What type is the value True?", ["Boolean", "String", "Float", "List"], "Boolean"],
      ["Which is a string?", ["\"Lina\"", "14", "3.5", "True"], "\"Lina\""]
    ],
    "Decisions with Conditions": [
      ["What does a condition produce?", ["True or false", "A photo", "A folder", "A sound"], "True or false"],
      ["Which operator means equal in Python?", ["==", "=", "!=", ">"], "=="],
      ["Why test both paths of a decision?", ["To check every possible behavior", "To make code longer", "To avoid conditions", "To delete the program"], "To check every possible behavior"]
    ],
    "Repeating Work with Loops": [
      ["What does a loop do?", ["Repeats instructions", "Deletes a variable", "Opens a website", "Changes a password"], "Repeats instructions"],
      ["When is a for loop useful?", ["When visiting items or a known range", "Only when the computer is off", "Only for images", "Never"], "When visiting items or a known range"],
      ["What is an infinite loop?", ["A loop that never stops", "A loop that runs once", "A list with no items", "A syntax color"], "A loop that never stops"]
    ],
    "Functions and Reuse": [
      ["What is a function?", ["A named block that performs a task", "A computer screen", "A network cable", "A file folder"], "A named block that performs a task"],
      ["What can a parameter provide?", ["Input to a function", "A screen image", "Electricity", "A password"], "Input to a function"],
      ["What does return do?", ["Sends a result back", "Deletes a function", "Starts the computer", "Prints every file"], "Sends a result back"]
    ],
    "Lists and Collections": [
      ["What does a list store?", ["Several values in one place", "Only one password", "A computer battery", "A website"], "Several values in one place"],
      ["What is the first Python list index?", ["0", "1", "-1", "10"], "0"],
      ["Why use a collection?", ["To work with related values", "To hide errors", "To remove all input", "To stop every loop"], "To work with related values"]
    ],
    "Debugging and Testing": [
      ["What is a bug?", ["A mistake causing unexpected behavior", "A useful variable", "A type of keyboard", "A folder"], "A mistake causing unexpected behavior"],
      ["What should you read when a program fails?", ["The error message", "A random webpage", "A password", "A photo"], "The error message"],
      ["Which inputs should testing include?", ["Normal, unusual, and empty inputs", "Only one perfect input", "No inputs", "Only copied inputs"], "Normal, unusual, and empty inputs"]
    ],
    "Programming Project: Study Helper": [
      ["What should the study helper ask for?", ["A name and study time", "A password from a stranger", "A bank number", "A secret location"], "A name and study time"],
      ["When should it suggest a break?", ["When study time is 25 minutes or more", "Only at midnight", "Never", "After one second"], "When study time is 25 minutes or more"],
      ["Why test zero minutes?", ["It checks an unusual input", "It makes the code prettier", "It removes the list", "It changes the computer"], "It checks an unusual input"]
    ],
    "Programming Ethics and Impact": [
      ["What should programmers protect?", ["Privacy, safety, and fairness", "Only colors", "Only speed", "Only passwords they own"], "Privacy, safety, and fairness"],
      ["What should you do before using someone’s data?", ["Get permission", "Share it publicly", "Guess their permission", "Hide the use"], "Get permission"],
      ["What makes a program more inclusive?", ["Considering different users and needs", "Excluding beginners", "Using only one language", "Ignoring accessibility"], "Considering different users and needs"]
    ],
    "How Websites Work": [
      ["What does HTML describe?", ["Page content and structure", "Only colors", "Only animations", "Computer electricity"], "Page content and structure"],
      ["What does CSS control?", ["Appearance and layout", "Passwords", "The server’s electricity", "Email addresses"], "Appearance and layout"],
      ["What does JavaScript add?", ["Behavior and interaction", "Paper pages", "A keyboard", "A battery"], "Behavior and interaction"]
    ],
    "HTML: Structure and Meaning": [
      ["What is an HTML heading used for?", ["Organizing page ideas", "Changing a password", "Connecting Wi-Fi", "Storing a photo"], "Organizing page ideas"],
      ["Why use meaningful HTML elements?", ["They help people and tools understand the page", "They hide all content", "They remove CSS", "They make passwords longer"], "They help people and tools understand the page"],
      ["Which element creates a paragraph?", ["<p>", "<img>", "<bracket>", "<screen>"], "<p>"]
    ],
    "HTML Forms and Useful Content": [
      ["What do forms let visitors do?", ["Send information", "Repair a keyboard", "Change the weather", "Delete the internet"], "Send information"],
      ["What should a form label do?", ["Clearly describe an input", "Hide the input", "Ask for every private detail", "Replace the page heading"], "Clearly describe an input"],
      ["What should you plan before decoration?", ["What visitors need to learn or do", "Only the background color", "A secret password", "An unrelated image"], "What visitors need to learn or do"]
    ],
    "CSS: Style and Layout": [
      ["What does CSS change?", ["Colors, spacing, and layout", "Only passwords", "The internet connection", "The computer battery"], "Colors, spacing, and layout"],
      ["What does a selector choose?", ["An HTML element to style", "A password", "A server", "A school"], "An HTML element to style"],
      ["Why is strong contrast important?", ["It makes text easier to read", "It hides content", "It removes HTML", "It stops all clicks"], "It makes text easier to read"]
    ],
    "Responsive Web Design": [
      ["What is responsive design?", ["A page that adapts to different screens", "A page that only works on desktops", "A password system", "A type of server"], "A page that adapts to different screens"],
      ["What should you test?", ["Phones, computers, and keyboard use", "Only one large screen", "Only the colors", "Nothing"], "Phones, computers, and keyboard use"],
      ["Why keep pages lightweight?", ["Some learners have slow connections or older devices", "It makes text invisible", "It removes accessibility", "It prevents learning"], "Some learners have slow connections or older devices"]
    ],
    "JavaScript and Interaction": [
      ["What can JavaScript respond to?", ["A button click", "Only a printed page", "A pencil", "A chair"], "A button click"],
      ["What can JavaScript change?", ["Page text and feedback", "The weather", "A physical keyboard", "A person’s password without permission"], "Page text and feedback"],
      ["What should a button have?", ["A clear name", "A hidden purpose", "No label", "A private password"], "A clear name"]
    ],
    "Accessibility and Inclusive Design": [
      ["What is accessibility?", ["Making websites usable by people with different needs", "Making a site colorful only", "Hiding content", "Removing headings"], "Making websites usable by people with different needs"],
      ["What helps a screen reader understand an image?", ["Useful alt text", "A random color", "A hidden password", "A larger border"], "Useful alt text"],
      ["How can you test keyboard access?", ["Use the page without a mouse", "Turn off all text", "Delete the buttons", "Only use a photo"], "Use the page without a mouse"]
    ],
    "Web Project: Local Learning Page": [
      ["What could the page teach?", ["A local science topic", "A private password", "Unrelated rumors", "Nothing"], "A local science topic"],
      ["What should an image include?", ["Alt text", "A password", "A hidden form", "No description"], "Alt text"],
      ["What should you test?", ["A phone-sized screen and offline use", "Only a large monitor", "Only the background", "No part of the page"], "A phone-sized screen and offline use"]
    ],
    "Online Safety for Web Creators": [
      ["What should not be published without permission?", ["Private names, locations, and photos", "Public science facts", "A page heading", "A general color"], "Private names, locations, and photos"],
      ["What makes a website trustworthy?", ["Truthfulness and respect for visitors", "Pressure to share everything", "Hidden forms", "False claims"], "Truthfulness and respect for visitors"],
      ["What should a form explain?", ["How it uses information", "A secret password", "Unrelated advertisements", "Nothing"], "How it uses information"]
    ],
    "Meet Python": [
      ["What is Python?", ["A programming language", "A keyboard", "A browser", "A folder"], "A programming language"],
      ["What can Python be used for?", ["Science, games, websites, and data", "Only typing", "Only drawing", "Only charging phones"], "Science, games, websites, and data"],
      ["Where can you practise without internet?", ["A local Python installation", "Only a social network", "Only an online video", "Nowhere"], "A local Python installation"]
    ],
    "Print and Comments": [
      ["What does print do?", ["Displays a result", "Deletes a file", "Opens a browser", "Changes hardware"], "Displays a result"],
      ["What begins a Python comment?", ["#", "//", "<>", "$$"], "#"],
      ["Why run small programs often?", ["It helps find mistakes early", "It removes all code", "It hides results", "It disables Python"], "It helps find mistakes early"]
    ],
    "Variables and Input": [
      ["What does input() read?", ["Text typed by a user", "A photograph", "A folder", "A password automatically"], "Text typed by a user"],
      ["What does int() do?", ["Converts suitable text to a whole number", "Prints a photo", "Creates a website", "Deletes input"], "Converts suitable text to a whole number"],
      ["Why explain expected input?", ["It helps users answer correctly", "It hides errors", "It removes variables", "It stops the program"], "It helps users answer correctly"]
    ],
    "Math and Useful Operators": [
      ["What does % give in Python?", ["A remainder", "A password", "A folder", "A webpage"], "A remainder"],
      ["What does // do?", ["Whole-number division", "Text input", "A comment", "A loop condition"], "Whole-number division"],
      ["What is a useful everyday calculation?", ["Converting minutes into hours", "Guessing a password", "Deleting data", "Hiding a result"], "Converting minutes into hours"]
    ],
    "If, Elif, and Else": [
      ["What does if do?", ["Chooses an action when a condition is true", "Repeats forever", "Stores a photo", "Closes Python"], "Chooses an action when a condition is true"],
      ["What is elif used for?", ["Checking another condition", "Printing every file", "Creating hardware", "Deleting input"], "Checking another condition"],
      ["What shows which code belongs inside a decision?", ["Indentation", "Color alone", "The file name", "The keyboard"], "Indentation"]
    ],
    "For Loops and While Loops": [
      ["What does a for loop visit?", ["Items or numbers in a sequence", "Only passwords", "Only images", "The computer battery"], "Items or numbers in a sequence"],
      ["What controls a while loop?", ["A condition", "A screen size", "A folder name", "A photo"], "A condition"],
      ["What should a while loop have?", ["A reliable stopping condition", "No condition", "A hidden password", "Only one line"], "A reliable stopping condition"]
    ],
    "Lists and Dictionaries": [
      ["What do lists keep?", ["Items in order", "Only passwords", "Only images", "Computer electricity"], "Items in order"],
      ["What connects keys to values?", ["A dictionary", "A loop only", "A comment", "A browser"], "A dictionary"],
      ["When is a dictionary useful?", ["When values have meaningful labels", "When no data exists", "Only for colors", "Only for hardware"], "When values have meaningful labels"]
    ],
    "Functions and Modules": [
      ["What does a function package?", ["A repeated task", "A computer battery", "A webpage image", "A password"], "A repeated task"],
      ["What is a module?", ["A file or library with useful code", "A type of screen", "A keyboard key", "A network cable"], "A file or library with useful code"],
      ["What should you do before using a library?", ["Read its documentation and understand it", "Copy it blindly", "Share private data", "Delete the code"], "Read its documentation and understand it"]
    ],
    "Python Project: Community Calculator": [
      ["What does the calculator find?", ["Total notebooks needed", "A password", "A webpage color", "A network address"], "Total notebooks needed"],
      ["What should happen with invalid input?", ["The program should respond helpfully", "It should share data", "It should pretend success", "It should erase the computer"], "The program should respond helpfully"],
      ["Why is this useful to a school?", ["It can help plan supplies", "It replaces teachers", "It removes learning", "It hides numbers"], "It can help plan supplies"]
    ]
  };

  const questions = quizBank[title];

  if (!questions) {
    throw new Error(`No topic-specific quiz found for ${subject}: ${title}`);
  }

  return questions.map(([question, options, answer]) => ({ question, options, answer }));
}

const courses = [
  {
    subject: "Computer Science",
    lessons: [
      ["What Is Computer Science?", "Computer science is the study of how information can be represented, processed, stored, and shared. It is not only about using computers. It helps us solve problems in health, farming, education, business, science, and communication.\n\nA computer follows instructions, but people decide which problems are worth solving. Your ideas and questions are the most important tools you bring to this course."],
      ["Computer Hardware and Software", "Hardware is the physical part of a computer, such as the keyboard, screen, processor, memory, and storage drive. Software is the set of instructions that tells the hardware what to do.\n\nInput devices send information in, processing happens in the computer, storage keeps information, and output devices show or play results. A phone, tablet, and school computer use the same basic input-process-output idea."],
      ["Files, Folders, and Storage", "A file is a saved piece of information, such as a document, photo, video, or program. A folder helps you organize files. Give files clear names and keep copies of important schoolwork in a second safe place when possible.\n\nStorage is measured in bytes. A kilobyte is larger than a byte, a megabyte is larger than a kilobyte, and a gigabyte is larger than a megabyte. Delete only files you understand, especially on a shared computer."],
      ["The Internet and Networks", "A network connects devices so they can share information. The internet is a worldwide network of networks. A browser requests a webpage, and a server sends the page back. Wi-Fi connects a device to a local network, while mobile data connects through a cellular network.\n\nInformation may travel through many computers before reaching its destination. This is why a strong password, careful sharing, and trusted websites matter."],
      ["Algorithms and Problem Solving", "An algorithm is a clear list of steps for completing a task or solving a problem. For example, a recipe is an algorithm. A good algorithm has an order, uses information it can access, and should produce a useful result.\n\nBefore coding, describe the problem, split it into smaller steps, test the steps with an example, and improve anything confusing. This process is called decomposition and it makes difficult problems manageable."],
      ["Data and Information", "Data is a collection of facts, such as numbers, words, temperatures, or survey answers. Information is data that has been organized so it can help us understand something or make a decision. A table, chart, or graph can reveal patterns.\n\nAsk where data came from and whether it is complete and fair. Never collect private information from someone without a good reason and permission."],
      ["Digital Safety and Responsible Technology", "Protect accounts with long, unique passwords and never share a password or verification code. Check links before opening them, update devices, and tell a trusted adult if a message makes you feel unsafe.\n\nBe respectful online. Ask before sharing another person’s photo or information, credit creators, and pause before posting. Technology should increase people’s choices and safety, not harm or exclude them."],
      ["Designing a Solution", "Computer scientists design solutions for real people. Start by listening to a need, then write a simple problem statement. Sketch an idea, build a small prototype, test it with users, and improve it from their feedback.\n\nProject idea: design an offline study planner for learners with limited internet access. Decide what information it needs, draw the screens, list three features, and explain how it could help a learner stay in school."],
      ["Computing and Your Future", "Computing careers include software development, cybersecurity, data science, network support, robotics, design, research, teaching, and technology entrepreneurship. You do not need to know your future career today. Every small project builds confidence and evidence of what you can do.\n\nGirls belong in every technology space. Learn with others, ask questions, and make room for other voices. Your local knowledge can lead to technology that solves local problems." ]
    ]
  },
  {
    subject: "Programming",
    lessons: [
      ["Programming and Instructions", "Programming means writing precise instructions for a computer. Computers do not guess what we mean, so programmers break a goal into small steps. A program can take input, process it, and produce output.\n\nA useful first habit is to write pseudocode before real code. Pseudocode uses ordinary language, for example: Ask for the learner’s name; save the answer; display a welcome message."],
      ["Values, Variables, and Types", "A value is a piece of data. Common types are text, called a string; whole numbers, called integers; decimal numbers, called floats; and true-or-false values, called booleans. A variable gives a value a name so the program can use it later.\n\nExample in Python:\nname = \"Lina\"\nage = 14\nready = True\n\nChoose variable names that explain what they store."],
      ["Decisions with Conditions", "Programs make decisions using conditions. A condition can be true or false. Comparison operators include == for equal, != for not equal, > for greater than, and < for less than.\n\nExample in Python:\nage = 14\nif age >= 13:\n    print(\"You can join the club\")\nelse:\n    print(\"Ask a teacher for help\")\n\nTest both possible paths so your program behaves fairly."],
      ["Repeating Work with Loops", "A loop repeats instructions. Use a for loop when you know what collection or range you want to repeat over. Use a while loop when repetition should continue while a condition is true.\n\nExample in Python:\nfor number in range(1, 4):\n    print(number)\n\nAlways check that a while loop can eventually stop. A loop that never stops is called an infinite loop."],
      ["Functions and Reuse", "A function is a named block of instructions that performs one job. Functions make programs easier to read, test, and reuse. A function can receive inputs called parameters and can send back a result with return.\n\nExample in Python:\ndef greet(name):\n    return \"Hello, \" + name\n\nmessage = greet(\"Asha\")\nprint(message)\n\nKeep each function focused on one clear task."],
      ["Lists and Collections", "A list stores several values in one place. In Python, the first position has index 0. You can add, remove, or loop through list items.\n\nExample in Python:\nsubjects = [\"science\", \"coding\", \"math\"]\nfor subject in subjects:\n    print(subject)\n\nUse a collection when the program needs to work with many related values."],
      ["Debugging and Testing", "A bug is a mistake that causes a program to behave unexpectedly. Read error messages carefully, check one small part at a time, and use print statements to inspect values. Testing means trying normal, unusual, and empty inputs.\n\nA good test asks: What should happen? What actually happened? What is the smallest change that could explain the difference? Mistakes are information that helps you improve your program."],
      ["Programming Project: Study Helper", "Build a small study helper in Python. Ask for a learner’s name, ask how many minutes they want to study, and suggest a break when the time is 25 minutes or more. Store three subjects in a list and print them using a loop.\n\nPlan first, then code one feature at a time. Test with different names, zero minutes, and a large number. Finally, explain how the program could work offline on a shared school computer."],
      ["Programming Ethics and Impact", "A program can affect real people, so programmers must think about fairness, privacy, accessibility, and safety. Do not use someone’s data without permission. Avoid assumptions that leave out people with different languages, abilities, devices, or internet access.\n\nBefore sharing a project, ask who benefits, who might be harmed, and how you could make the design more inclusive." ]
    ]
  },
  {
    subject: "Web Development",
    lessons: [
      ["How Websites Work", "A website is made of files that a browser reads and displays. HTML describes the content, CSS controls its appearance, and JavaScript adds behavior. A browser sends a request to a server and receives files in response.\n\nWebsites can teach, inform, connect, and provide services. A good website is clear, fast enough for available devices, and useful even when the connection is limited."],
      ["HTML: Structure and Meaning", "HTML uses elements to describe a page. Headings organize ideas, paragraphs contain text, links connect pages, and lists group related items. Use headings in order and choose elements for their meaning, not only their appearance.\n\nExample:\n<h1>My Science Notes</h1>\n<p>Water changes state when temperature changes.</p>\n<a href=\"notes.html\">Read more notes</a>\n\nMeaningful HTML helps screen readers and makes pages easier to maintain."],
      ["HTML Forms and Useful Content", "Forms let visitors send information. A label should clearly describe each input, and required fields should be used only when the information is truly necessary. Never ask young learners to submit private details unless there is a clear safety reason.\n\nPlan your page content before adding decoration: Who is it for? What should they learn or do? What is the simplest path to that goal?"],
      ["CSS: Style and Layout", "CSS changes colors, fonts, spacing, borders, and layout. A selector chooses an HTML element, and a property sets a style.\n\nExample:\n.card {\n    padding: 16px;\n    background: lightyellow;\n}\n\nUse consistent spacing and strong contrast. Keep text readable on small screens and avoid using color alone to communicate important information."],
      ["Responsive Web Design", "Responsive design helps a page work on phones, tablets, and computers. Use flexible widths, readable text, and media queries when a layout needs to change at a smaller size. Test by resizing the browser and by using the page with a keyboard.\n\nLearners in remote areas may use older phones or slow connections, so reduce unnecessary images and keep the most important content easy to reach."],
      ["JavaScript and Interaction", "JavaScript can respond to events such as a button click. It can read an input, calculate a result, change page text, and show helpful feedback.\n\nExample:\nconst button = document.querySelector(\"#checkButton\");\nbutton.addEventListener(\"click\", () => {\n    document.querySelector(\"#message\").textContent = \"Great work!\";\n});\n\nGive buttons clear names and make sure the page still makes sense after an action."],
      ["Accessibility and Inclusive Design", "Accessibility means making websites usable by people with different abilities, devices, and ways of learning. Use alt text for meaningful images, labels for forms, keyboard-friendly controls, clear headings, and good color contrast.\n\nAsk someone to try your page without a mouse or with the sound turned off. Their experience can reveal improvements you would not notice alone."],
      ["Web Project: Local Learning Page", "Create a one-page offline resource about a local science topic, such as clean water, soil, weather, or health. Include a heading, three facts, one image with alt text, a short activity, and a quiz question.\n\nUse HTML for structure, CSS for readability, and JavaScript to check the answer. Test it on a phone-sized screen and make sure it still works without an internet connection."],
      ["Online Safety for Web Creators", "Web creators should protect visitors. Do not publish private names, locations, passwords, or photos without permission. Be careful with links and outside scripts, and explain how a form uses information.\n\nA trustworthy website tells the truth, corrects mistakes, respects visitors, and does not pressure people into sharing more than they need to." ]
    ]
  },
  {
    subject: "Python",
    lessons: [
      ["Meet Python", "Python is a programming language used for automation, science, websites, data, games, and artificial intelligence. Its readable syntax makes it a friendly first language. A Python program is a text file that the Python interpreter runs.\n\nYou can practise in a school computer editor, an offline Python installation, or a trusted browser editor when internet access is available."],
      ["Print and Comments", "The print function displays a result. Comments begin with # and explain code to a human reader; Python ignores them when it runs.\n\nExample:\n# Welcome the learner\nprint(\"Welcome to StaTech!\")\n\nRun a tiny program often. Seeing one correct result at a time makes it easier to find mistakes."],
      ["Variables and Input", "Use a variable to remember information. input() reads text typed by a user. Because input returns text, convert numbers with int() or float() before doing mathematics.\n\nExample:\nage_text = input(\"How old are you? \")\nage = int(age_text)\nprint(age + 1)\n\nTell users what kind of answer you expect and handle unexpected answers kindly."],
      ["Math and Useful Operators", "Python uses +, -, *, and / for arithmetic. The // operator gives whole-number division, % gives a remainder, and ** raises a number to a power. Use parentheses to make the order clear.\n\nExample:\nminutes = 90\nhours = minutes // 60\nremaining = minutes % 60\nprint(hours, remaining)\n\nTry calculations connected to everyday life, such as budgeting, time, or measuring water."],
      ["If, Elif, and Else", "Use if to choose an action when a condition is true. Use elif for another condition and else for every other case. Indentation shows which instructions belong inside a decision.\n\nExample:\nscore = 8\nif score >= 8:\n    print(\"Excellent\")\nelif score >= 5:\n    print(\"Keep practising\")\nelse:\n    print(\"Let us review together\")"],
      ["For Loops and While Loops", "A for loop visits each item in a sequence or each number in a range. A while loop repeats as long as its condition stays true. Change the values and run examples to predict the output before checking it.\n\nExample:\nfor lesson_number in range(1, 4):\n    print(\"Lesson\", lesson_number)\n\nA loop should have a clear purpose and, for while loops, a reliable stopping condition."],
      ["Lists and Dictionaries", "Lists keep items in order. Dictionaries connect keys to values, which is useful for describing something.\n\nExample:\nlearner = {\n    \"name\": \"Mina\",\n    \"subject\": \"science\"\n}\nprint(learner[\"name\"])\n\nChoose a list for a collection and a dictionary when each value has a meaningful label."],
      ["Functions and Modules", "Functions package a repeated task. A module is a file or library containing useful code written by you or others. Python includes modules for dates, mathematics, random choices, and more.\n\nExample:\ndef add_points(current, extra):\n    return current + extra\n\npoints = add_points(4, 3)\nprint(points)\n\nRead documentation and understand code before using it in your own project."],
      ["Python Project: Community Calculator", "Create a calculator that asks how many learners are in a group and how many notebooks each learner needs. Calculate the total notebooks. Add a decision that gives a message when the group has more than 20 learners.\n\nThen improve it: validate that the input is a number, put the calculation in a function, and show a clear result. Explain one way this tool could help a local school plan supplies." ]
    ]
  }
];

const lessons = courses.flatMap((course) => course.lessons.map(([title, content], index) => ({
  title,
  subject: course.subject,
  grade: 7 + Math.floor(index / 3),
  content: expandLesson(course.subject, title, content, index + 1),
  quizQuestions: createQuiz(course.subject, title),
  order: index + 1
})));

async function seedCourseData(options = {}) {
  const { skipDb = false } = options;

  if (skipDb) {
    return lessons;
  }

  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI is not set. Skipping database seed.");
      return lessons;
    }

    await mongoose.connect(process.env.MONGODB_URI);
    await Lesson.deleteMany({ subject: { $in: courses.map((course) => course.subject) } });
    await Lesson.insertMany(lessons);
    console.log(`Inserted ${lessons.length} lessons across ${courses.length} subjects.`);
    await mongoose.disconnect();
    return lessons;
  } catch (error) {
    console.error("Failed to seed course data:", error);
    throw error;
  }
}

if (require.main === module) {
  seedCourseData({ skipDb: !process.env.MONGODB_URI }).catch((error) => {
    process.exitCode = 1;
  });
}

module.exports = { courses, lessons, seedCourseData };
