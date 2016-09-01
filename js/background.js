chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('main.html', {
    id: "mainwin",
    bounds: {
      top: 0,
      left: 0,
      width: 500,
      height: 600
    },
	minWidth: 500,
    maxWidth: 500,
	minHeight: 600,
	maxHeight: 600
  });
})
