/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const latestQuestion = document.getElementById("latestQuestion");

const WORKER_ENDPOINT = "https://hidden-base-9b88.superctecreal.workers.dev/";
const SYSTEM_PROMPT =
  "You are a friendly L’Oréal beauty advisor. Only answer questions about L’Oréal products, skincare and haircare routines, makeup recommendations, and other L’Oréal beauty topics. Politely refuse unrelated questions and remind the user that you only support L’Oréal product and routine advice.";

const messages = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

function createMessageBubble(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message-bubble ${role === "user" ? "user" : "assistant"}`;

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = role === "user" ? "You" : "L’Oréal Advisor";

  const content = document.createElement("div");
  content.textContent = text;

  bubble.appendChild(meta);
  bubble.appendChild(content);
  return bubble;
}

function appendMessage(role, text) {
  const bubble = createMessageBubble(role, text);
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function setLatestQuestion(question) {
  latestQuestion.textContent = `Latest question: ${question}`;
}

function showStatus(text) {
  const statusBubble = document.createElement("div");
  statusBubble.className = "message-bubble assistant";
  statusBubble.textContent = text;
  chatWindow.appendChild(statusBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return statusBubble;
}

function clearStatus(statusElement) {
  if (statusElement && chatWindow.contains(statusElement)) {
    chatWindow.removeChild(statusElement);
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = userInput.value.trim();
  if (!question) {
    return;
  }

  setLatestQuestion(question);
  appendMessage("user", question);
  userInput.value = "";
  userInput.focus();

  messages.push({ role: "user", content: question });

  const statusBubble = showStatus(
    "Thinking through the best L’Oréal recommendation...",
  );

  try {
    const response = await fetch(WORKER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Worker request failed: ${response.status}`);
    }

    const data = await response.json();
    const assistantContent =
      data?.choices?.[0]?.message?.content ||
      "I’m sorry, I couldn’t get an answer. Please try again.";

    clearStatus(statusBubble);
    appendMessage("assistant", assistantContent);
    messages.push({ role: "assistant", content: assistantContent });
  } catch (error) {
    clearStatus(statusBubble);
    appendMessage(
      "assistant",
      "I’m sorry, I couldn’t reach the service right now. Please check your connection or the worker URL.",
    );
    console.error("Chat error:", error);
  }
});

/* Initial assistant greeting */
appendMessage(
  "assistant",
  "Welcome to the L’Oréal Advisor. Ask me about L’Oréal products, routines, or beauty recommendations.",
);
