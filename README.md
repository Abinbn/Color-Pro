# 🎨 Color Picker Pro

> A sleek, powerful Chrome extension for designers and developers — pick any color, convert formats, manage palettes, and float a draggable swatch widget on any page.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/placeholder?label=Chrome%20Web%20Store&logo=google-chrome&logoColor=white&color=6c63ff)](https://chromewebstore.google.com/detail/color-picker-pro/impebaenajlpnpclnbmkckdibikelgfk)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](manifest.json)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fabinbn.github.io%2FColor-Pro)







---

## ✨ Features

| Feature | Description |
|---|---|
| 🎨 **Color Picker** | Click the preview strip to open the native OS color picker |
| 💉 **EyeDropper** | Sample any color on your screen (Chrome 95+ only) |
| 🔄 **Format Switcher** | Instantly switch between HEX, RGB, and HSL |
| 📋 **One-click Copy** | Copy button turns to ✓ with visual + toast feedback |
| 🕐 **Color History** | Last 10 (configurable) colors, individually deletable |
| 🎨 **Custom Palettes** | Create named palettes, add current color, delete swatches |
| 📌 **Float on Page** | Pin a draggable mini-swatch widget to any webpage |
| 🗜️ **Minimize Mode** | Collapse the popup to just the header bar |
| ⚙️ **Settings** | Default format, history limit, auto-copy, toast toggle |
| 🔒 **Privacy First** | Zero data collection, fully offline, no external requests |

---

## 📦 Installation

### From Chrome Web Store *(recommended)*
1. Visit [Color Picker Pro on Chrome Web Store](https://chrome.google.com/webstore)
2. Click **Add to Chrome**
3. Click the puzzle icon in the toolbar → pin **Color Picker Pro**

### Developer Mode (from source)
1. Clone this repository:
   ```bash
   git clone https://github.com/abinbn/color-picker-pro.git
   cd color-picker-pro
   ```
2. Open Chrome and navigate to `chrome://extensions`
3. Toggle **Developer mode** (top-right)
4. Click **Load unpacked** → select the `color-picker-pro` folder
5. The extension icon appears in your toolbar

---

## 🚀 Usage

### Picking a Color
- **Click the color strip** at the top to open the native color picker
- **Type** a HEX, RGB, or HSL value into the input and press **Enter**
- **Click the eyedropper** button (pipette icon) to sample any pixel on your screen

### Copying a Color
- Click the **copy button** next to the color code
- The format you're currently viewing (HEX/RGB/HSL) is what gets copied

### Color History
- The **Recent** section stores up to 10 colors (configurable in Settings)
- Click any swatch to select it
- Hover and click **×** to remove a single color
- Click **Clear all** to wipe the history

### Palettes
- Expand the **Palettes** section
- Type a name and click **Create** to snapshot current history into a palette
- Click **+** on any palette card to add the **current** color to that palette
- Click **🗑** to delete a palette

### Floating Widget
- Click the **↗ float** button in the header
- A draggable swatch widget appears on the current page
- Drag it by its header bar
- Click **×** to dismiss it
- Clicking float again updates the widget's color

### Minimize
- Click the **⤡** button to collapse the popup to just the title bar
- Click again to expand

---

## ⚙️ Settings

Open settings via the **⚙ gear** icon:

| Setting | Options | Default |
|---|---|---|
| Default Format | HEX / RGB / HSL | HEX |
| History Limit | 5 / 10 / 15 / 20 colors | 10 |
| Auto-copy on pick | On / Off | Off |
| Show copy toast | On / Off | On |

---

## 🏗️ Project Structure

```
color-picker-pro/
├── manifest.json       Chrome Extension manifest (v3)
├── popup.html          Extension popup UI
├── popup.css           Styles (design tokens, dark theme)
├── popup.js            All extension logic
├── background.js       Service worker (placeholder)
├── icon.png            Extension icon
└── README.md           This file
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a **Pull Request**

### Development Setup
No build step required — this is pure HTML/CSS/JS. Just load it unpacked in Chrome as described above.

### Reporting Bugs
Please [open an issue](https://github.com/abinbn/color-picker-pro/issues) with:
- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Abinbn** — [VAW Technologies](https://VAW Technologies.in)

- 🌐 Website: [VAW Technologies.in/colorpicker](https://VAW Technologies.in/colorpicker)
- 💼 GitHub: [@abinbn](https://github.com/abinbn)

---

## 🙏 Acknowledgements

- [Lucide Icons](https://lucide.dev/) for icon design inspiration
- [Material Design](https://m3.material.io/) for the eyedropper/colorize icon
- Chrome Extensions team for the EyeDropper API

---

*Built with ❤️ for designers and developers.*
