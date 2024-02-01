chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getSummary') {
    fetch(/*Backend Endpoint (/summary)*/'' + encodeURIComponent(request.url))
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        sendResponse({ summary: data.summary });
      });
  } else if (request.action === 'askQuestion') {
    fetch(/*Backend Endpoint (/summary)*/'', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'question=' + encodeURIComponent(request.question),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        sendResponse({ answer: data.answer });
      });
  }
  return true;
});