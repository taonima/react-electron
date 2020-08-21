const { app, protocol, BrowserWindow } = require('electron');

let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  /**
   * loadURL 分为两种情况
   *  1.开发环境，指向 react 的开发环境地址
   *  2.生产环境，指向 react build 后的 index.html
   */
  // const startUrl =
  //   process.env.NODE_ENV === 'development'
  //     ? 'http://localhost:8001'
  //     : `file://${__dirname}/dist/index.html`;
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8000');
    mainWindow.openDevTools();
  } else {
    mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
  }
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
