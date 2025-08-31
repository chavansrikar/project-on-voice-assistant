document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded event fired."); // Debugging log
    setTimeout(() => {
        console.log("Calling speak function to introduce Omnix."); // Debugging log
        speak("Hello, I am Omnix, your virtual assistant created by team omnix. How can I assist you today?");
    }, 1000); // Introduces itself 1 second after page loads
});

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        // Toggle active class
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
});

function speak(text) {
    console.log(`speak function called with text: ${text}`); // Debugging log
    let speech = new SpeechSynthesisUtterance();
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;
    speech.lang = "en-US"; // Ensure it speaks in English
    window.speechSynthesis.speak(speech);
}

let btn = document.querySelector("#btn");
let Content = document.querySelector("#content");
let listeningText = document.querySelector("#listening");

let speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = new speechRecognition();

recognition.onstart = () => {
    listeningText.style.display = "block"; // Show "Listening..."
    btn.style.display = "none"; // Hide the button
};

recognition.onresult = (event) => {
    let currentIndex = event.resultIndex;
    let transcript = event.results[currentIndex][0].transcript.toLowerCase().trim();
    
    listeningText.style.display = "none"; // Hide "Listening..." text
    btn.style.display = "flex"; // Show the button back
    
    // **Update Button Text to Display the Spoken Message**
    btn.innerText = transcript;  

    takeCommand(transcript);
};

// Start recognition on button click
btn.addEventListener("click", () => {
    recognition.start();
});

function getBatteryStatus() {
    navigator.getBattery().then(function (battery) {
        let level = Math.round(battery.level * 100);
        speak(`Your battery is at ${level} percent.`);
    });
}

function getCurrentTime() {
    let now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert to 12-hour format
    speak(`The time is ${hours} ${minutes} ${period}`);
}
function setReminder(message) {
    let reminderText = message.replace("set reminder", "").trim();
    let reminderTime = prompt("At what time? (HH:MM in 24-hour format)");
    
    if (reminderTime) {
        let [hours, minutes] = reminderTime.split(":").map(Number);
        let now = new Date();
        let reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        let timeDifference = reminderDate - now;
        
        if (timeDifference > 0) {
            localStorage.setItem("reminder", reminderText);
            speak(`Reminder set for ${reminderTime}. I will notify you.`);
            
            setTimeout(() => {
                speak(`Reminder: ${reminderText}`);
                alert(`Reminder: ${reminderText}`);
            }, timeDifference);
        } else {
            speak("The time you entered has already passed.");
        }
    }
}

function setAlarm(message) {
    let alarmTime = prompt("At what time do you want to set the alarm? (HH:MM in 24-hour format)");
    
    if (alarmTime) {
        let [hours, minutes] = alarmTime.split(":").map(Number);
        let now = new Date();
        
        let alarmDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
        
        // Create audio element
        const alarmSound = new Audio('alarm.mp3'); // Make sure to add your audio file
        alarmSound.loop = true;
        
        let checkAlarm = setInterval(() => {
            let currentTime = new Date();
            if (currentTime.getHours() === hours && currentTime.getMinutes() === minutes) {
                speak("Alarm ringing! Wake up!");
                alarmSound.play();
                
                // Add stop button to page
                const stopButton = document.createElement('button');
                stopButton.innerText = 'Stop Alarm';
                stopButton.className = 'stop-alarm-btn';
                document.body.appendChild(stopButton);
                
                stopButton.onclick = () => {
                    alarmSound.pause();
                    alarmSound.currentTime = 0;
                    stopButton.remove();
                    clearInterval(checkAlarm);
                };
                
                // Auto-stop after 1 minute if not stopped manually
                setTimeout(() => {
                    if (alarmSound.playing) {
                        alarmSound.pause();
                        alarmSound.currentTime = 0;
                        stopButton.remove();
                    }
                }, 60000);
            }
        }, 1000); // Check every second
        
        speak(`Alarm set for ${alarmTime}`);
    }
}

// Add CSS for stop button
const style = document.createElement('style');
style.textContent = `
    .stop-alarm-btn {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 15px 30px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 5px;
        font-size: 18px;
        cursor: pointer;
        z-index: 1000;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    .stop-alarm-btn:hover {
        background: #ff0000;
    }
`;
document.head.appendChild(style);

async function fetchNewsWithSummary() {
    const apiKey="a71a9950d1604334bf38a82b837dfbd9"; // Replace with your API key
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.articles.length > 0) {
            speak("Here are the latest news updates.");
            
            for (let i = 0; i < 3; i++) {
                let article = data.articles[i];
                let summary = article.description || "No summary available.";
                
                speak(`News ${i + 1}: ${article.title}. Summary: ${summary}`);
            }
        } else {
            speak("I couldn't find any latest news.");
        }

    } catch (error) {
        speak("Sorry, I couldn't fetch the news at the moment.");
        console.error(error);
    }
}
async function fetchNewsByCategory(category) {
    const apiKey = "950d1604334bf38a82b837dfbd9";
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.articles.length > 0) {
            speak(`Here are the latest ${category} news.`);
            
            for (let i = 0; i < 3; i++) {
                let article = data.articles[i];
                speak(`News ${i + 1}: ${article.title}`);
            }
        } else {
            speak(`I couldn't find any latest ${category} news.`);
        }

    } catch (error) {
        speak("Sorry, I couldn't fetch the news at the moment.");
        console.error(error);
    }
}

async function fetchTrendingTopics() {
    const url = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;

    try {
        let response = await fetch(proxy);
        let data = await response.json();

        let parser = new DOMParser();
        let xmlDoc = parser.parseFromString(data.contents, "text/xml");

        let items = xmlDoc.getElementsByTagName("title");
        let trends = [];

        for (let i = 1; i < 6; i++) { // Skip first title as it's general info
            trends.push(items[i].textContent);
        }

        speak("Here are the top trending topics today.");
        trends.forEach((trend, index) => {
            speak(`Trending topic ${index + 1}: ${trend}`);
        });

    } catch (error) {
        speak("Sorry, I couldn't fetch trending topics right now.");
        console.error(error);
    }
}

