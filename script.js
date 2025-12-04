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
