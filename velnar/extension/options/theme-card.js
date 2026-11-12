globalThis.NEXORA = globalThis.NEXORA || {};

NEXORA.ThemeCard = {
  async create({ name, colors }) {
    await document.fonts.load('600 48px "Vazirmatn"', name);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    function box(color, x, y, width, height, radius = 0) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fill();
    }
    function text(value, color, font, x, y, maxWidth) {
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.fillText(value, x, y, maxWidth);
    }

    box("#11151d", 0, 0, 1200, 630);
    const stripe = ctx.createLinearGradient(0, 0, 1200, 0);
    stripe.addColorStop(0, colors.accent);
    stripe.addColorStop(1, colors.accentSecondary);
    box(stripe, 0, 0, 1200, 8);
    ctx.direction = "ltr";
    text("NEXORA  /  THEME CARD", "#bcc8de", "600 19px system-ui", 56, 62, 700);
    const rtl = /^[^\p{L}]*\p{Script=Arabic}/u.test(name);
    ctx.direction = rtl ? "rtl" : "ltr";
    text(name, "#f4f6fb", '600 48px "Vazirmatn", system-ui', rtl ? 1144 : 56, 131, 1088);
    ctx.direction = "ltr";

    box(colors.border, 56, 164, 1088, 320, 18);
    box(colors.background, 58, 166, 1084, 316, 16);
    box(colors.backgroundSecondary, 74, 182, 1052, 84, 10);
    text("CODE REVIEW   /   #42", colors.textSecondary, "600 17px system-ui", 98, 213, 990);
    text("Improve theme readability", colors.textPrimary, "600 25px system-ui", 98, 246, 990);
    box(colors.codeBackground, 74, 278, 1052, 186, 10);
    text("src/theme.ts", colors.codeText, "18px monospace", 98, 314, 990);
    const rows = [
      ["−", "const contrast = 2.1;", colors.error],
      ["+", "const contrast = 4.5;", colors.success],
      ["+", "ensureReadable(theme);", colors.success]
    ];
    rows.forEach(([sign, line, color], index) => {
      const y = 330 + 40 * index;
      ctx.globalAlpha = 0.18;
      box(color, 86, y, 1028, 34, 4);
      ctx.globalAlpha = 1;
      box(color, 86, y, 4, 34, 2);
      text(`${sign}  ${line}`, colors.codeText, "21px monospace", 102, y + 24, 980);
    });

    const swatches = ["background", "backgroundSecondary", "textPrimary", "accent", "accentSecondary", "success"];
    swatches.forEach((key, index) => {
      const x = 56 + index * 184;
      box("#343d50", x, 513, 168, 68, 9);
      box("#11151d", x + 1, 514, 166, 66, 8);
      box(colors[key], x + 1, 514, 166, 66, 8);
    });

    return new Promise((resolve, reject) => canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the PNG card."));
    }, "image/png"));
  }
};