async function analyzeSentiment(text) {
    const apiUrl = "https://api.textanalysis.com/sentiment"; // Use a real API
    const apiKey="a71a9950d1604334bf38a82b837dfbd9";

    try {
        let response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, apiKey })
        });

        let data = await response.json();
        let sentiment = data.sentiment;

        if (sentiment === "positive") {
            speak("This news sounds positive!");
        } else if (sentiment === "negative") {
            speak("This news sounds negative.");
        } else {
            speak("This news is neutral.");
        }

    } catch (error) {
        speak("I couldn't analyze the sentiment of this news.");
        console.error(error);
    }
}

// Modify news function:
async function fetchNewsWithSentiment() {
    const apiKey="a71a9950d1604334bf38a82b837dfbd9";
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

    try {
        let response = await fetch(url);
        let data = await response.json();

        if (data.articles.length > 0) {
            speak("Here are the latest news updates with sentiment analysis.");
            
            for (let i = 0; i < 3; i++) {
                let article = data.articles[i];
                let title = article.title;
                
                speak(`News ${i + 1}: ${title}`);
                await analyzeSentiment(title);
            }
        } else {
            speak("I couldn't find any latest news.");
        }

    } catch (error) {
        speak("Sorry, I couldn't fetch the news at the moment.");
        console.error(error);
    }
}
(function(){
    emailjs.init("WwTXXNNkDWaDhKnGC"); // Replace with your EmailJS user ID
})();
function sendEmail() {
    let templateParams = {
        to_name: "Recipient Name",
        from_name: "Omnix Voice Assistant",
        message: "Hello, this is a test email from Omnix Assistant!"
    };

    emailjs.send("service_2n1xghs", "template_h88f9pe", templateParams)
    .then((response) => {
        console.log("Email sent successfully!", response);
        speak("Email has been sent successfully.");
    }, (error) => {
        console.log("Failed to send email.", error);
        speak("I couldn't send the email. Please try again.");
    });
}

// Call sendEmail() when a voice command is detected
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "chavansrikar@gamil.com",
        pass: "srikar@123" // Use App Passwords for security
    }
});

app.post("/send-email", (req, res) => {
    let mailOptions = {
        from: "chavansrikar@gmail.com",
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send("Error sending email.");
        } else {
            console.log("Email sent: " + info.response);
            res.status(200).send("Email sent successfully!");
        }
    });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

function sendEmail() {
    fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            to: "recipient@example.com",
            subject: "Hello from Omnix",
            message: "This is a test email sent by Omnix Assistant!"
        })
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
        speak("Email sent successfully!");
    })
    .catch(error => {
        console.error(error);
        speak("I couldn't send the email. Please check the server.");
    });
}

// **Speech Recognition Setup**

