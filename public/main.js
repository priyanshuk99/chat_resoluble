const socket = io()

const clientsTotal = document.getElementById('clients-total')

const messageContainer = document.getElementById('message-container')
const nameInput = document.getElementById('name-input')
const messageForm = document.getElementById('message-form')
const messageInput = document.getElementById('message-input')

var username = window.prompt('Please Enter Your Name')
if (username != null && username != '') { nameInput.value = username }
else nameInput.value = 'Anonymous'


const messageTone = new Audio('/message-tone.mp3')

messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    sendMessage()
})

socket.on('clients-total', (data) => {
    clientsTotal.innerText = `Total Clients: ${data}`
})

function sendMessage() {
    if (messageInput.value === '') return
    // console.log(messageInput.value)
    var options = { month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    var date = new Date();
    const data = {
        name: nameInput.value,
        message: messageInput.value,
        dateTime: date.toLocaleString("en-US", options),
    }
    socket.emit('message', data)
    addMessageToUI(true, data)
    messageInput.value = ''
}

socket.on('chat-message', (data) => {
    // console.log(data)
    messageTone.play()
    addMessageToUI(false, data)
})

function addMessageToUI(isOwnMessage, data) {
    clearFeedback()
    const element = `
      <li class="${isOwnMessage ? 'message-right' : 'message-left'}">
          <p class="message">
            ${data.message}
            <span>${data.name} ● ${data.dateTime}</span>
          </p>
        </li>
        `

    messageContainer.innerHTML += element
    scrollToBottom()
}

function scrollToBottom() {
    messageContainer.scrollTo(0, messageContainer.scrollHeight)
}


messageInput.addEventListener('keypress', (e) => {
    socket.emit('feedback', {
        feedback: `✍️ ${nameInput.value} is typing a message`,
    })
})
messageInput.addEventListener('blur', (e) => {
    socket.emit('feedback', {
        feedback: '',
    })
})

socket.on('feedback', (data) => {
    clearFeedback()
    const element = `
        <li class="message-feedback">
          <p class="feedback" id="feedback">${data.feedback}</p>
        </li>
  `
    messageContainer.innerHTML += element
})

function clearFeedback() {
    document.querySelectorAll('li.message-feedback').forEach((element) => {
        element.parentNode.removeChild(element)
    })
}