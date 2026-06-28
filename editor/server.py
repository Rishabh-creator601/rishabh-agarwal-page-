#!/usr/bin/env python3
"""
Local editor server for the Rishabh Agarwal site.

Run it by double-clicking open-editor.bat (or: python server.py).
It serves the project so the editor can:
  • preview videos (HTTP Range support),
  • upload a video/image straight into assets/ (browse & save),
  • save your changes directly back into data.js.

This is a LOCAL tool only. It binds to 127.0.0.1 and is never deployed.
"""
import http.server
import os
import re
import json
import base64
import hmac
import threading
import time
import webbrowser
import urllib.parse

EDITOR_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(EDITOR_DIR, ".."))   # the site/content folder
PORT = 8799
ALLOWED_FOLDERS = {"videos": "assets/videos", "projects": "assets/projects"}


def load_env():
    """Read KEY=VALUE pairs from the project-root .env file (local only)."""
    creds = {}
    envp = os.path.join(ROOT, ".env")
    if os.path.isfile(envp):
        with open(envp, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                creds[k.strip()] = v.strip()
    return creds


_ENV = load_env()
# NOTE: we read from the .env FILE (not process env) because on Windows the
# USERNAME variable is reserved by the OS and would shadow our editor login.
AUTH_USER = _ENV.get("USERNAME")
AUTH_PASS = _ENV.get("PASSWORD")
AUTH_ON = bool(AUTH_USER and AUTH_PASS)


def sanitize(name):
    """Turn an arbitrary upload name into a safe, web-friendly filename."""
    name = name.strip().replace("\\", "/").split("/")[-1].lower()
    base, dot, ext = name.rpartition(".")
    if not dot:
        base, ext = name, ""
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-") or "file"
    ext = re.sub(r"[^a-z0-9]+", "", ext)
    return base + ("." + ext if ext else "")


class _Ranged:
    """Wraps a file so copyfile() sends only `length` bytes (for HTTP 206)."""
    def __init__(self, f, length):
        self.f = f
        self.remaining = length
    def read(self, n=-1):
        if self.remaining <= 0:
            return b""
        if n < 0 or n > self.remaining:
            n = self.remaining
        d = self.f.read(n)
        self.remaining -= len(d)
        return d
    def close(self):
        self.f.close()


class Handler(http.server.SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, fmt, *args):
        pass  # keep the console quiet

    # ---- login gate (HTTP Basic Auth) for /editor and /api ----
    @staticmethod
    def _is_protected(path):
        p = urllib.parse.urlparse(path).path
        return p.startswith("/editor") or p.startswith("/api")

    def _check_auth(self):
        if not AUTH_ON:
            return True
        hdr = self.headers.get("Authorization", "")
        if hdr.startswith("Basic "):
            try:
                u, _, p = base64.b64decode(hdr[6:]).decode("utf-8").partition(":")
                if hmac.compare_digest(u, AUTH_USER) and hmac.compare_digest(p, AUTH_PASS):
                    return True
            except Exception:
                pass
        body = b"Authentication required."
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Site Editor"')
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)
        return False

    def end_headers(self):
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # ---- GET with Range support (so video previews work) ----
    def send_head(self):
        if self._is_protected(self.path) and not self._check_auth():
            return None
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()
        rng = self.headers.get("Range")
        ctype = self.guess_type(path)
        fs = os.path.getsize(path)
        if not rng:
            f = open(path, "rb")
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(fs))
            self.end_headers()
            return f
        m = re.match(r"bytes=(\d*)-(\d*)", rng)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else fs - 1
        end = min(end, fs - 1)
        if start > end or start >= fs:
            self.send_response(416)
            self.send_header("Content-Range", "bytes */%d" % fs)
            self.end_headers()
            return None
        length = end - start + 1
        f = open(path, "rb")
        f.seek(start)
        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, fs))
        self.send_header("Content-Length", str(length))
        self.end_headers()
        return _Ranged(f, length)

    # ---- API: upload a file / save data.js ----
    def do_POST(self):
        if not self._check_auth():
            return
        parsed = urllib.parse.urlparse(self.path)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""

        if parsed.path == "/api/upload":
            qs = urllib.parse.parse_qs(parsed.query)
            folder = qs.get("folder", ["videos"])[0]
            rawname = qs.get("name", ["file"])[0]
            rel = ALLOWED_FOLDERS.get(folder, "assets/videos")
            os.makedirs(os.path.join(ROOT, rel), exist_ok=True)
            fname = sanitize(rawname)
            with open(os.path.join(ROOT, rel, fname), "wb") as f:
                f.write(body)
            return self._json({"ok": True, "path": rel + "/" + fname, "bytes": len(body)})

        if parsed.path == "/api/save":
            with open(os.path.join(ROOT, "data.js"), "wb") as f:
                f.write(body)
            return self._json({"ok": True, "bytes": len(body)})

        self.send_error(404)

    def _json(self, obj):
        b = json.dumps(obj).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)


def open_browser():
    time.sleep(0.8)
    webbrowser.open("http://127.0.0.1:%d/editor/admin.html" % PORT)


def main():
    try:
        httpd = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError as e:
        print("\nCould not start on port %d (%s)." % (PORT, e))
        print("The editor may already be open in another window.")
        webbrowser.open("http://127.0.0.1:%d/editor/admin.html" % PORT)
        input("\nPress Enter to close...")
        return
    print("=" * 52)
    print("  Site editor is running.")
    print("  Editor : http://127.0.0.1:%d/editor/admin.html" % PORT)
    print("  Preview: http://127.0.0.1:%d/index.html" % PORT)
    print("  Editing folder: %s" % ROOT)
    if AUTH_ON:
        print("  Login  : ON  (user: %s)  -- from .env" % AUTH_USER)
    else:
        print("  Login  : OFF (no USERNAME/PASSWORD in .env)")
    print("-" * 52)
    print("  Keep this window OPEN while editing.")
    print("  Close it (or press Ctrl+C) when you're done.")
    print("=" * 52)
    threading.Thread(target=open_browser, daemon=True).start()
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nEditor stopped.")


if __name__ == "__main__":
    main()
