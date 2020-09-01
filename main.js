const packageInfo = require('./package.json')
const { autoUpdater } = require('electron-updater')
const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: __dirname + '/preload.js'
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
  let reslove;
  if (process.env.NODE_ENV === 'development') {
    reslove = mainWindow.loadURL('http://localhost:8001');
  } else {
    reslove = mainWindow.loadURL(`file://${__dirname}/dist/index.html`);
  }
  reslove.then(() => {
    mainWindow.webContents.send('version', packageInfo.version)
  })
  mainWindow.openDevTools();
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
};

app.on('ready', () => {
  bindIpc(); //初始化ipc
  app.setAppUserModelId(packageInfo.appId);
  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

function CheckUpdate(event) {
  let message = {
    appName: 'umi-electron',
    error: '检查更新出错, 请联系开发人员',
    checking: '正在检查更新……',
    updateAva: '检测到新版本，正在下载……',
    updateNotAva: '现在使用的就是最新版本，不用更新',
    downloaded: '最新版本已下载，点击安装进行更新'
  };
  //当开始检查更新的时候触发
  autoUpdater.on('checking-for-update', function() {
    event.sender.send('check-for-update', message.checking); //返回一条信息
  });
  //当发现一个可用更新的时候触发，更新包下载会自动开始
  autoUpdater.on('update-available', function(info) {
    event.sender.send('update-down-success', info);
    event.sender.send('check-for-update', message.updateAva); //返回一条信息
  });
  //当没有可用更新的时候触发
  autoUpdater.on('update-not-available', function() {
    event.sender.send('check-for-update', message.updateNotAva); //返回一条信息
  });
  autoUpdater.on('error', function() {
    event.sender.send('check-for-update', message.error); //返回一条信息
  });
  // 更新下载进度事件
  autoUpdater.on('download-progress', progressObj => {
    event.sender.send('download-progress', progressObj);
  });
  autoUpdater.on('update-downloaded', function() {
    event.sender.send('check-for-update', message.downloaded); //返回一条信息
    //通过main进程发送事件给renderer进程，提示更新信息
  });
}

/*初始化ipc*/
function bindIpc() {
  /*系统操作事件*/
  ipcMain.on('system', (event, type, data) => {
    switch (type) {
      case 'check-for-update' /*检查更新*/:
        autoUpdater.setFeedURL(data);
        CheckUpdate(event);
        autoUpdater.checkForUpdates();
        break;
      case 'update' /*安装更新*/:
        autoUpdater.quitAndInstall();
        break;
      case 'exit':
        app.quit();
        break;
    }
  });
}
