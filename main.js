const { app, BrowserWindow, Menu, shell, protocol, net } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true
    }
  }
]);

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'نظام إدارة المخازن',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  mainWindow.loadURL('app://local/index.html');

  mainWindow.webContents.setWindowOpenHandler(function (details) {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(function () {
  protocol.handle('app', function (request) {
    try {
      const parsed = new URL(request.url);
      let pathname = decodeURIComponent(parsed.pathname);
      if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
      }
      const target = path.join(__dirname, pathname);
      return net.fetch(pathToFileURL(target).toString());
    } catch (err) {
      return new Response('Not found', { status: 404 });
    }
  });

  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
