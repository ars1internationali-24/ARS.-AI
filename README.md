<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini AI Chatbot</title>
    <style>
        /* CSS এর মাধ্যমে ডিজাইন */
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .chat-container { width: 100%; max-width: 600px; background-color: white; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; height: 80vh; }
        #chat-window { flex-grow: 1; padding: 20px; overflow-y: auto; background-color: #e9ebee; }
        .message { margin-bottom: 15px; padding: 10px 15px; border-radius: 18px; max-width: 70%; line-height: 1.4; word-wrap: break-word; }
        .user-message { background-color: #007bff; color: white; margin-left: auto; text-align: right; border-bottom-right-radius: 2px; }
        .ai-message { background-color: #dc3545; color: white; margin-right: auto; text-align: left; border-bottom-left-radius: 2px; }
        .input-area { display: flex; padding: 10px; border-top: 1px solid #ddd; }
        #user-input { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 20px; margin-right: 10px; font-size: 16px; }
        #send-button { padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; }
        #send-button:hover { background-color: #0056b3; }
        .loading { color: #888; text-align: center; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="chat-container">
        <div id="chat-window">
            <div class="ai-message message">স্বাগতম! আমি একটি এআই সহকারী। আপনি কী জানতে চান?</div>
        </div>
        <div class="input-area">
            <input type="text" id="user-input" placeholder="আপনার বার্তা লিখুন..." />
            <button id="send-button">পাঠান</button>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
// আপনার এপিআই কী এখানে বসান। বাস্তবে এটিকে গোপন রাখুন!
const GEMINI_API_KEY = "YOUR_API_KEY_HERE"; 

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Gemini চ্যাট হিস্টরি সংরক্ষণের জন্য একটি অ্যারে
let chatHistory = []; 

// চ্যাটবটের সাথে যোগাযোগ করার ফাংশন
async function sendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // ১. ব্যবহারকারীর বার্তা ডিসপ্লে করা
    appendMessage(messageText, 'user-message');
    userInput.value = '';

    // ২. লোডিং বার্তা যোগ করা
    const loadingDiv = appendMessage('টাইপ করছে...', 'loading');

    // ৩. Gemini মডেলের জন্য হিস্টরি তৈরি করা
    chatHistory.push({ role: "user", parts: [{ text: messageText }] });
    
    // ৪. API কল করা
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: chatHistory, // সম্পূর্ণ হিস্টরি পাঠানো
                config: {
                    // আপনি চাইলে মডেলের আচরণ নিয়ন্ত্রণ করতে পারেন, যেমন টেম্পারেচার
                },
            }),
        });

        const data = await response.json();

        // ৫. উত্তর প্রক্রিয়াকরণ
        if (data.candidates && data.candidates.length > 0) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            // লোডিং বার্তা মুছে দিয়ে উত্তর দেখানো
            chatWindow.removeChild(loadingDiv);
            appendMessage(aiResponse, 'ai-message');
            
            // ৬. নতুন উত্তরটি হিস্টরিতে যোগ করা
            chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
        } else {
            chatWindow.removeChild(loadingDiv);
            appendMessage("দুঃখিত, আমি উত্তর দিতে পারছি না।", 'ai-message');
        }

    } catch (error) {
        console.error("API কল করার সময় ত্রুটি:", error);
        chatWindow.removeChild(loadingDiv);
        appendMessage("নেটওয়ার্ক বা API ত্রুটি হয়েছে। কনসোল দেখুন।", 'ai-message');
    }
}

// চ্যাট উইন্ডোতে বার্তা যোগ করার ফাংশন
function appendMessage(text, className) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    messageDiv.innerText = text;
    chatWindow.appendChild(messageDiv);
    
    // স্ক্রল করে শেষে যাওয়া
    chatWindow.scrollTop = chatWindow.scrollHeight; 
    return messageDiv;
}

// ইভেন্ট লিসেনার সেট করা
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});
