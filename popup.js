document.addEventListener('DOMContentLoaded', function () {
  const summaryDiv = document.getElementById('summary');
  const questionForm = document.getElementById('question-form');
  const questionInput = document.getElementById('question-input');
  const chatLog = document.getElementById('chat-log');

  summaryDiv.textContent = 'Loading...';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tab = tabs[0];
    chrome.runtime.sendMessage({ action: 'getSummary', url: tab.url }, function (response) {
      if (!response || !response.summary) {
        summaryDiv.textContent = 'Failed to retrieve the summary.';
        return;
      }
      summaryDiv.textContent = response.summary;
    });
  });

  questionForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const question = questionInput.value.trim();
    if (question === '') {
      return;
    }
    appendMessage('user', question);

    chrome.runtime.sendMessage({ action: 'askQuestion', question: question }, function (response) {
      appendMessage('assistant', response.answer);
    });

    questionInput.value = '';
  });

  function appendMessage(role, content) {
    const messageElement = document.createElement('li');
    messageElement.classList.add(role);
  
    const messageContent = document.createElement('span');
    if (role === 'user') {
      messageContent.innerHTML = `<strong>${content}</strong>`;
    } else {
      messageContent.textContent = content;
    }
  
    messageElement.appendChild(messageContent);
    chatLog.appendChild(messageElement);
  }
});