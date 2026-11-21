<div align="center">

# ⚡ NEXORA

### Beyond what exists.

Make GitHub truly yours.

**Customize the look and feel of GitHub in Chrome, Edge, and Firefox.**

Themes • Colors • Typography • Custom CSS • Theme Builder

<br>

🇺🇸 **English** | 🇮🇷 **فارسی**

</div>

---

# 🌐 English

Download the Chrome/Edge or Firefox package from the [latest GitHub release](https://github.com/MaJiD-PiXeL/VELNAR_Project/releases/latest). For unpacked development, the Chromium extension source is in `velnar/extension`.

## ✨ What is NEXORA?

**NEXORA** is a browser extension that gives you control over the appearance of GitHub.

Instead of using the same default interface every day, NEXORA lets you transform GitHub with beautiful themes, custom colors, typography settings, component controls, and even your own CSS.

All of this happens **locally in your browser** without changing GitHub's actual functionality.

> Customize GitHub. Keep the GitHub you know.

---

## 🔥 Features

### 🎨 48 Built-in Themes

Choose from a large collection of carefully designed themes including:

* Dark
* Light
* Midnight
* AMOLED
* Dracula
* Nord
* Monokai
* One Dark
* Tokyo Night
* Catppuccin Mocha
* Rosé Pine
* Cyberpunk
* Solarized
* Synthwave
* Vivid themes
* Gaming themes
* And more...

---

### 🎮 Gaming & RGB Themes

NEXORA includes special gaming-inspired themes with bold, static RGB-inspired palettes.

Bring a gaming setup atmosphere directly into GitHub.

---

### ✨ Lightweight Static Themes

All themes use static colors. Motion effects, character overlays and background animation engines have been removed for a lighter GitHub experience.

---

### 🛠️ Deep Theme Builder

Don't like the presets?

Build your own.

NEXORA gives you control over **30 individual colors**, including:

* Background surfaces
* Text
* Interactive elements
* Borders
* Code areas
* Status colors
* Accent colors

You can also customize:

* Border radius
* Shadow intensity
* Visual appearance

Create a GitHub theme that is completely yours.

---

### Personal Theme Library and Drafts

Save up to 50 personal palettes in the theme library. Edit, rename, copy, favorite, preview, apply or delete them from **My themes**. Editing or deleting a saved palette preserves the copy already applied to GitHub.

The Theme Builder saves a recoverable draft automatically. Generate a light or dark palette from one seed color, then fine-tune any of its 30 colors. Readability checks cover text, links, buttons, status colors and code review additions/deletions, with suggested foreground fixes where possible. Transparent colors are reported as unmeasured.

Preview **Code Review** to compare pull request diffs and comments before applying. The latest 20 appearance changes are stored locally and can be restored after closing the panel. Restoring an entry removes that entry and newer entries while preserving your library, draft, favorites and language. Full settings reset clears this history.

Choose **English** or **فارسی** in **Settings → Interface language**. Persian uses RTL for the extension interface while source code stays LTR. Complete backups include personal palettes, draft, history and language; JSON imports are limited to 2 MB.

---

### 🧩 Component Control

You decide exactly which parts of GitHub should be customized.

NEXORA can independently control areas such as:

* Navbar
* Sidebar
* Repository cards
* Buttons
* Inputs
* Search
* Code blocks
* Markdown
* Issues
* Pull Requests
* Profiles
* Notifications
* Commits
* File explorer
* Menus
* Code review
* Contribution graph

Don't want a component themed?

Just disable it.

---

### 🔤 Typography Customization

Customize the way GitHub text looks.

Control:

* Font family
* Font size
* Font weight
* Line height
* Code font

---

### 🌙 Auto Dark Mode

NEXORA can automatically follow your operating system's light/dark mode.

Choose one NEXORA theme for Light Mode and another for Dark Mode.

NEXORA switches between them automatically.

---

### ⭐ Favorite Themes

Found a theme you love?

Add it to your favorites and access it faster.

---

### 🎲 Random Theme

Can't decide?

Let NEXORA choose.

Use the Random Theme option to instantly switch to another theme.

---

### 🎨 Custom CSS

Want even more control?

NEXORA includes a Custom CSS panel for advanced users.

Write your own CSS and customize GitHub beyond the built-in settings.

NEXORA validates your CSS before applying it and provides an easy reset option.

---

### 📦 Import & Export

Save and share your custom themes.

NEXORA supports:

* Theme Export
* Theme Import
* Settings Backup
* Settings Restore

Your setup can easily be moved to another machine.

---

### ⌨️ Keyboard Shortcuts

Quickly control NEXORA without opening the extension.

```text
Ctrl + Shift + G → Enable / Disable NEXORA

Alt + Shift + R → Random Theme
```

---

## 🔐 Privacy First

NEXORA is designed to be **local-first**.

It does not need an account and does not send your customization data to an external server.

### NEXORA has:

* ❌ No analytics
* ❌ No tracking
* ❌ No advertisements
* ❌ No unnecessary data collection
* ❌ No GitHub token collection
* ❌ No session data collection

Your settings are stored locally in your browser.

---

# 📥 Installation

NEXORA is currently available directly from GitHub.

For the packaged Chrome and Edge download or temporary Firefox installation, follow the [browser-specific install guide](velnar/README.md#install). The steps below load the Chromium source from a repository checkout.

### 1. Download NEXORA

Clone the repository:

```bash
git clone https://github.com/MaJiD-PiXeL/VELNAR_Project.git
```

Or click:

**Code → Download ZIP**

on the GitHub repository page.

---

### 2. Extract the Project

If you downloaded the ZIP file, extract it.

Navigate to:

```text
VELNAR_Project/
└── velnar/
    └── extension/
```

---

### 3. Open Chrome Extensions

Open Google Chrome and navigate to:

```text
chrome://extensions/
```

---

### 4. Enable Developer Mode

Turn on:

```text
Developer mode
```

from the top-right corner.

---

### 5. Load NEXORA

Click:

```text
Load unpacked
```

and select:

```text
VELNAR_Project/velnar/extension
```

---

### 6. Done! 🚀

Open:

```text
github.com
```

NEXORA is now ready.

---

# 🖥️ How to Use

Using NEXORA is simple.

1. Install the extension.
2. Open GitHub.
3. Click the **NEXORA icon** in your Chrome toolbar.
4. Select your favorite theme.
5. Customize it however you want.
6. Enjoy your new GitHub experience.

For advanced customization, open the NEXORA settings dashboard.

---

# 🛠️ Create Your Own Theme

Open:

```text
NEXORA → Settings → Theme Builder
```

Customize your colors and visual settings.

Give your theme a name and apply it.

Changes are applied immediately.

---

# 📂 Project Structure

```text
VELNAR_Project/
│
└── velnar/
    │
    ├── extension/
    │   ├── manifest.json
    │   │
    │   ├── background/
    │   │
    │   ├── content/
    │   │
    │   ├── popup/
    │   │
    │   ├── options/
    │   │
    │   ├── themes/
    │   │
    │   ├── components/
    │   │
    │   ├── utils/
    │   │
    │   ├── styles/
    │   │
    │   └── icons/
    │
    ├── assets/
    ├── landing/
    ├── scripts/
    │
    ├── README.md
    ├── CHANGELOG.md
    ├── CONTRIBUTING.md
    ├── SECURITY.md
    └── LICENSE
```

---

# 💻 Technology

NEXORA is built using:

* HTML
* CSS
* JavaScript
* Chrome Extension APIs
* Manifest V3
* Python utility scripts

The extension itself does not require a framework or build system.

---

# 🚧 Roadmap

NEXORA will continue to improve.

Planned ideas include:

* [x] Three new themes in 2.5.0
* [x] Configurable code tab width
* [x] Start a Theme Builder draft from any built-in palette
* [x] Export personal palettes directly from the library
* [ ] Chrome Web Store release
* [x] Firefox support through temporary installation

---

# 🐛 Found a Bug?

If something isn't working correctly, open an Issue.

Please include:

* Chrome version
* NEXORA version
* Description of the problem
* Steps to reproduce it
* Screenshot or video if possible

---

# 🤝 Contributing

Contributions are welcome.

If you want to improve NEXORA:

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Commit your changes
5. Push the branch
6. Open a Pull Request

---

# ⭐ Support NEXORA

If you like NEXORA and want to support the project:

### Give the repository a ⭐

It helps more developers discover the project and supports future development.

---

# 📄 License

NEXORA is released under the **MIT License**.

See the `LICENSE` file for more information.

---

# 🇮🇷 فارسی

## NEXORA چیست؟

**NEXORA** افزونه‌ای برای Chrome، Edge و Firefox است که ظاهر GitHub را شخصی‌سازی می‌کند.

اگر از ظاهر همیشگی GitHub خسته شده‌اید، NEXORA به شما امکان می‌دهد با استفاده از تم‌ها، رنگ‌ها، فونت‌ها و تنظیمات مختلف محیط GitHub را مطابق سلیقه خودتان تغییر دهید.

این تغییرات فقط مربوط به ظاهر GitHub هستند و عملکرد اصلی GitHub را تغییر نمی‌دهند.

> GitHub خودت را بساز.

---

## 🔥 امکانات NEXORA

### 🎨 ۴۸ تم آماده

NEXORA دارای مجموعه بزرگی از تم‌های مختلف است؛ از تم‌های ساده و حرفه‌ای گرفته تا تم‌های Gaming و RGB.

از جمله:

* Dark
* Light
* Midnight
* AMOLED
* Dracula
* Nord
* Monokai
* Tokyo Night
* Cyberpunk
* Catppuccin
* Synthwave
* Gaming Themes
* Vivid Themes
* و موارد دیگر

---

### 🎮 تم‌های Gaming و RGB

اگر به ظاهر Gaming علاقه دارید، NEXORA دارای تم‌هایی با پالت‌های ثابت با الهام از RGB است.

با این قابلیت می‌توانید ظاهر GitHub را با ستاپ گیمینگ خود هماهنگ کنید.

---

### ✨ تم‌های ثابت و سبک

موشن‌ها، کاراکترهای متحرک و موتورهای انیمیشن حذف شده‌اند تا تم‌ها با پردازش کمتر روی گیت‌هاب اجرا شوند. همه تم‌ها همچنان در دسترس هستند.

---

### 🛠️ Theme Builder حرفه‌ای

اگر تم‌های آماده کافی نیستند، تم خودتان را بسازید.

NEXORA امکان شخصی‌سازی **۳۰ رنگ مختلف** را در اختیارتان قرار می‌دهد.

می‌توانید بخش‌هایی مثل:

* پس‌زمینه
* متن
* دکمه‌ها
* لینک‌ها
* Border
* Code
* Status
* Accent

را شخصی‌سازی کنید.

همچنین امکان تغییر:

* Border Radius
* Shadow
* شدت افکت‌ها

وجود دارد.

---

### کتابخانه تم‌های شخصی و پیش‌نویس

تا **۵۰ تم شخصی** را در بخش «تم‌های من» ذخیره کنید، نامشان را تغییر دهید، ویرایش کنید یا از آن‌ها کپی بسازید. ویرایش یا حذف تم ذخیره‌شده، نسخه‌ای را که روی گیت‌هاب فعال است تغییر نمی‌دهد.

ساخت تم دارای ذخیره خودکار پیش‌نویس و بازیابی پس از بستن پنل است. با انتخاب یک رنگ اصلی، پالت روشن یا تیره بسازید و سپس هرکدام از ۳۰ رنگ را تغییر دهید. بررسی خوانایی شامل متن اصلی و فرعی، لینک‌ها، دکمه‌ها، وضعیت‌ها و خطوط اضافه‌شده و حذف‌شده است. برای رنگ‌های کم‌خوانا، در صورت امکان رنگ جایگزین پیشنهاد می‌شود؛ رنگ‌های شفاف بدون سطح زیرین مشخص اندازه‌گیری نمی‌شوند.

نمای «بازبینی کد» امکان مقایسه Diff و کامنت‌ها را قبل از اعمال تم فراهم می‌کند. **۲۰ تغییر آخر ظاهر** روی مرورگر باقی می‌مانند و از تنظیمات قابل بازیابی‌اند. بازیابی یک مورد، همان مورد و موارد جدیدتر تاریخچه را حذف می‌کند؛ کتابخانه، پیش‌نویس، علاقه‌مندی‌ها و زبان حفظ می‌شوند. بازنشانی کامل تنظیمات، تاریخچه را هم پاک می‌کند.

از **تنظیمات ← زبان رابط** فارسی یا انگلیسی را انتخاب کنید. رابط فارسی راست‌به‌چپ است و کدها چپ‌به‌راست می‌مانند. پشتیبان کامل شامل تم‌های شخصی، پیش‌نویس، تاریخچه و زبان است. سقف حجم فایل ورودی JSON دو مگابایت است.

---

### 🧩 کنترل جداگانه بخش‌های GitHub

NEXORA به شما اجازه می‌دهد مشخص کنید کدام قسمت‌های GitHub تغییر کنند.

مثل:

* Navbar
* Sidebar
* Repository
* Buttons
* Search
* Inputs
* Code
* Markdown
* Issues
* Pull Requests
* Profile
* Notifications
* Commits
* File Explorer
* Menus
* Contribution Graph

هر بخشی را که نخواهید می‌توانید غیرفعال کنید.

---

### 🔤 شخصی‌سازی فونت

می‌توانید Typography گیت‌هاب را هم تغییر دهید.

از جمله:

* نوع فونت
* اندازه فونت
* ضخامت فونت
* فاصله خطوط
* فونت مخصوص Code

---

### 🌙 حالت Dark خودکار

NEXORA می‌تواند Light/Dark Mode سیستم شما را تشخیص دهد و بر اساس آن تم را به‌صورت خودکار تغییر دهد.

---

### ⭐ تم‌های موردعلاقه

تم‌هایی که بیشتر استفاده می‌کنید را Favorite کنید تا سریع‌تر به آن‌ها دسترسی داشته باشید.

---

### 🎲 انتخاب تصادفی تم

اگر نمی‌دانید کدام تم را انتخاب کنید، NEXORA می‌تواند یک تم را به‌صورت تصادفی برایتان فعال کند.

---

### 🎨 Custom CSS

اگر کاربر حرفه‌ای هستید می‌توانید CSS دلخواه خودتان را هم وارد کنید و ظاهر GitHub را فراتر از تنظیمات آماده تغییر دهید.

---

### 📦 Import / Export

تم‌ها و تنظیمات خودتان را ذخیره کنید.

NEXORA از موارد زیر پشتیبانی می‌کند:

* Export Theme
* Import Theme
* Backup Settings
* Restore Settings

---

## ⌨️ میانبرهای کیبورد

```text
Ctrl + Shift + G
```

فعال یا غیرفعال کردن NEXORA

```text
Alt + Shift + R
```

انتخاب یک تم تصادفی

---

# 🔐 حریم خصوصی

NEXORA با رویکرد **Local-First** طراحی شده است.

یعنی تنظیمات شما روی سیستم خودتان ذخیره می‌شوند.

NEXORA دارای:

* ❌ تبلیغات نیست
* ❌ سیستم Tracking ندارد
* ❌ Analytics ندارد
* ❌ اطلاعات غیرضروری جمع‌آوری نمی‌کند
* ❌ GitHub Token شما را ذخیره نمی‌کند
* ❌ Session گیت‌هاب شما را ذخیره نمی‌کند

تنظیمات NEXORA به‌صورت Local داخل مرورگر ذخیره می‌شوند.

---

# 📥 آموزش نصب

در حال حاضر NEXORA از طریق GitHub قابل نصب است.

### مرحله ۱

Repository را دانلود کنید یا Clone بگیرید:

```bash
git clone https://github.com/MaJiD-PiXeL/VELNAR_Project.git
```

همچنین می‌توانید از:

```text
Code → Download ZIP
```

استفاده کنید.

---

### مرحله ۲

در Google Chrome وارد آدرس زیر شوید:

```text
chrome://extensions/
```

---

### مرحله ۳

گزینه:

```text
Developer mode
```

را فعال کنید.

---

### مرحله ۴

روی:

```text
Load unpacked
```

کلیک کنید.

سپس پوشه زیر را انتخاب کنید:

```text
VELNAR_Project/velnar/extension
```

---

### مرحله ۵

تمام! 🚀

وارد GitHub شوید و از NEXORA استفاده کنید.

---

# 🖥️ نحوه استفاده

1. NEXORA را نصب کنید.
2. وارد GitHub شوید.
3. روی آیکون NEXORA در Chrome کلیک کنید.
4. تم موردنظر را انتخاب کنید.
5. در صورت نیاز وارد Settings شوید.
6. ظاهر GitHub را مطابق سلیقه خودتان تغییر دهید.

---

# 🚧 برنامه توسعه

در نسخه‌های بعدی قابلیت‌های بیشتری برای NEXORA در نظر گرفته می‌شود.

* [x] سه تم تازه در نسخهٔ ۲٫۵٫۰
* [x] تنظیم عرض تورفتگی تب در کد
* [x] شروع پیش‌نویس Theme Builder از هر پالت آماده
* [x] خروجی مستقیم پالت‌های شخصی از کتابخانه
* [ ] انتشار در Chrome Web Store
* [x] پشتیبانی از نصب موقت در Firefox

---

# 🐛 گزارش باگ

اگر مشکلی در NEXORA پیدا کردید، از قسمت **Issues** همین Repository گزارش کنید.

در صورت امکان این موارد را هم ذکر کنید:

* نسخه Chrome
* نسخه NEXORA
* توضیح مشکل
* مراحل ایجاد مشکل
* Screenshot یا Video

---

# 🤝 مشارکت

اگر برنامه‌نویس هستید و می‌خواهید در توسعه NEXORA مشارکت کنید، Pull Requestهای شما خوش‌آمد هستند.

---

# ⭐ حمایت از پروژه

اگر NEXORA برایتان جالب یا کاربردی بود، با دادن یک **Star ⭐** از پروژه حمایت کنید.

این کار باعث بیشتر دیده‌شدن پروژه و ادامه توسعه آن می‌شود.

---

<div align="center">

## ⚡ NEXORA

**Make GitHub yours.**

Made with ❤️ by **MaJiD-PiXeL**

⭐ Star • 🍴 Fork • 🐛 Report • 🤝 Contribute

</div>
