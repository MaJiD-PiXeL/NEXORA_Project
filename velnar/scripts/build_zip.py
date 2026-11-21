"""Build the Chromium and Firefox distribution archives from the same source."""
import json
from pathlib import Path
from tempfile import NamedTemporaryFile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SRC_DIR = ROOT / "extension"
DIST_DIR = ROOT / "dist"
FIREFOX_BACKGROUND = [
    "utils/constants.js",
    "themes/presets.js",
    "utils/validator.js",
    "utils/storage.js",
    "background/handlers.js",
]


def firefox_manifest(manifest):
    result = manifest.copy()
    del result["minimum_chrome_version"]
    result["background"] = {"scripts": FIREFOX_BACKGROUND}
    result["browser_specific_settings"] = {
        "gecko": {
            "id": "nexora@majid-pixel.github.io",
            "strict_min_version": "128.0",
            "data_collection_permissions": {"required": ["none"]},
        }
    }
    return json.dumps(result, ensure_ascii=False, indent=2) + "\n"


def package(filename, manifest_override=None):
    output = DIST_DIR / filename
    with NamedTemporaryFile(dir=DIST_DIR, suffix=".zip.tmp", delete=False) as temporary:
        pending = Path(temporary.name)
    try:
        with zipfile.ZipFile(pending, "w", zipfile.ZIP_DEFLATED) as archive:
            for source in sorted(SRC_DIR.rglob("*")):
                if not source.is_file():
                    continue
                name = source.relative_to(SRC_DIR).as_posix()
                if manifest_override is not None:
                    if name == "background/service-worker.js":
                        continue
                    if name == "manifest.json":
                        archive.writestr(name, manifest_override)
                        continue
                archive.write(source, name)
        pending.replace(output)
    finally:
        pending.unlink(missing_ok=True)
    print(f"built: {output}")


def build():
    DIST_DIR.mkdir(exist_ok=True)
    manifest = json.loads((SRC_DIR / "manifest.json").read_text(encoding="utf-8-sig"))
    if len(manifest["description"]) > 132:
        raise ValueError("Manifest description exceeds 132 characters")
    for file in FIREFOX_BACKGROUND:
        if not (SRC_DIR / file).is_file():
            raise FileNotFoundError(file)
    package("nexora-extension.zip")
    package("nexora-firefox.zip", firefox_manifest(manifest))


if __name__ == "__main__":
    build()