function getCurrentDay() {
    const days = [
        "Sunday", "Monday", "Tuesday", "Wednesday", 
        "Thursday", "Friday", "Saturday"
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    
    return {
        dayName: dayName,
        fullDate: `${dayName}, ${date} ${month} ${year}`
    };
}

function takeCommand(message) {
    if (message.includes("hello") || message.includes("hey")) {
        speak("Hello, how can I assist you today?");
    } else if (message.includes("who are you")) {
        speak("I am Omnix, your virtual assistant created by team omnix. I can help you with various tasks.");
    } else if (message.includes("how are you")) {
        speak("I'm doing great, thank you for asking! How can I assist you?");
    }
 else if (message.includes("what can you do")) {
            speak("I  can help you with reminders, alarms, battery status, and general queries, open websites, search for information, provide news updates, assist with tech queries, set alarms, and much more. Just ask!");
        } else if (message.includes("open youtube")) {
            speak("Opening YouTube...");
            setTimeout(() => {
                window.open("https://youtube.com", "_blank");
            }, 1000);
        } 
        else if (message.includes("search youtube for")) {
            let query = message.replace("search youtube for", "").trim();
            speak(`Searching YouTube for ${query}...`);
            setTimeout(() => {
                window.open(`https://www.youtube.com/results?search_query=${query}`, "_blank");
            }, 1000);
        }
        else if (message.includes("send a e-mail to")) {
           let words = message.split(" ");
            let recipient = words[words.indexOf("to") + 1] + "@gmail.com"; // Extract email ID (simplified logic)
           let subject = "Voice Command Email";
            let emailMessage = "This is a test email sent by Omnix Assistant.";
            
           speak(`Sending email to ${recipient}`);
           sendEmail(recipient, subject, emailMessage);
        }
        else if (message.includes("what is the time")) {
            let currentTime = new Date().toLocaleTimeString();
            speak(`The current time is ${currentTime}`);
        } 
        else if (message.includes("what is the date")) {
            let currentDate = new Date().toLocaleDateString();
            speak(`Today's date is ${currentDate}`);
        } 
        else if (message.includes("open google")) {
            speak("Opening Google...");
            setTimeout(() => {
                window.open("https://google.com", "_blank");
            }, 1000);
        } 
        else if (message.includes("search google for")) {
            let query = message.replace("search google for", "").trim();
            speak(`Searching Google for ${query}...`);
            setTimeout(() => {
                window.open(`https://www.google.com/search?q=${query}`, "_blank");
            }, 1000);
        } 
        else if (message.includes("tell me a joke")) {
            speak("Why don't scientists trust atoms? Because they make up everything!");
        } 
        else if (message.includes("inspire me")) {
            speak("The only way to do great work is to love what you do. - Steve Jobs");
        } 
        else if (message.includes("open cnn")) {
            speak("Opening CNN...");
            setTimeout(() => {
                window.open("https://cnn.com", "_blank");
            }, 1000);
        } 
        else if (message.includes("what is the weather")) {
            speak("Opening weather.com...");
            setTimeout(() => {
                window.open("https://weather.com", "_blank");
            }, 1000);
        }
        else if (message.includes("weather in")) {
            speak("Opening weather.com...");
            setTimeout(() => {
                window.open("https://weather.com", "_blank");
            }, 1000);
        }
        else if (message.includes("temperature")) {
            speak("Opening weather.com...");
            setTimeout(() => {
                window.open("https://weather.com", "_blank");
            }, 1000);
        }
        else if (message.includes("top animes") || message.includes("anime")) {
            speak("Fetching the list of top animes...");
            setTimeout(() => {
                window.open("https://www.imdb.com/search/title/?genres=animation", "_blank");
            }, 1000);
        } 
        else if (message.includes("who created you")) {
            speak("I was created by team omnix, a tech enthusiast and developer.");
        } 
        else if (message.includes("who is the founder of cosmos")) {
            speak("The founder of Cosmoss is the one and only, Siddu.");
        } 
        else if (message.includes("search news for")) {
            let query = message.replace("search news for", "").trim();
            speak(`Searching news for ${query}...`);
            setTimeout(() => {
                window.open(`https://www.google.com/search?q=${query}+news`, "_blank");
            }, 1000);
        } 
        else if (message.includes("search tech for")) {
            let query = message.replace("search tech for", "").trim();
            speak(`Searching tech news for ${query}...`);
            setTimeout(() => {
                window.open(`https://www.google.com/search?q=${query}+tech`, "_blank");
            }, 1000);
        } 
        else if (message.includes("open facebook")) {
            speak("Opening Facebook...");
            setTimeout(() => {
                window.open("https://facebook.com", "_blank");
            }, 1000);
        } 
        else if (message.includes("open twitter")) {
            speak("Opening Twitter...");
            setTimeout(() => {
                window.open("https://twitter.com", "_blank");
            }, 1000);
        }
        
    
    else if (message.includes("best anime to watch")) {
        speak("Some of the best anime to watch are Attack on Titan, One Piece, Jujutsu Kaisen, Demon Slayer, and Fullmetal Alchemist Brotherhood.");
    }
    else if (message.includes("best romance anime")) {
        speak("Some of the best romance anime are Clannad, Your Lie in April, Toradora, Kimi no Na wa, and Horimiya.");
    }
    else if (message.includes("best action anime")) {
        speak("Top action anime include One Piece, Attack on Titan, Jujutsu Kaisen, Hunter x Hunter, and My Hero Academia.");
    }
    else if (message.includes("anime websites")) {
        speak("Popular anime streaming websites are Crunchyroll, Funimation, 9Anime, Gogoanime, and Netflix. Do you want me to open one?");
    }
    else if (message.match(/\b(who\s+is\s+naruto|what\s+is\s+naruto|how\s+is\s+naruto|tell\s+me\s+about\s+naruto|explain\s+naruto|describe\s+naruto)\b/i)) {
        speak("Naruto is a legendary anime following Naruto Uzumaki, a young ninja seeking recognition and aiming to become Hokage. Would you like to know about the Akatsuki, Jutsu, or Naruto's friends?");
    }
    
    else if (message.match(/\b(who\s+is\s+sasuke|what\s+is\s+sasuke|how\s+is\s+sasuke|tell\s+me\s+about\s+sasuke|explain\s+sasuke|describe\s+sasuke)\b/i)) {
        speak("Sasuke Uchiha is one of the last surviving members of the Uchiha clan. He seeks revenge against his brother, Itachi, and later becomes Naruto's rival. Do you want to hear about his Sharingan abilities?");
    }
    
    else if (message.match(/\b(who\s+is\s+one\s+piece|what\s+is\s+one\s+piece|how\s+is\s+one\s+piece|tell\s+me\s+about\s+one\s+piece|explain\s+one\s+piece|describe\s+one\s+piece)\b/i)) {
        speak("One Piece follows Monkey D. Luffy and his crew in search of the legendary One Piece treasure. Would you like to know about Luffy's Devil Fruit or the Yonko?");
    }
    
    else if (message.match(/\b(who\s+is\s+eren|what\s+is\s+eren|how\s+is\s+eren|tell\s+me\s+about\s+eren|explain\s+eren|describe\s+eren)\b/i)) {
        speak("Attack on Titan is about Eren Yeager and his fight against the Titans threatening humanity. Do you want to know about the Titans or the Survey Corps?");
    }
    
    else if (message.match(/\b(who\s+is\s+light\s+yagami|what\s+is\s+death\s+note|how\s+is\s+death\s+note|tell\s+me\s+about\s+death\s+note|explain\s+death\s+note|describe\s+death\s+note)\b/i)) {
        speak("Death Note follows Light Yagami, who finds a notebook that lets him kill anyone by writing their name in it. Do you want to know about the Shinigami, L, or Kira?");
    }
    
    else if (message.match(/\b(who\s+is\s+tanjiro|what\s+is\s+tanjiro|how\s+is\s+tanjiro|tell\s+me\s+about\s+tanjiro|explain\s+tanjiro|describe\s+tanjiro)\b/i)) {
        speak("Demon Slayer follows Tanjiro Kamado, a young swordsman fighting demons to avenge his family. Would you like to know about the Hashira or the breathing techniques?");
    }
    
    else if (message.match(/\b(who\s+is\s+yuji|what\s+is\s+jujutsu\s+kaisen|how\s+is\s+jujutsu\s+kaisen|tell\s+me\s+about\s+jujutsu\s+kaisen|explain\s+jujutsu\s+kaisen|describe\s+jujutsu\s+kaisen)\b/i)) {
        speak("Jujutsu Kaisen follows Yuji Itadori as he joins the Tokyo Jujutsu High to battle cursed spirits. Want to learn about Gojo Satoru, Sukuna, or the Jujutsu techniques?");
    }
    
    else if (message.match(/\b(who\s+is\s+edward|what\s+is\s+fullmetal\s+alchemist|how\s+is\s+fullmetal\s+alchemist|tell\s+me\s+about\s+fullmetal\s+alchemist|explain\s+fullmetal\s+alchemist|describe\s+fullmetal\s+alchemist)\b/i)) {
        speak("Fullmetal Alchemist Brotherhood follows the Elric brothers, who use alchemy to restore their bodies after a failed experiment. Want to hear about the Philosopher's Stone or the Homunculi?");
    }
    
    else if (message.match(/\b(who\s+is\s+kaneki|what\s+is\s+tokyo\s+ghoul|how\s+is\s+tokyo\s+ghoul|tell\s+me\s+about\s+tokyo\s+ghoul|explain\s+tokyo\s+ghoul|describe\s+tokyo\s+ghoul)\b/i)) {
        speak("Tokyo Ghoul follows Kaneki, a human who turns into a half-ghoul after a fateful encounter. Do you want to learn about the Ghoul organizations or Kaneki's transformation?");
    }
    
    else if (message.match(/\b(who\s+is\s+asta|what\s+is\s+black\s+clover|how\s+is\s+black\s+clover|tell\s+me\s+about\s+black\s+clover|explain\s+black\s+clover|describe\s+black\s+clover)\b/i)) {
        speak("Black Clover follows Asta, a boy born without magic in a world where magic is everything. Want to know about the Magic Knights or Asta's anti-magic swords?");
    }
    
    else if (message.match(/\b(who\s+is\s+izuku|what\s+is\s+my\s+hero\s+academia|how\s+is\s+my\s+hero\s+academia|tell\s+me\s+about\s+my\s+hero\s+academia|explain\s+my\s+hero\s+academia|describe\s+my\s+hero\s+academia)\b/i)) {
        speak("My Hero Academia follows Izuku Midoriya, a boy without superpowers who gets the chance to become a hero. Want to know about One for All, All Might, or the Pro Heroes?");
    }
    
    else if (message.match(/\b(who\s+is\s+senku|what\s+is\s+dr\s+stone|how\s+is\s+dr\s+stone|tell\s+me\s+about\s+dr\s+stone|explain\s+dr\s+stone|describe\s+dr\s+stone)\b/i)) {
        speak("Dr. Stone is about Senku, a genius who wakes up in a world where humanity has turned to stone and tries to rebuild civilization using science. Want to hear about his greatest inventions?");
    }
    
    else if (message.match(/\b(who\s+is\s+subaru|what\s+is\s+re\s+zero|how\s+is\s+re\s+zero|tell\s+me\s+about\s+re\s+zero|explain\s+re\s+zero|describe\s+re\s+zero)\b/i)) {
        speak("Re:Zero follows Subaru Natsuki, a guy who keeps dying and restarting from a fixed point in time. Want to learn about the witches, Emilia, or his Return by Death ability?");
    }
    
    else if (message.match(/\b(who\s+is\s+cid|what\s+is\s+eminence\s+in\s+shadow|how\s+is\s+eminence\s+in\s+shadow|tell\s+me\s+about\s+eminence\s+in\s+shadow|explain\s+eminence\s+in\s+shadow|describe\s+eminence\s+in\s+shadow)\b/i)) {
        speak("The Eminence in Shadow follows Cid Kagenou, who pretends to be a side character while secretly leading an underground organization. Do you want to know about Shadow Garden?");
    }
    
    else if (message.match(/\b(who\s+is\s+violet|what\s+is\s+violet\s+evergarden|how\s+is\s+violet\s+evergarden|tell\s+me\s+about\s+violet\s+evergarden|explain\s+violet\s+evergarden|describe\s+violet\s+evergarden)\b/i)) {
        speak("Violet Evergarden is a heartwarming anime about a former soldier who becomes a letter writer to understand emotions. Want to hear about her journey?");
    }
    
    else if (message.match(/\b(who\s+is\s+haruki|what\s+is\s+i\s+want\s+to\s+eat\s+your\s+pancreas|how\s+is\s+i\s+want\s+to\s+eat\s+your\s+pancreas|tell\s+me\s+about\s+i\s+want\s+to\s+eat\s+your\s+pancreas|explain\s+i\s+want\s+to\s+eat\s+your\s+pancreas|describe\s+i\s+want\s+to\s+eat\s+your\s+pancreas)\b/i)) {
        speak("I Want to Eat Your Pancreas is a touching anime film about a high school boy who discovers a secret diary of a terminally ill girl. It's an emotional story about life and death.");
    }
    
    else if (message.match(/\b(who\s+is\s+satoru|what\s+is\s+erased|how\s+is\s+erased|tell\s+me\s+about\s+erased|explain\s+erased|describe\s+erased)\b/i)) {
        speak("Erased follows Satoru, a man who can go back in time to prevent tragedies. When his childhood friend is murdered, he goes back to save her. Want to hear about his journey?");
    }
    else if (message.includes("open crunchyroll")) {
        speak("Opening Crunchyroll...");
        setTimeout(() => {
            window.open("https://www.crunchyroll.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open funimation")) {
        speak("Opening Funimation...");
        setTimeout(() => {
            window.open("https://www.funimation.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open gogoanime")) {
        speak("Opening GoGoAnime...");
        setTimeout(() => {
            window.open("https://www.gogoanime.pe/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open 9anime")) {
        speak("Opening 9Anime...");
        setTimeout(() => {
            window.open("https://9anime.to/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open amazon")) {
        speak("Opening Amazon...");
        setTimeout(() => {
            window.open("https://www.amazon.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open flipkart")) {
        speak("Opening Flipkart...");
        setTimeout(() => {
            window.open("https://www.flipkart.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open myntra")) {
        speak("Opening Myntra...");
        setTimeout(() => {
            window.open("https://www.myntra.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open snapdeal")) {
        speak("Opening Snapdeal...");
        setTimeout(() => {
            window.open("https://www.snapdeal.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open ebay")) {
        speak("Opening eBay...");
        setTimeout(() => {
            window.open("https://www.ebay.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open ajio")) {
        speak("Opening Ajio...");
        setTimeout(() => {
            window.open("https://www.ajio.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open meesho")) {
        speak("Opening Meesho...");
        setTimeout(() => {
            window.open("https://www.meesho.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open whatsapp")) {
        speak("Opening WhatsApp...");
        setTimeout(() => {
            window.open("https://web.whatsapp.com/", "_blank");
        }, 1000);
    } 
    else if (message.includes("open instagram")) {
        speak("Opening Instagram...");
        setTimeout(() => {
            window.open("https://www.instagram.com/", "_blank");
        }, 1000);
    }
    
   
    else if (message.includes("what is your name"))
    {
        speak("my name is Omnix , i'm virtual assistant");
    }
    else if (message.includes("what is python")) {
        speak("Python is a high-level programming language known for its simplicity and readability. It is widely used in web development, AI, and data science.");
    }
    else if (message.includes("what is javascript")) {
        speak("JavaScript is a programming language used to create dynamic and interactive web pages.");
    }
    else if (message.includes("how to learn coding")) {
        speak("You can start learning coding with Python, JavaScript, or C++. Websites like W3Schools, FreeCodeCamp, and Codecademy are great for beginners.");
    }
    else if (message.includes("what is a black hole")) {
        speak("A black hole is a region in space with gravitational pull so strong that nothing, not even light, can escape from it.");
    }
    else if (message.includes("how does gravity work")) {
        speak("Gravity is the force that pulls objects toward each other. The larger the object, the stronger its gravitational pull.");
    }
    else if (message.includes("who was Albert Einstein")) {
        speak("Albert Einstein was a theoretical physicist known for developing the theory of relativity, which transformed modern physics.");
    }
    else if (message.includes("how to stay healthy")) {
        speak("To stay healthy, eat a balanced diet, exercise regularly, drink plenty of water, and get enough sleep.");
    }
    else if (message.includes("best exercises for weight loss")) {
        speak("Some of the best exercises for weight loss include running, cycling, swimming, and high-intensity interval training (HIIT).");
    }
    else if (message.includes("what is intermittent fasting")) {
        speak("Intermittent fasting is an eating pattern where you cycle between periods of eating and fasting. It can help with weight loss and metabolism.");
    }
    else if (message.includes("what is cryptocurrency")) {
        speak("Cryptocurrency is a digital currency that uses blockchain technology for secure transactions. Bitcoin and Ethereum are popular examples.");
    }
    else if (message.includes("best ways to save money")) {
        speak("To save money, create a budget, avoid unnecessary expenses, and invest in high-interest savings accounts.");
    }
    
    else if (message.includes("best places to visit in India")) {
        speak("Some of the best places to visit in India are the Taj Mahal, Jaipur, Goa, Manali, and Kerala.");
    }
    else if (message.includes("how to book cheap flights")) {
        speak("To book cheap flights, use incognito mode while searching, compare prices on multiple websites, and book in advance.");
    }
    else if (message.includes("best travel apps")) {
        speak("Some great travel apps include Google Maps, TripAdvisor, Airbnb, and Skyscanner for flight deals.");
    }
    else if (message.includes("tell me a fun fact")) {
        speak("Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.");
    }
    else if (message.includes("why is the sky blue")) {
        speak("The sky appears blue because molecules in the atmosphere scatter sunlight in all directions, with blue light being scattered the most.");
    }
    else if (message.includes("what is the fastest animal on earth")) {
        speak("The peregrine falcon is the fastest animal on Earth, reaching speeds of over 240 mph during its hunting dives.");
    }
    else if (message.includes("tell me a fun fact")) {
        speak("Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.");
    }
    else if (message.includes("why is the sky blue")) {
        speak("The sky appears blue because molecules in the atmosphere scatter sunlight in all directions, with blue light being scattered the most.");
    }
    else if (message.includes("what is the fastest animal on earth")) {
        speak("The peregrine falcon is the fastest animal on Earth, reaching speeds of over 240 mph during its hunting dives.");
    }
    else if (message.includes("set alarm")) {
        setAlarm(message);
    }
    else if (message.includes("set reminder")) {
        setReminder(message);
    }
    else if (message.includes("battery status") || message.includes("battery percentage")) {
        getBatteryStatus();
    }
    
           
 //else {
 //   speak("I couldn't understand that. Searching Google for " + message);
   // window.open(`https://www.google.com/search?q=${encodeURIComponent(message)}`, "_blank");
//}

// Trigger News Fetching
    
else if (message.includes("latest news")) {
    speak("Fetching the latest news...");
    fetchNewsWithSummary();
} 

else if (message.includes("trending topics")) {
    speak("Fetching the latest trending topics...");
    fetchTrendingTopics();
} 
else if (message.includes("analyze news sentiment")) {
    speak("Analyzing the latest news sentiment...");
    fetchNewsWithSentiment();
} 
else if (message.includes("what do you think about")) {
    let query = message.replace("what do you think about", "").trim();
    speak(`That's an interesting topic! Let me find some details about ${query}...`);
    
    setTimeout(() => {
        window.open(`https://www.google.com/search?q=${query}+news`, "_blank");
        speak(`I've opened the latest news on ${query} for you!`);
    }, 2000);
} 

else if (message.includes("explain this news")) {
    speak("Let me summarize this news for you...");
    fetchNewsWithSummary();
} 

else if (message.includes("what day is it") || message.includes("what's today") || message.includes("which day is today")) {
    const day = getCurrentDay();
    speak(`Today is ${day.fullDate}`);
}
    
else if (message.includes("what day of the week")) {
    const day = getCurrentDay();
    speak(`It's ${day.dayName}`);
}
    
else if (message.includes("tell me the date")) {
    const day = getCurrentDay();
    speak(`It's ${day.fullDate}`);
}
    
else if (message.includes("open calculator") || message.includes("launch calculator")) {
    speak("Opening calculator...");
    openCalculator();
}
    
else if (message.includes("calculate bmi")) {
    speak("Let me help you calculate your BMI.");
    const weight = parseFloat(prompt("Please enter your weight in kilograms:"));
    const height = parseFloat(prompt("Please enter your height in meters:"));
    
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
        const result = calculateBMI(weight, height);
        speak(`Your BMI is ${result.bmi}, which falls in the ${result.category} category.`);
    } else {
        speak("I couldn't calculate your BMI. Please make sure to enter valid numbers.");
    }
}

else if (message.includes("track water") || message.includes("water intake")) {
    const glasses = parseInt(prompt("How many glasses of water have you had today?"));
    if (!isNaN(glasses)) {
        const advice = checkWaterIntake(glasses);
        speak(advice);
    } else {
        speak("Please enter a valid number of glasses.");
    }
}

else if (message.includes("health tip") || message.includes("wellness tip")) {
    const tip = getHealthTip();
    speak(tip);
}

else if (message.includes("start health check")) {
    speak("Starting your daily health check. Let's go through some basic questions.");
    
    setTimeout(() => {
        speak("How many hours did you sleep last night?");
        const sleepHours = parseInt(prompt("Enter hours of sleep:"));
        
        if (sleepHours < 7) {
            speak("You might need more sleep. Aim for 7-9 hours per night.");
        } else if (sleepHours > 9) {
            speak("You got plenty of sleep. Make sure to stay active during the day.");
        } else {
            speak("That's a healthy amount of sleep!");
        }
        
        setTimeout(() => {
            speak("Let's check your water intake.");
            const waterGlasses = parseInt(prompt("How many glasses of water today?"));
            speak(checkWaterIntake(waterGlasses));
            
            setTimeout(() => {
                speak("Finally, here's a health tip for you:");
                speak(getHealthTip());
            }, 2000);
        }, 2000);
    }, 2000);
}

else if (message.includes("exercise reminder")) {
    speak("Setting up exercise reminders. I'll remind you to move every hour.");
    
    setInterval(() => {
        speak("Time for a quick exercise break! Stand up and stretch for a minute.");
    }, 3600000); // Reminder every hour
}

else if (message.includes("track steps")) {
    const steps = trackSteps();
    if (typeof steps === "number") {
        speak(`You've taken ${steps} steps today.`);
    } else {
        speak(steps);
    }
}

else if (message.includes("meal suggestion")) {
    let mealType = "breakfast";
    if (message.includes("breakfast")) mealType = "breakfast";
    else if (message.includes("lunch")) mealType = "lunch";
    else if (message.includes("dinner")) mealType = "dinner";
    else if (message.includes("snack")) mealType = "snacks";
    
    const suggestion = getMealSuggestion(mealType);
    speak(`For ${mealType}, I suggest: ${suggestion}`);
}

else if (message.includes("stress check") || message.includes("check stress")) {
    const stressAnalysis = assessStressLevel();
    speak(stressAnalysis);
}

else if (message.includes("track sleep") || message.includes("sleep quality")) {
    const sleepAnalysis = trackSleepQuality();
    speak(sleepAnalysis);
}

else if (message.includes("exercise routine") || message.includes("workout plan")) {
    let level = "beginner";
    if (message.includes("intermediate")) level = "intermediate";
    if (message.includes("advanced")) level = "advanced";
    
    const routine = getExerciseRoutine(level);
    speak(`Here's your ${level} exercise routine for today:`);
    routine.forEach((exercise, index) => {
        setTimeout(() => speak(exercise), index * 2000);
    });
}

else if (message.includes("play music")) {
    speak("Opening YouTube Music...");
    setTimeout(() => {
        window.open("https://music.youtube.com", "_blank");
    }, 1000);
}
else if (message.match(/play (.*) song/i)) {
    const songName = message.match(/play (.*) song/i)[1];
    speak(`Searching for ${songName} on YouTube Music...`);
    setTimeout(() => {
        const searchQuery = encodeURIComponent(songName);
        window.open(`https://music.youtube.com/search?q=${searchQuery}`, "_blank");
    }, 1000);
}
else if (message.match(/play (.*) video/i)) {
    const videoName = message.match(/play (.*) video/i)[1];
    speak(`Searching for ${videoName} on YouTube...`);
    setTimeout(() => {
        const searchQuery = encodeURIComponent(videoName);
        window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, "_blank");
    }, 1000);
}
else if (message.includes("play video")) {
    speak("Opening YouTube...");
    setTimeout(() => {
        window.open("https://www.youtube.com", "_blank");
    }, 1000);
}

// Calculator feature
else if (message.includes("calculate")) {
    try {
        const expression = message.replace("calculate", "").trim();
        const result = eval(expression);
        speak(`The result is ${result}`);
    } catch (error) {
        speak("Sorry, I couldn't perform that calculation.");
    }
}

// Random number generator
else if (message.includes("generate random number")) {
    const max = message.includes("between") ? 
        parseInt(message.split("between")[1]) || 100 : 100;
    const randomNum = Math.floor(Math.random() * max) + 1;
    speak(`Here's your random number: ${randomNum}`);
}

// Dictionary feature
else if (message.includes("define")) {
    const word = message.replace("define", "").trim();
    speak(`Looking up the definition of ${word}...`);
    setTimeout(() => {
        window.open(`https://www.dictionary.com/browse/${word}`, "_blank");
    }, 1000);
}

// Translation feature
else if (message.includes("translate")) {
    const text = message.replace("translate", "").trim();
    speak(`Translating "${text}"...`);
    setTimeout(() => {
        window.open(`https://translate.google.com/?text=${encodeURIComponent(text)}`, "_blank");
    }, 1000);
}

// Movie recommendations
else if (message.includes("recommend movies") || message.includes("movie suggestions")) {
    speak("Here are some popular movie genres. Which would you prefer: Action, Comedy, Drama, or Sci-Fi?");
}

// Music recommendations
else if (message.includes("recommend music") || message.includes("music suggestions")) {
    speak("Opening Spotify's recommendation page...");
    setTimeout(() => {
        window.open("https://open.spotify.com/genre/discover", "_blank");
    }, 1000);
}

// Games
else if (message.includes("play games") || message.includes("suggest games")) {
    speak("Opening some popular online games...");
    setTimeout(() => {
        window.open("https://www.addictinggames.com/", "_blank");
    }, 1000);
}

// Meditation/Focus
else if (message.includes("meditation") || message.includes("focus music")) {
    speak("Opening meditation sounds...");
    setTimeout(() => {
        window.open("https://www.calm.com/", "_blank");
    }, 1000);
}

// Recipe suggestions
else if (message.includes("recipe") || message.includes("how to cook")) {
    const dish = message.replace(/(recipe|how to cook)/gi, "").trim();
    speak(`Looking for recipes for ${dish}...`);
    setTimeout(() => {
        window.open(`https://www.allrecipes.com/search?q=${encodeURIComponent(dish)}`, "_blank");
    }, 1000);
}

// Current events
else if (message.includes("current events") || message.includes("what's happening")) {
    speak("Here are today's top stories...");
    setTimeout(() => {
        window.open("https://news.google.com/", "_blank");
    }, 1000);
}

// Fun facts
else if (message.includes("tell me something interesting") || message.includes("random fact")) {
    const facts = [
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible!",
        "The first oranges weren't orange! The original oranges from Southeast Asia were actually green.",
        "A day on Venus is longer than its year. It takes Venus 243 Earth days to rotate on its axis but only 225 Earth days to orbit the Sun.",
        "The world's oldest piece of chewing gum is over 9,000 years old!",
        "Cows have best friends and get stressed when separated from them.",
        "A bolt of lightning is six times hotter than the surface of the sun!",
        "The average person spends 6 months of their lifetime waiting for red lights to turn green.",
        "A group of flamingos is called a 'flamboyance'.",
        "The first computer mouse was made of wood!",
        "The shortest war in history lasted only 38 minutes between Britain and Zanzibar in 1896."
    ];
    speak(facts[Math.floor(Math.random() * facts.length)]);
}

// Motivational quotes
else if (message.includes("motivate me") || message.includes("need motivation")) {
    const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
        "Everything you've ever wanted is on the other side of fear. - George Addair"
    ];
    speak(quotes[Math.floor(Math.random() * quotes.length)]);
}

// System commands
else if (message.includes("system status")) {
    const status = {
        battery: navigator.getBattery ? "Checking battery..." : "Battery status unavailable",
        online: navigator.onLine ? "Internet connected" : "Internet disconnected",
        userAgent: navigator.userAgent
    };
    speak(`System Status: ${status.online}. ${status.battery}`);
}

else if (message.includes("what are you doing")) {
    const activities = [
        "I'm here helping users with their queries and tasks!",
        "Just processing information and waiting to assist you!",
        "I'm analyzing data and learning new things to serve you better.",
        "I'm ready and active to help you with anything you need!",
        "I'm monitoring systems and staying alert for your commands."
    ];
    speak(activities[Math.floor(Math.random() * activities.length)]);
}

// Fun and Entertainment
else if (message.includes("tell me a riddle")) {
    const riddles = [
        "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? (Echo)",
        "What has keys, but no locks; space, but no room; and you can enter, but not go in? (Keyboard)",
        "The more you take, the more you leave behind. What am I? (Footsteps)",
        "What has a head and a tail that will never meet? (Coin)",
        "What gets wetter and wetter the more it dries? (Towel)"
    ];
    speak(riddles[Math.floor(Math.random() * riddles.length)]);
}

else if (message.includes("play rock paper scissors")) {
    const choices = ["rock", "paper", "scissors"];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    speak(`I choose ${computerChoice}! Say 'I choose' followed by your choice!`);
}

else if (message.includes("tell me a tongue twister")) {
    const twisters = [
        "Peter Piper picked a peck of pickled peppers",
        "She sells seashells by the seashore",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood",
        "Red lorry, yellow lorry",
        "Unique New York"
    ];
    speak(twisters[Math.floor(Math.random() * twisters.length)]);
}

// Study Helper
else if (message.includes("start study timer")) {
    speak("Starting a 25-minute study session. I'll notify you when it's break time!");
    setTimeout(() => {
        speak("Time for a 5-minute break!");
    }, 1500000);
}

else if (message.includes("give me a study tip")) {
    const studyTips = [
        "Try the Pomodoro Technique: 25 minutes of focused study followed by a 5-minute break",
        "Teach what you've learned to someone else to better understand it",
        "Take handwritten notes instead of typing them",
        "Study in short bursts rather than long cramming sessions",
        "Create mind maps to connect different concepts"
    ];
    speak(studyTips[Math.floor(Math.random() * studyTips.length)]);
}

// Daily Challenges
else if (message.includes("daily challenge")) {
    const challenges = [
        "Try learning 3 new words in a different language today",
        "Do 20 minutes of physical exercise",
        "Read at least one chapter of a book",
        "Practice mindfulness for 10 minutes",
        "Learn one new skill on YouTube"
    ];
    speak(challenges[Math.floor(Math.random() * challenges.length)]);
}

// Mood Enhancement
else if (message.includes("iam feeling down") || message.includes("cheer me up")) {
    const cheerUpMessages = [
        "Let's watch some funny videos together! Want me to find some?",
        "How about we listen to some upbeat music?",
        "Did you know that smiling, even forced, can improve your mood? Try it!",
        "Let's practice gratitude - tell me three good things that happened today",
        "Would you like to hear a joke or a funny story?"
    ];
    speak(cheerUpMessages[Math.floor(Math.random() * cheerUpMessages.length)]);
}

// Creative Writing Prompts
else if (message.includes("writing prompt")) {
    const prompts = [
        "Write about a world where everyone has the same superpower",
        "Describe your perfect day in a parallel universe",
        "You discover your pet can talk, but only at midnight",
        "Write a story that takes place entirely in an elevator",
        "You wake up with the ability to understand plants"
    ];
    speak(prompts[Math.floor(Math.random() * prompts.length)]);
}

else if (message.includes("show commands") || message.includes("open commands") || message.includes("list commands")) {
    speak("Opening the commands documentation page...");
    setTimeout(() => {
        window.open("https://crimson-bag-b92.notion.site/commands-by-categories-from-your-code-1a2cec99635c8094a168d9d957df9bc4?pvs=73", "_blank");
    }, 1000);
}

else {
    speak("I couldn't understand that. Searching Google for " + message);

    // Open Google Search
    let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(message)}`;
    window.open(searchUrl, "_blank");

    // Fetch search results (Google API or scraping method required)
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`)
        .then(response => response.json())
        .then(data => {
            let parser = new DOMParser();
            let doc = parser.parseFromString(data.contents, "text/html");

            let firstResult = doc.querySelector(".BNeawe").innerText; // Extract first result

            if (firstResult) {
                speak("Here is what I found: " + firstResult);
            } else {
                speak("I couldn't fetch the search result, but you can check it in the browser.");
            }
        })
        .catch(error => {
            speak("I couldn't retrieve the search result. Please check the browser.");
        });
}

function openCalculator() {
    // Create calculator window
    const calculatorWindow = window.open('', 'Calculator', 'width=300,height=400');
    
    // Add calculator HTML and CSS
    calculatorWindow.document.write(`
        <html>
        <head>
            <title>Calculator</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: #f0f0f0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .calculator {
                    background: #fff;
                    border-radius: 10px;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    padding: 20px;
                }
                #display {
                    width: 100%;
                    height: 40px;
                    margin-bottom: 10px;
                    font-size: 20px;
                    text-align: right;
                    padding: 5px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .buttons {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 5px;
                }
                button {
                    padding: 15px;
                    font-size: 18px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background: #f8f9fa;
                    transition: all 0.3s ease;
                }
                button:hover {
                    background: #e9ecef;
                }
                .operator {
                    background: #4dabf7;
                    color: white;
                }
                .operator:hover {
                    background: #339af0;
                }
                .equals {
                    background: #40c057;
                    color: white;
                }
                .equals:hover {
                    background: #37b24d;
                }
                .clear {
                    background: #ff6b6b;
                    color: white;
                }
                .clear:hover {
                    background: #fa5252;
                }
            </style>
        </head>
        <body>
            <div class="calculator">
                <input type="text" id="display" readonly>
                <div class="buttons">
                    <button class="clear" onclick="clearDisplay()">C</button>
                    <button onclick="appendToDisplay('(')">(</button>
                    <button onclick="appendToDisplay(')')">)</button>
                    <button class="operator" onclick="appendToDisplay('/')">/</button>
                    <button onclick="appendToDisplay('7')">7</button>
                    <button onclick="appendToDisplay('8')">8</button>
                    <button onclick="appendToDisplay('9')">9</button>
                    <button class="operator" onclick="appendToDisplay('*')">×</button>
                    <button onclick="appendToDisplay('4')">4</button>
                    <button onclick="appendToDisplay('5')">5</button>
                    <button onclick="appendToDisplay('6')">6</button>
                    <button class="operator" onclick="appendToDisplay('-')">-</button>
                    <button onclick="appendToDisplay('1')">1</button>
                    <button onclick="appendToDisplay('2')">2</button>
                    <button onclick="appendToDisplay('3')">3</button>
                    <button class="operator" onclick="appendToDisplay('+')">+</button>
                    <button onclick="appendToDisplay('0')">0</button>
                    <button onclick="appendToDisplay('.')">.</button>
                    <button class="equals" onclick="calculate()">=</button>
                </div>
            </div>
            <script>
                const display = document.getElementById('display');
                
                function appendToDisplay(value) {
                    display.value += value;
                }
                
                function clearDisplay() {
                    display.value = '';
                }
                
                function calculate() {
                    try {
                        display.value = eval(display.value);
                    } catch (error) {
                        display.value = 'Error';
                        setTimeout(clearDisplay, 1000);
                    }
                }
                
                // Add keyboard support
                document.addEventListener('keydown', (event) => {
                    const key = event.key;
                    if (key >= '0' && key <= '9' || key === '.' || key === '+' || 
                        key === '-' || key === '*' || key === '/' || key === '(' || key === ')') {
                        appendToDisplay(key);
                    } else if (key === 'Enter') {
                        calculate();
                    } else if (key === 'Escape') {
                        clearDisplay();
                    } else if (key === 'Backspace') {
                        display.value = display.value.slice(0, -1);
                    }
                });
            </script>
        </body>
        </html>
    `);
}

// Health Monitoring Functions
function calculateBMI(weight, height) {
    // BMI = weight(kg) / (height(m))²
    const bmi = weight / (height * height);
    let category;
    
    if (bmi < 18.5) category = "underweight";
    else if (bmi < 25) category = "normal weight";
    else if (bmi < 30) category = "overweight";
    else category = "obese";
    
    return { bmi: bmi.toFixed(1), category };
}

function checkWaterIntake(glasses) {
    const recommendedGlasses = 8;
    const remaining = recommendedGlasses - glasses;
    
    if (remaining > 0) {
        return `You've had ${glasses} glasses of water today. Try to drink ${remaining} more glasses to reach the recommended daily intake.`;
    } else {
        return "Great job! You've reached your daily water intake goal.";
    }
}

function getHealthTip() {
    const tips = [
        "Remember to take regular breaks and stretch during long work sessions.",
        "Try to get 7-9 hours of sleep each night for optimal health.",
        "Include fruits and vegetables in every meal.",
        "Take a 10-minute walk after each meal to aid digestion.",
        "Practice deep breathing exercises to reduce stress.",
        "Maintain good posture while sitting at your desk.",
        "Stay hydrated by drinking water throughout the day.",
        "Do some light exercises or yoga in the morning.",
        "Limit screen time before bedtime for better sleep.",
        "Include protein-rich foods in your diet for energy."
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

// Add scroll detection
let lastScrollPosition = window.pageYOffset;
const floatingIconsLeft = document.querySelector('.floating-icons-left');
const floatingIconsRight = document.querySelector('.floating-icons-right');

window.addEventListener('scroll', () => {
    const currentScrollPosition = window.pageYOffset;
    
    if (currentScrollPosition > lastScrollPosition) {
        // Scrolling down
        floatingIconsLeft.style.transform = 'translateY(-100%)';
        floatingIconsRight.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        floatingIconsLeft.style.transform = 'translateY(0)';
        floatingIconsRight.style.transform = 'translateY(0)';
    }
    
    lastScrollPosition = currentScrollPosition;
});
}
