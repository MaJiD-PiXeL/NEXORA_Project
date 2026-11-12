globalThis.NEXORA = globalThis.NEXORA || {};

// Only extension UI is localized. User theme names and source code are preserved.
NEXORA.I18n = {
  language: "en",
  messages: {
    "A personal palette with translucent surfaces.": "پالت شخصی با سطوح نیمه‌شفاف.",
    "Search themes…": "جستجوی تم‌ها…", "Use a hex color.": "از رنگ هگز استفاده کنید.", "Use a hex or rgb/rgba color.": "از رنگ هگز یا rgb/rgba استفاده کنید.",
    "Theme must be a JSON object.": "تم باید یک شیء JSON باشد.", "Theme colors must be an object.": "رنگ‌های تم باید یک شیء باشند.", "No recognized theme colors were found.": "رنگ شناخته‌شده‌ای برای تم پیدا نشد.",
    "Theme name must be under 80 characters.": "نام تم باید حداکثر ۸۰ نویسه داشته باشد.", "This file is not a settings backup.": "این فایل پشتیبان تنظیمات نیست.",
    "CSS must be text.": "CSS باید متن باشد.", "CSS must be under 50,000 characters.": "CSS باید حداکثر ۵۰ هزار نویسه داشته باشد.", "CSS braces are not balanced.": "آکولادهای CSS متوازن نیستند.",
    "External resources and executable content are not allowed. Use local CSS rules only.": "منابع خارجی و محتوای اجرایی مجاز نیستند. فقط از قواعد CSS محلی استفاده کنید.",
    "Unable to save settings.": "ذخیره تنظیمات ممکن نشد.", "Something went wrong. Please try again.": "مشکلی رخ داد. دوباره تلاش کنید.",
    "Public": "عمومی", "Pull requests": "درخواست‌های ادغام", "Refine the details": "بهبود جزئیات", "Build something useful": "ساخت چیزی کاربردی", "Getting started": "شروع کار", "Update dependencies": "به‌روزرسانی وابستگی‌ها",
    "A place for your next idea.": "جایی برای ایده بعدی شما.", "Thoughtfully built. Ready to make your own.": "با دقت ساخته شده؛ آماده شخصی‌سازی شما.", "Open source": "متن‌باز", "Overview": "نمای کلی",
    "Small details. Better experiences.": "جزئیات کوچک، تجربه‌های بهتر.", "Working on what comes next.": "در حال ساخت قدم بعدی.", "Thoughtful components for the web.": "بخش‌هایی با طراحی دقیق برای وب.", "Contributions this year": "مشارکت‌های امسال", "Less": "کمتر", "More": "بیشتر",
    "NEXORA — GitHub Studio": "NEXORA — استودیوی گیت‌هاب", "Beyond what exists.": "فراتر از آنچه هست.",
    "NEXORA Settings": "تنظیمات NEXORA", "WORKSPACE": "محیط کار", "Workspace": "محیط کار", "Preferences": "ترجیحات",
    "Themes": "تم‌ها", "Theme Builder": "ساخت تم", "Typography": "تایپوگرافی", "Components": "بخش‌ها", "Custom CSS": "CSS سفارشی",
    "Import / Export": "ورود و خروجی", "Settings": "تنظیمات", "About": "درباره", "About NEXORA": "درباره NEXORA",
    "Active on GitHub": "فعال روی گیت‌هاب", "Paused": "متوقف", "Extension paused": "افزونه متوقف است", "Stored on this device": "ذخیره روی این دستگاه",
    "Appearance": "ظاهر", "Your GitHub, with your attention to detail.": "گیت‌هاب شما، با سلیقه شما.", "↶ Undo change": "↶ بازگردانی تغییر", "Undo theme": "بازگردانی ظاهر",
    "System appearance is on. Applying a theme switches to manual mode.": "ظاهر خودکار فعال است. اعمال تم، حالت دستی را فعال می‌کند.",
    "System appearance is on. Choosing a theme switches to manual mode.": "ظاهر خودکار فعال است. انتخاب تم، حالت دستی را فعال می‌کند.",
    "Use manual mode": "حالت دستی", "turn it off": "غیرفعال کردن", "Current theme": "تم فعلی", "Edit palette ↗": "ویرایش پالت ↗",
    "Search themes": "جستجوی تم‌ها", "Find your theme…": "تم خود را پیدا کنید…", "Sort themes": "مرتب‌سازی تم‌ها", "Collection order": "ترتیب مجموعه‌ها",
    "Name A–Z": "بر اساس نام", "Favorites first": "ابتدا علاقه‌مندی‌ها", "All": "همه", "All themes": "همه تم‌ها", "Saved": "علاقه‌مندی‌ها", "★ Saved": "★ علاقه‌مندی‌ها",
    "Official": "رسمی", "Community": "جامعه کاربران", "Cinematic": "سینمایی", "Gaming": "بازی", "Vivid": "درخشان", "My themes": "تم‌های من",
    "official": "رسمی", "community": "جامعه کاربران", "cinematic": "سینمایی", "gaming": "بازی", "vivid": "درخشان", "personal": "شخصی",
    "Theme appearance": "نوع ظاهر تم", "Light & dark": "روشن و تیره", "Dark only": "فقط تیره", "Light only": "فقط روشن", "Dark": "تیره", "Light": "روشن",
    "No matching themes": "تمی پیدا نشد", "Try another search or save a favorite.": "عبارت دیگری جستجو کنید یا تمی به علاقه‌مندی‌ها اضافه کنید.", "Clear filters": "پاک کردن فیلترها",
    "All palettes are included. Make one your own.": "همه پالت‌ها در دسترس‌اند. پالت خودتان را بسازید.", "Shuffle theme ↗": "تم تصادفی ↗", "↝ Shuffle": "↝ تم تصادفی",
    "Preview": "پیش‌نمایش", "Not applied": "اعمال نشده", "Preview only": "فقط پیش‌نمایش", "Repository": "مخزن", "Code": "کد", "Profile": "پروفایل", "Code Review": "بازبینی کد",
    "Text contrast": "کنتراست متن", "Collection": "مجموعه", "Apply theme": "اعمال تم", "Applied to GitHub": "روی گیت‌هاب اعمال شده", "Compare with current": "مقایسه با تم فعلی",
    "Previewing keeps your current theme unchanged.": "پیش‌نمایش، تم فعلی را تغییر نمی‌دهد.", "Compare appearance": "مقایسه ظاهر", "The same workspace. Two different palettes.": "یک محیط کار، با دو پالت متفاوت.",
    "CURRENT": "فعلی", "PREVIEW": "پیش‌نمایش", "Changes apply only when you choose Apply theme.": "تغییرات پس از انتخاب «اعمال تم» اجرا می‌شوند.",
    "Adjust all 30 colors, preview your palette below, then apply it to GitHub.": "۳۰ رنگ را تنظیم کنید، نتیجه را ببینید و روی گیت‌هاب اعمال کنید.",
    "Theme name": "نام تم", "Apply Custom Theme": "اعمال تم سفارشی", "Start from active theme": "شروع از تم فعال", "Save to library": "ذخیره در کتابخانه", "Save a copy": "ذخیره یک کپی",
    "Update saved theme": "به‌روزرسانی تم ذخیره‌شده", "Edit / Rename": "ویرایش / تغییر نام", "Delete": "حذف", "Seed color": "رنگ اصلی", "Palette appearance": "ظاهر پالت",
    "Generate matching colors": "تولید رنگ‌های هماهنگ", "Discard draft": "حذف پیش‌نویس", "Your next idea starts here.": "ایده بعدی شما از اینجا شروع می‌شود.",
    "A live preview of your text, surface and accent colors.": "پیش‌نمایش زنده رنگ متن، سطوح و رنگ شاخص.", "Explore a repository": "مشاهده یک مخزن", "Primary action": "عملیات اصلی",
    "Readability checks": "بررسی خوانایی", "Checks use a 4.5:1 target. Transparent colors cannot be measured without a known surface.": "هدف بررسی، نسبت ۴٫۵ به ۱ است. رنگ شفاف بدون سطح زیرین مشخص قابل اندازه‌گیری نیست.",
    "Surfaces": "سطوح", "Text": "متن", "Interactive": "تعامل‌ها", "Borders, Overlays & Code": "حاشیه‌ها، لایه‌ها و کد", "Status Colors": "رنگ وضعیت‌ها", "Advanced": "پیشرفته",
    "Border Radius (px)": "گردی گوشه‌ها (پیکسل)", "Shadow Intensity": "شدت سایه", "Background": "پس‌زمینه", "Background Secondary": "پس‌زمینه دوم", "Background Tertiary": "پس‌زمینه سوم",
    "Hover Background": "پس‌زمینه اشاره‌گر", "Active Background": "پس‌زمینه فعال", "Repo Background": "پس‌زمینه مخزن", "Sidebar Background": "پس‌زمینه نوار کناری", "Navbar Background": "پس‌زمینه نوار بالا",
    "Text Primary": "متن اصلی", "Text Secondary": "متن فرعی", "Text Tertiary": "متن کم‌رنگ", "Navbar Text": "متن نوار بالا", "Code Text": "متن کد", "Link": "لینک", "Link Hover": "لینک زیر اشاره‌گر",
    "Button": "دکمه", "Button Text": "متن دکمه", "Button Hover": "دکمه زیر اشاره‌گر", "Accent": "رنگ شاخص", "Accent Secondary": "رنگ شاخص دوم", "Border": "حاشیه", "Border Muted": "حاشیه کم‌رنگ",
    "Code Background": "پس‌زمینه کد", "Dropdown Background": "پس‌زمینه منو", "Tooltip Background": "پس‌زمینه راهنما", "Scrollbar Thumb": "دستگیره پیمایش", "Shadow": "سایه", "Success": "موفقیت", "Warning": "هشدار", "Error": "خطا",
    "Primary text": "متن اصلی", "Primary text on cards": "متن اصلی روی کارت‌ها", "Secondary text": "متن فرعی", "Secondary text on cards": "متن فرعی روی کارت‌ها", "Muted text": "متن کم‌رنگ",
    "Links": "لینک‌ها", "Links on cards": "لینک روی کارت‌ها", "Hovered links": "لینک زیر اشاره‌گر", "Button text": "متن دکمه", "Hovered button text": "متن دکمه زیر اشاره‌گر",
    "Added lines": "خطوط اضافه‌شده", "Deleted lines": "خطوط حذف‌شده", "Navbar text": "متن نوار بالا", "Success status": "وضعیت موفقیت", "Warning status": "وضعیت هشدار", "Error status": "وضعیت خطا",
    "Not measured": "اندازه‌گیری نشده", "Meets AA": "مطابق AA", "Below AA": "کمتر از AA", "Adjust the surface colors": "رنگ سطوح را تغییر دهید",
    "Fine-tune reading comfort. Fonts must already be installed on your device.": "خوانایی را تنظیم کنید. فونت‌ها باید روی دستگاه شما نصب باشند.",
    "READING PREVIEW": "پیش‌نمایش خوانایی", "Good design gets out of your way.": "طراحی خوب، مسیر کار شما را هموار می‌کند.",
    "A comfortable workspace makes room for your best ideas. Adjust your typography and see how it reads, right here.": "محیط کار راحت به ایده‌ها جا می‌دهد. فونت را تنظیم کنید و خوانایی آن را همین‌جا ببینید.",
    "Comfortable reading": "خواندن راحت", "Default typography": "فونت پیش‌فرض", "Font Family": "خانواده فونت", "Code Font": "فونت کد", "Font Size (px)": "اندازه فونت (پیکسل)", "Line Height": "ارتفاع خط", "Font Weight": "وزن فونت",
    "Choose which component styles to apply. Page background, typography and your custom CSS are global.": "بخش‌های موردنظر را انتخاب کنید. پس‌زمینه صفحه، فونت و CSS سفارشی به‌صورت سراسری اعمال می‌شوند.",
    "Search components": "جستجوی بخش‌ها", "Find a component…": "جستجوی یک بخش…", "No components match this search.": "بخشی با این عبارت پیدا نشد.", "Enable All": "فعال کردن همه", "Disable All": "غیرفعال کردن همه",
    "Navbar": "نوار بالا", "Sidebar": "نوار کناری", "Repository Cards": "کارت‌های مخزن", "Buttons": "دکمه‌ها", "Inputs": "ورودی‌ها", "Search Box": "جعبه جستجو", "Code Blocks": "بلوک‌های کد", "Markdown": "مارک‌داون",
    "Issues": "ایشوها", "Pull Requests": "درخواست‌های ادغام", "Followers/Following": "دنبال‌کنندگان / دنبال‌شوندگان", "Notifications": "اعلان‌ها", "Commit List": "فهرست کامیت‌ها", "File Explorer": "مرورگر فایل", "Dropdowns & Menus": "منوها", "Diffs & Code Review": "تفاوت‌ها و بازبینی کد", "Contribution Graph": "نمودار مشارکت",
    "Add your own CSS. External resources and imports are blocked to keep your browsing private.": "CSS دلخواه خود را اضافه کنید. منابع خارجی و import برای حفظ حریم خصوصی مسدود هستند.",
    "Enable Custom CSS": "فعال کردن CSS سفارشی", "Validate & Apply": "بررسی و اعمال", "Reset Custom CSS": "بازنشانی CSS سفارشی",
    "Take your palette with you. Export a theme or back up your complete setup.": "از تم خروجی بگیرید یا تمام تنظیمات را پشتیبان‌گیری کنید.", "Export Theme": "خروجی تم", "Save the colors of your global theme.": "رنگ‌های تم سراسری را ذخیره کنید.",
    "Export Theme JSON": "خروجی JSON تم", "Import Theme": "ورود تم", "Choose an exported theme. Imported colors are checked before saving.": "فایل خروجی تم را انتخاب کنید. رنگ‌ها پیش از ذخیره بررسی می‌شوند.", "Backup Settings": "پشتیبان تنظیمات",
    "Save your themes, typography, component choices and custom CSS.": "تم‌ها، فونت، انتخاب بخش‌ها و CSS سفارشی را ذخیره کنید.", "Backup All Settings": "پشتیبان‌گیری همه تنظیمات", "Restore Settings": "بازیابی تنظیمات", "Replace your current settings with a previous backup.": "تنظیمات فعلی را با پشتیبان قبلی جایگزین کنید.",
    "Import theme JSON": "ورود JSON تم", "Restore settings JSON": "بازیابی JSON تنظیمات", "Interface language / زبان رابط": "زبان رابط / Interface language",
    "Appearance history": "تاریخچه ظاهر", "The latest 20 appearance changes stay available after closing the panel. Restoring an entry also removes newer history entries.": "۲۰ تغییر آخر ظاهر پس از بستن پنل هم باقی می‌مانند. بازیابی هر مورد، موارد جدیدتر تاریخچه را حذف می‌کند.",
    "Restore": "بازیابی", "No appearance changes yet.": "هنوز تغییری در ظاهر ثبت نشده است.", "Enable Extension": "فعال کردن افزونه", "Enable Custom Theme": "فعال کردن تم سفارشی",
    "Auto Dark Mode (follow system light/dark)": "حالت تیره خودکار (مطابق سیستم)", "Light theme": "تم روشن", "Dark theme": "تم تیره", "Reset All Settings": "بازنشانی همه تنظیمات",
    "Enable extension": "فعال کردن افزونه", "Enable custom theme": "فعال کردن تم سفارشی", "Follow system theme": "پیروی از ظاهر سیستم", "Enable custom CSS": "فعال کردن CSS سفارشی",
    "CURRENT WORKSPACE": "محیط کار فعلی", "Theme library": "کتابخانه تم‌ها", "No themes here yet. Try another search or save a favorite.": "تمی وجود ندارد. عبارت دیگری جستجو کنید یا تمی به علاقه‌مندی‌ها اضافه کنید.",
    "Reset Theme": "بازنشانی تم", "Open Settings": "باز کردن تنظیمات", "Open interactive collection ↗": "باز کردن مجموعه تعاملی ↗", "Ctrl+Shift+G to toggle · Alt+Shift+R for random": "Ctrl+Shift+G فعال/غیرفعال · Alt+Shift+R تم تصادفی",
    "Draft recovered. Your active theme has not changed.": "پیش‌نویس بازیابی شد. تم فعال تغییر نکرده است.", "Changes are saved as a draft automatically.": "تغییرات به‌طور خودکار در پیش‌نویس ذخیره می‌شوند.", "Saving draft…": "در حال ذخیره پیش‌نویس…",
    "Draft saved. Your active theme has not changed.": "پیش‌نویس ذخیره شد. تم فعال تغییر نکرده است.", "Draft discarded.": "پیش‌نویس حذف شد.", "Personal theme saved to your library.": "تم شخصی در کتابخانه ذخیره شد.",
    "Personal theme deleted. The active appearance is unchanged.": "تم شخصی حذف شد. ظاهر فعال تغییر نکرده است.", "Previous appearance restored.": "ظاهر قبلی بازیابی شد.", "Layout saved.": "چیدمان ذخیره شد.", "Typography saved.": "فونت ذخیره شد.", "Custom CSS applied.": "CSS سفارشی اعمال شد.",
    "Settings restored.": "تنظیمات بازیابی شد.", "Theme imported and applied.": "تم وارد و اعمال شد.", "Default settings restored.": "تنظیمات پیش‌فرض بازیابی شد.", "Theme reset.": "تم بازنشانی شد.",
    "Create or import a custom theme first.": "ابتدا تم سفارشی بسازید یا وارد کنید.", "Fix invalid colors before saving.": "پیش از ذخیره، رنگ‌های نامعتبر را اصلاح کنید.", "Save up to 50 personal themes.": "حداکثر ۵۰ تم شخصی می‌توانید ذخیره کنید.",
    "Choose a JSON file smaller than 2 MB.": "فایل JSON کوچک‌تر از ۲ مگابایت انتخاب کنید.", "History entry no longer exists.": "این مورد دیگر در تاریخچه وجود ندارد.", "Personal theme no longer exists. Save a copy instead.": "تم شخصی دیگر وجود ندارد. یک کپی ذخیره کنید.",
    "Reset all NEXORA settings? Your personal themes, draft, history and CSS will be removed.": "همه تنظیمات NEXORA بازنشانی شوند؟ تم‌های شخصی، پیش‌نویس، تاریخچه و CSS حذف خواهند شد.",
    "A light palette for a clear workspace.": "پالت روشن برای یک محیط کار خوانا.", "A dark palette for focused work.": "پالت تیره برای تمرکز روی کار.",
    "Following system": "مطابق سیستم", "Manual appearance": "ظاهر دستی", "Static themes": "تم‌های ثابت", "Theme collections": "مجموعه تم‌ها", "Settings navigation": "پیمایش تنظیمات", "Theme preview": "پیش‌نمایش تم",
    "Preview surface": "سطح پیش‌نمایش", "Preview palette": "پالت پیش‌نمایش", "Preview colors": "رنگ‌های پیش‌نمایش", "Close comparison": "بستن مقایسه", "Use compact theme cards": "کارت‌های فشرده", "Use comfortable theme cards": "کارت‌های بزرگ‌تر",
    "Pull request · Files changed": "درخواست ادغام · فایل‌های تغییرکرده", "Improve theme readability": "بهبود خوانایی تم", "✓ All checks passed · Ready for review": "✓ همه بررسی‌ها موفق · آماده بازبینی",
    "Reviewer": "بازبین", "The updated colors are easier to read.": "رنگ‌های جدید خواناتر هستند.", "Comment on added lines": "نظر روی خطوط اضافه‌شده", "Resolve conversation": "بستن گفتگو",
    "GitHub tab controls": "کنترل‌های تب گیت‌هاب", "Preview on this page": "پیش‌نمایش روی همین صفحه", "Cancel preview": "لغو پیش‌نمایش",
    "Previewing on GitHub. Press Esc to cancel.": "پیش‌نمایش روی گیت‌هاب فعال است. برای لغو Esc بزنید.", "Choose a theme to preview it on this tab.": "تمی انتخاب کنید تا روی همین تب نمایش داده شود.",
    "Apply globally": "اعمال سراسری", "Only for this repo": "فقط برای این ریپو", "Use global theme": "استفاده از تم سراسری", "Review focus": "تمرکز در بازبینی",
    "Theme saved for this repository.": "تم برای این ریپو ذخیره شد.", "Global theme restored for this repository.": "تم سراسری برای این ریپو بازیابی شد.", "Global theme saved. This repo uses its own theme.": "تم سراسری ذخیره شد. این ریپو از تم خودش استفاده می‌کند.",
    "Save up to 100 repository themes.": "حداکثر برای ۱۰۰ ریپو می‌توانید تم ذخیره کنید.", "Invalid repository name.": "نام ریپو نامعتبر است.", "Invalid or duplicate repository name.": "نام ریپو نامعتبر یا تکراری است.",
    "Download PNG card": "دانلود کارت PNG", "Could not create the PNG card.": "ساخت کارت PNG ممکن نشد."
  },
  t(value) {
    if (this.language !== "fa" || typeof value !== "string") return value;
    const text = value.trim();
    let translated = this.messages[text];
    if (!translated) {
      const patterns = [
        [/^(\d+) themes$/, m => `${m[1]} تم`], [/^(\d+) of (\d+) components enabled$/, m => `${m[1]} از ${m[2]} بخش فعال`],
        [/^Apply (.+) theme$/, m => `اعمال تم ${m[1]}`], [/^Apply (.+)$/, m => `اعمال ${m[1]}`], [/^Favorite (.+)$/, m => `علاقه‌مندی ${m[1]}`],
        [/^Preview (.+)$/, m => `پیش‌نمایش ${m[1]}`], [/^Edit (.+)$/, m => `ویرایش ${m[1]}`], [/^Delete (.+)$/, m => `حذف ${m[1]}`], [/^Theme (.+)$/, m => `اعمال تم برای ${this.t(m[1])}`],
        [/^(.+) applied\.$/, m => `تم ${m[1]} اعمال شد.`], [/^Use (#[\da-f]+)$/i, m => `استفاده از ${m[1]}`], [/^Fix (.+)$/, m => `اصلاح ${this.t(m[1])}`],
        [/^(.+) color picker$/, m => `انتخاب رنگ ${this.t(m[1])}`], [/^(.+) color value$/, m => `مقدار رنگ ${this.t(m[1])}`],
        [/^Invalid color: (.+)\. Use hex or rgb\/rgba\.$/, m => `رنگ ${m[1]} نامعتبر است. از هگز یا rgb/rgba استفاده کنید.`],
        [/^Invalid setting: (.+)\.$/, m => `مقدار تنظیم ${m[1]} نامعتبر است.`],
        [/^([\d.]+:1) · (Meets AA|Below AA)$/, m => `${m[1]} · ${this.t(m[2])}`],
        [/^Text contrast ([\d.]+:1) · (.+)$/, m => `کنتراست متن ${m[1]} · ${m[2].startsWith("Meets") ? "مطابق AA برای متن معمولی" : "کمتر از AA؛ تفاوت رنگ متن و سطح را بیشتر کنید"}`],
        [/^Text contrast: use opaque colors to measure readability\.$/, () => "برای اندازه‌گیری خوانایی از رنگ‌های غیرشفاف استفاده کنید."],
        [/^(Active on GitHub|Extension paused) · (Following system|Manual appearance) · Static themes$/, m => `${this.t(m[1])} · ${this.t(m[2])} · تم‌های ثابت`],
        [/^NEXORA makes GitHub feel like your space\.(.+)Version ([\d.]+)\.$/, m => `NEXORA گیت‌هاب را مطابق سلیقه شما نمایش می‌دهد. تنظیمات در مرورگر می‌مانند؛ بدون حساب، آمارگیری یا ردیابی. نسخه ${m[2]}.`]
      ];
      for (const [pattern, render] of patterns) { const match = text.match(pattern); if (match) { translated = render(match); break; } }
    }
    return translated ? value.replace(text, translated) : value;
  },
  start(language) {
    if (this.started) { this.setLanguage(language); return; }
    this.started = true;
    this.originals = new WeakMap();
    this.attributes = new WeakMap();
    this.language = language;
    this.setLanguage(language, true);
    // Observe only extension UI updates, never any GitHub page.
    this.observer = new MutationObserver(records => {
      const roots = new Set(records.map(record => record.type === "characterData" ? record.target.parentElement : record.target));
      for (const root of roots) this.translate(root);
    });
    this.observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-label", "placeholder", "title"] });
  },
  setLanguage(language, force = false) {
    if (!force && language === this.language) return;
    this.language = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "fa" ? "rtl" : "ltr";
    this.originalTitle ||= document.title;
    document.title = this.t(this.originalTitle);
    this.translate(document.body);
  },
  translate(root) {
    if (!root || !this.originals) return;
    const skip = "script, style, code, pre, .sample-code, .sample-diff, .bilingual-preview, [data-i18n-skip], .gs-theme-name, .gs-swatch-name, #activeThemeName, #popupThemeName, #previewThemeName, #compareCurrentName, #comparePreviewName, #autoDarkLight, #autoDarkDark";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.parentElement?.closest(skip)) continue;
      const previous = this.originals.get(node);
      const source = previous && node.textContent === previous.rendered ? previous.source : node.textContent;
      const rendered = this.t(source);
      this.originals.set(node, { source, rendered });
      if (node.textContent !== rendered) node.textContent = rendered;
    }
    for (const element of [root, ...root.querySelectorAll("[aria-label], [placeholder], [title]")]) {
      if (!element.getAttribute || element.closest("[data-i18n-skip], script, style")) continue;
      const originals = this.attributes.get(element) || {};
      for (const attribute of ["aria-label", "placeholder", "title"]) {
        const value = element.getAttribute(attribute); if (value === null) continue;
        const previous = originals[attribute];
        const source = previous && value === previous.rendered ? previous.source : value;
        const rendered = this.t(source); originals[attribute] = { source, rendered };
        if (value !== rendered) element.setAttribute(attribute, rendered);
      }
      this.attributes.set(element, originals);
    }
  }
};
