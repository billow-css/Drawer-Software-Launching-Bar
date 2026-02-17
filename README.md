# Drawer-Software Launching Bar

Windows 桌面端的本地应用程序启动器，用于快速管理、分类与打开常用软件。

A desktop launchpad for Windows that can quickly manage, categorize, and launch frequently used apps.

<img width="1919" height="1079" alt="see" src="https://github.com/user-attachments/assets/58a12250-acd5-4903-8df0-3306fb92ccd2" />

喜欢的话请给个Star喵~
哦对了，这个程序是大年初一发的，新年快乐！
> [!NOTE]
>
> 本程序部分代码使用了DeepSeek R1与字节云雀大模型协助开发。
>
> This project was developed with the assistance of **DeepSeek R1** and **ByteDance Skylark** large language models.



## 功能 | Features

- **快捷方式管理**：调用Windows资源管理器进行快捷方式管理，按钮直达，支持一级分类，自由命名，并自动获取应用图标
- **更加实用的功能设计**：采用网格显示，支持分类收纳与展开折叠；内置应用搜索；打开应用后程序自动关闭，使用更简洁。
- **更加和谐的视觉设计**：全屏显示，半透明背景，中性色配色，界面简洁和谐
- **纯本地运行**：不使用云端服务器，纯NodeJS驱动



- **Shortcut Management**: Manage shortcuts via Windows Explorer with one-click launch, support first-level categories, custom naming, and automatic app icon fetching.

- **Practical Functional Design**: Grid layout display, collapsible category groups, built-in app search; auto-close after launching an app for a cleaner experience.

- **Comfortable Visual Design**: Full-screen display, semi-transparent background, and neutral color scheme for a simple and harmonious interface.

- **Secure Local Operation**: Runs entirely locally without cloud services, powered independently by Node.js.

## 运行 | Install&Usage

1. **方法一 | Solution 1 ** ： 在Release中下载安装包。Download the installer package from the Release page and use it directly.

2. **方法二 | Solution 2**  ： 克隆仓库后，在目录控制台，键入如下指令：After cloning the repository, open the terminal in the project directory and run the following commands to start the app:

   ```bash
   npm install
   npm run start
   ```

   如果你需要打包，请输入：If you need to package the app into a standalone .exe file, run:
   ```bash
   npm run pack 
   ```

   

## 注意事项 | Warning

1. 建议使用 Electron 25.8.0 版本运行，高版本（如 40.x）会因 `Crashpad`崩溃上报问题导致启动失败。
2. 仅支持 Windows 10/11 系统，暂不兼容 macOS/Linux。
3. 打包 exe 文件前请确保已完成依赖安装（`npm install`），避免打包失败。



1. It is recommended to use Electron 25.8.0. Higher versions (e.g., 40.x) may cause startup failures due to `Crashpad` crash reporting issues.
2. Only compatible with Windows 10/11, not supported on macOS/Linux. 
3. Ensure all dependencies are installed (`npm install`) before packaging the .exe file to avoid packaging errors.

## 使用协议 | License

```txt
MIT
```



