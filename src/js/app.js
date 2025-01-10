const nickname = prompt("Введите свой Никнейм:");
const ws = new WebSocket("ws://localhost:7070");

const messagesDiv = document.getElementById("messages");
const userListUl = document.getElementById("user-list");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");

let myNickName = null;

ws.onopen = () => {
  ws.send(JSON.stringify({ type: "set_nickname", nickname }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "user-list":
      userListUl.innerHTML = "";

      data.users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user;
        userListUl.appendChild(li);
      });
      break;

    case "nickname_error":
      alert(data.message);
      window.location.reload();
      break;

    case "nickname_accepted":
      myNickName = data.nickname;
      break;

    case "message_history":
      data.messages.forEach((message) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${message.sender === myNickName ? "right" : ""}`;
        messageDiv.innerHTML = createMessage(message);
        messagesDiv.appendChild(messageDiv);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      break;

    case "new_message":
      console.log("New message received:", data);

      // eslint-disable-next-line no-case-declarations
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${data.sender === myNickName ? "right" : ""}`;
      messageDiv.innerHTML = createMessage(data);

      messagesDiv.appendChild(messageDiv);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
      break;
  }
};

sendButton.addEventListener("click", () => {
  const message = messageInput.value.trim();
  if (message) {
    ws.send(JSON.stringify({ type: "send_message", content: message }));
    messageInput.value = "";
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "Enter" && messageInput.value) {
    sendMessage();
  }
});

function createMessage(message) {
  return `
					<span class="message-sender">${message.sender === myNickName ? "You, " : message.sender + ", "}${message.timestamp}</span>
					<span class="message-content">${message.content}</span>					
				`;
}

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    ws.send(JSON.stringify({ type: "send_message", content: message }));
    messageInput.value = "";
  }
}
