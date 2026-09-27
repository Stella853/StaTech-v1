require("dotenv").config();

const mongoose = require("mongoose");
const Lesson = require("./models/Lesson1");

const pythonCourse = {
  title: "Python Basics",
  grade: 5,
  description: "An introduction to Python for Grade 5 learners, covering basic concepts like printing, variables, numbers, input, decisions, loops, and lists.",
  lessons: [
    {
      title: "Introduction to Python",
      content: "Python is a programming language used to give instructions to a computer. It is simple, easy to read, and popular all over the world. Python is used to build websites, games, apps, robots, and many other technologies. When you write Python code, the computer follows your instructions step by step.\n\nPython uses clear English-like words, which makes it a good language for beginners. Many schools and universities teach Python because it helps learners understand how computers think."
    },
    {
      title: "Where to Write Python Code",
      content: "To use Python, learners need a place to type their code. These places are called editors or IDEs.\n\nIDLE: IDLE comes with Python automatically. When Python is installed, IDLE is included. It has a window to type code and a window to see results.\n\nOnline editors: Learners can also write Python code online without installing anything, such as Replit, Trinket, or Google Colab.\n\nCode editors: More advanced editors like Visual Studio Code and PyCharm are used by professional programmers. All Python code works the same in every editor."
    },
    {
      title: "Printing Text",
      content: "Python can show messages on the screen using the print() function. Anything written inside the brackets will appear when the program runs.\n\nExample:\n```python\nprint(\"Hello, world!\")\n```"
    },
    {
      title: "Variables",
      content: "A variable is a name that stores information. It can store words, numbers, or other data. Once a variable has a value, we can use it later in the program.\n\nExample:\n```python\nname = \"Amina\"\nprint(name)\n```"
    },
    {
      title: "Numbers",
      content: "Python can work with numbers. You can add, subtract, multiply, or divide them. Numbers can also be stored in variables.\n\nExample:\n```python\na = 5\nb = 3\nprint(a + b)\n```"
    },
    {
      title: "Basic Math",
      content: "Python uses symbols to do math: + for addition, - for subtraction, * for multiplication, and / for division.\n\nExample:\n```python\nprint(10 - 4)\nprint(6 * 2)\nprint(12 / 3)\n```"
    },
    {
      title: "User Input",
      content: "Python can ask the user to type something using input(). The answer is stored in a variable and can be used in the program.\n\nExample:\n```python\ncolor = input(\"What is your favorite color? \")\nprint(\"You like \" + color)\n```"
    },
    {
      title: "If Statements",
      content: "An if statement checks a condition. If the condition is true, Python runs the code inside the block.\n\nExample:\n```python\nage = 10\nif age == 10:\n    print(\"You are in Grade 5!\")\n```"
    },
    {
      title: "Loops",
      content: "A loop repeats actions. A for loop repeats code a certain number of times.\n\nExample:\n```python\nfor i in range(3):\n    print(\"Hello\")\n```"
    },
    {
      title: "Lists",
      content: "A list stores many items. Each item has a position starting from 0. You can access items using their position number.\n\nExample:\n```python\nfruits = [\"apple\", \"banana\", \"orange\"]\nprint(fruits[0])\n```"
    },
    {
      title: "Mini Project",
      content: "This project uses everything learned so far.\n\nExample:\n```python\nname = input(\"Name: \")\nage = input(\"Age: \")\n\nprint(\"Hello \" + name)\nprint(\"You are \" + age + \" years old\")\n\nfor i in range(3):\n    print(name)\n```"
    }
  ],
  quiz: [
    {
      question: "What is Python?",
      options: ["A fruit", "A programming language", "A game", "A robot"],
      answer: "A programming language"
    },
    {
      question: "What does print() do?",
      options: ["Shows text", "Hides text", "Deletes text", "Makes sound"],
      answer: "Shows text"
    },
    {
      question: "What is a variable?",
      options: ["A place to store information", "A type of computer", "A number", "A color"],
      answer: "A place to store information"
    },
    {
      question: "Which symbol is used for multiplication?",
      options: ["+", "-", "*", "/"],
      answer: "*"
    },
    {
      question: "What does input() do?",
      options: ["Prints text", "Asks the user for information", "Creates a list", "Makes Python stop"],
      answer: "Asks the user for information"
    }
  ]
};

const lessons = pythonCourse.lessons.map((lesson, index) => ({
  title: lesson.title,
  subject: "Python",
  grade: pythonCourse.grade,
  content: lesson.content,
  order: index + 1
}));

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Lesson.deleteMany({ subject: "Python" });
    await Lesson.insertMany(lessons);

    console.log(`Inserted ${lessons.length} Python lesson records.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed Python course data:", error);
    process.exit(1);
  }
})();
