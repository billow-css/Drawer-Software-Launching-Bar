process.env.LANG = 'zh_CN.UTF-8';
process.env.NODE_ENV = 'production';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
app.commandLine.appendSwitch('disable-features', 'Crashpad');
app.commandLine.appendSwitch('no-crash-upload');
const fs = require('fs-extra');
const path = require('path');
const ws = require('windows-shortcuts');

// 注意：已移除 child_process 相关引入，因为不再需要 PowerShell

// 生成配置文件（使用 Electron 的 app.getFileIcon 提取图标）
async function generateAppConfig() {
  try {
    const appRootDir = path.join(__dirname, 'App');
    const iconDir = path.join(__dirname, 'icons');
    const configPath = path.join(__dirname, 'app-config.json');

    // === 新增：清空 icons 目录（保留 default.png）===
    const iconFiles = fs.readdirSync(iconDir);
    for (const file of iconFiles) {
      if (file !== 'default.png') {
        const filePath = path.join(iconDir, file);
        fs.removeSync(filePath); // 同步删除
        console.log(`清理图标: ${file}`);
      }
    }

    // 确保目录存在
    fs.ensureDirSync(appRootDir);
    fs.ensureDirSync(iconDir);

    // 确保默认图标存在（空白占位）
    const defaultIconPath = path.join(iconDir, 'default.png');
    if (!fs.existsSync(defaultIconPath)) {
      fs.writeFileSync(defaultIconPath, Buffer.alloc(0));
    }

    // 读取分类（App 下的子文件夹）
    const categoryDirs = fs.readdirSync(appRootDir).filter(dir => {
      const dirPath = path.join(appRootDir, dir);
      return fs.statSync(dirPath).isDirectory();
    });

    const categories = [];

    for (const dirName of categoryDirs) {
      const categoryPath = path.join(appRootDir, dirName);
      const lnkFiles = fs.readdirSync(categoryPath).filter(file =>
        file.toLowerCase().endsWith('.lnk')
      );

      const apps = [];
      for (const lnkFile of lnkFiles) {
        const lnkPath = path.join(categoryPath, lnkFile);
        const appName = path.basename(lnkFile, '.lnk');

        // 使用 windows-shortcuts 解析快捷方式，获取目标路径
        let targetPath = null;
        try {
          const shortcut = await new Promise((resolve, reject) => {
            ws.query(lnkPath, (err, data) => {
              if (err) reject(err);
              else resolve(data);
            });
          });
          targetPath = shortcut.target;
        } catch (err) {
          console.error(`解析快捷方式失败 ${lnkPath}: ${err.message}`);
        }

        // 图标文件名（默认使用 default.png）
        let iconFileName = 'default.png';

        // 如果目标路径存在且文件存在，则尝试提取图标
        if (targetPath && fs.existsSync(targetPath)) {
          // 生成安全的文件名（去除非法字符）
          const safeName = `${dirName}_${appName}`.replace(/[<>:"/\\|?*]/g, '_');
          const candidateIcon = `${safeName}.png`;
          const iconOutput = path.join(iconDir, candidateIcon);

          // 如果图标文件尚不存在，则提取
          if (!fs.existsSync(iconOutput)) {
            try {
              // 使用 Electron 的 API 获取图标 NativeImage
              // app.getFileIcon 返回 Promise<NativeImage>
              const nativeImg = await app.getFileIcon(targetPath, { size: 'large' });
              // 将图标保存为 PNG 文件
              fs.writeFileSync(iconOutput, nativeImg.toPNG());
              console.log(`图标生成成功: ${iconOutput}`);
              iconFileName = candidateIcon;
            } catch (iconErr) {
              console.error(`图标提取失败 (${targetPath}):`, iconErr.message);
              // 失败则使用默认图标（iconFileName 保持 default.png）
            }
          } else {
            // 图标已存在，直接使用
            iconFileName = candidateIcon;
          }
        } else {
          console.warn(`快捷方式目标无效或不存在: ${lnkPath} -> ${targetPath}`);
        }

        apps.push({
          name: appName,
          shortcutKey: `${dirName}/${lnkFile}`,
          icon: `./icons/${iconFileName}` // 相对路径供前端使用
        });
      }

      // 按名称排序（中文友好）
      apps.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

      categories.push({
        CategoryName: dirName,
        expanded: true,
        apps: apps
      });
    }

    // 分类排序
    categories.sort((a, b) => a.CategoryName.localeCompare(b.CategoryName, 'zh-CN'));

    // 写入 JSON 配置文件
    fs.writeJsonSync(configPath, categories, { spaces: 2, encoding: 'utf8' });
    console.log(`配置文件生成成功：${configPath}`);
    return configPath;
  } catch (err) {
    console.error(`生成配置失败：${err.message}`);
    throw err;
  }
}

// 创建窗口
async function createWindow() {
  // 先生成配置文件
  await generateAppConfig().catch(err => console.error(err));

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'logo.png'), 
    title: "Drawer",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      sandbox: false,
      enableRemoteModule: false
    },
    transparent: true,
    frame: false,
    movable: false,
    resizable: false,
    backgroundColor: '#00000000',
  });

  win.setMenu(null);
  win.setFullScreen(true);

  // 延迟加载，避免 IPC 提前调用
  setTimeout(() => {
    win.loadFile('index.html');
  }, 500);

  win.webContents.on('uncaughtException', (err) => {
    console.error('渲染进程异常：', err);
  });
}

// IPC：打开应用
ipcMain.handle('open-app', async (_, shortcutKey) => {
  try {
    const shortcutPath = path.join(__dirname, 'App', shortcutKey);
    if (!fs.existsSync(shortcutPath)) {
      console.error(`快捷方式不存在：${shortcutPath}`);
      return false;
    }
    await shell.openPath(shortcutPath);
    console.log(`成功打开：${shortcutPath}`);
    return true;
  } catch (err) {
    console.error(`打开失败：${err.message}`);
    return false;
  }
});

ipcMain.handle('open-app-folder', async () => {
    try {
        const appFolder = path.join(__dirname, 'App');
        // 确保文件夹存在（如果不存在则创建）
        if (!fs.existsSync(appFolder)) {
            fs.mkdirSync(appFolder);
        }
        await shell.openPath(appFolder);
        return true;
    } catch (err) {
        console.error('打开 App 文件夹失败:', err);
        return false;
    }
});

// 全局捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝：', reason.message);
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// 禁用硬件加速，减少透明窗口的异常
app.disableHardwareAcceleration();