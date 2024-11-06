




// script.js









// Select DOM elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");





// Variable to track if the speaker is on or off
let isSpeakerOn = true;

// Function to toggle the speaker on/off
function toggleSpeaker() {
    isSpeakerOn = !isSpeakerOn; // Toggle the speaker state

    // Update button text based on the current state
    const speakerToggleButton = document.getElementById("speaker-toggle");
    speakerToggleButton.textContent = isSpeakerOn ? "🔊 Speaker On" : "🔇 Speaker Off";
}



// Text-to-speech function
function speak(text) {
    if (!window.speechSynthesis) return; // Check if speech synthesis is supported and speaker is on

    // Check if text contains "#*" and skip speaking if it does
    if (text.includes("#*")) return;

    // Remove specific characters like *, #, and :
    const cleanedText = text.replace(/[*#:]/g, ""); // Removes *, #, and :

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "en-IN"; // Set language to Indian English
    window.speechSynthesis.speak(utterance);
}





// Function to format responses in a structured manner
function formatResponse(text) {
    // Convert markdown-like sections to HTML tags
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Bold text
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>"); // Italic text

    // Add paragraph tags around line breaks
    text = text.split('\n').map(line => `<p>${line.trim()}</p>`).join("");

    // Convert numbered lists
    text = text.replace(/(\d+)\.\s/g, "<br><strong>$1.</strong> "); // For steps like "1. "

    // Convert unordered list items
    text = text.replace(/-\s/g, "<br>&bull; "); // For bullets "- item"

    return text;
}






// Function to display messages in the chat box
function displayMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}`;

    if (sender === "storm") {
        // Speaker and stop icons with initial tooltip text
        messageDiv.innerHTML = `
            ${formatResponse(message)}
            <span class="speaker-container" onclick="toggleSpeak('${message.replace(/'/g, "\\'")}')" title="Click to listen">
                <svg class="speaker-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zM17.5 12c0-1.77-1.02-3.29-2.5-4.03v8.06c1.48-.74 2.5-2.26 2.5-4.03zM16 3.23v2.06c3.45.91 6 4.02 6 7.71s-2.55 6.8-6 7.71v2.06c4.01-1 7-4.67 7-9.77s-2.99-8.77-7-9.77z"></path>
                </svg>
                <svg class="stop-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display: none;">
                    <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
            </span>
        `;

        const speakerContainer = messageDiv.querySelector(".speaker-container");
        speakerContainer.addEventListener("click", () => toggleSpeak(message));
    } else {
        // For user messages, display the message text without a speaker icon
        messageDiv.textContent = message;
    }

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}







let isSpeaking = false; // Track whether the bot is currently speaking

// Function to toggle speaking state
function toggleSpeak(text) {
    const speakerIcon = document.querySelector(".speaker-icon");
    const stopIcon = document.querySelector(".stop-icon");
    const speakerContainer = document.querySelector(".speaker-container");

    if (!isSpeaking) {
        // Start speaking
        speak(text);
        isSpeaking = true;
        speakerIcon.style.display = "none";
        stopIcon.style.display = "inline";
        speakerContainer.title = "Click to stop";
    } else {
        // Stop speaking
        window.speechSynthesis.cancel();
        isSpeaking = false;
        speakerIcon.style.display = "inline";
        stopIcon.style.display = "none";
        speakerContainer.title = "Click to listen";
    }
}

// Text-to-speech function
function speak(text) {
    if (!window.speechSynthesis) return; // Check if speech synthesis is supported

    // Remove specific characters like *, #, and :
    const cleanedText = text.replace(/[*#:]/g, ""); // Removes *, #, and :

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = "en-IN"; // Set language to Indian English

    // Event to reset icon when speech ends
    utterance.onend = () => {
        isSpeaking = false;
        document.querySelector(".speaker-icon").style.display = "inline";
        document.querySelector(".stop-icon").style.display = "none";
        document.querySelector(".speaker-container").title = "Click to listen";
    };

    window.speechSynthesis.speak(utterance);
}








// Function to handle sending and receiving messages
async function sendMessage() {
    const userText = userInput.value.trim();
    if (!userText) return;

    // Display user's message
    displayMessage(userText, "user");
    userInput.value = "";

    // Define patterns for recognizing questions about the bot's name
    const namePatterns = [
        /what.*is.*your.*name/i,
        /who.*are.*you/i,
        /your.*name/i,
        /name\??/i,
    ];

    // Check for name-related questions with flexible matching
    const isNameQuestion = namePatterns.some((pattern) => pattern.test(userText));

    if (isNameQuestion) {
        displayMessage("My name is Storm!", "storm");
        return;
    }




    if (/fuck.*you/i.test(userText)) {
        displayMessage("Fuck you too", "storm");
        return;
    }


    if (/who.*creats.*you/i,
        /who.*is.*your.*creater/i.test(userText)) {
        displayMessage("I am created by Ansari Shoaib", "storm");
        return;
    }



    // Call the backend (Google API) for other responses
    try {
        const response = await fetch("https://chat-bot-stom.onrender.com/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: userText }),
        });

        const data = await response.json();
        displayMessage(data.response.text, "storm");
    } catch (error) {
        displayMessage("Oops! I couldn't process your request.", "storm");
        console.error("Error fetching response:", error);
    }
}

// Send message on button click or Enter key press
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
