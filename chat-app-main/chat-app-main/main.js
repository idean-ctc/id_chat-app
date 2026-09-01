const { app, BrowserWindow } = require('electron');

// Start your existing server so it's running in the background
require('./server.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#1e1f22', // matches your theme, avoids a white flash on open
  });

  // Load your chat app, exactly like a browser would
  win.loadURL('http://localhost:3000');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});