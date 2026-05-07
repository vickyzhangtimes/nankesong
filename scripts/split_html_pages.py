# -*- coding: utf-8 -*-
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

MAPPING = [
    ("index.html", "landing"),
    ("login.html", "login"),
    ("product-demo-hub.html", "product-demo-hub"),
    ("company-onboarding.html", "company-onboarding"),
    ("enterprise-memory.html", "enterprise-memory"),
    ("demand-diagnosis.html", "demand-diagnosis"),
    ("job-agent-workbench-prototype.html", "job-agent-workbench-prototype"),
    ("job-agent-workbench-prototype.legacy.html", "job-agent-workbench-prototype-legacy"),
    ("job-agent-workbench.html", "job-agent-workbench"),
    ("job-agent-workbench-legacy.html", "job-agent-workbench-legacy"),
    ("agent-birth-card.html", "agent-birth-card"),
    ("agent-birth-card-share-demo.html", "agent-birth-card-share-demo"),
    ("agent-birth-card-legacy.html", "agent-birth-card-legacy"),
    ("agent-employee.html", "agent-employee"),
    ("ai-employee-roster.html", "ai-employee-roster"),
    ("feedback-evolution.html", "feedback-evolution"),
]

REPLACEMENTS = [
    ('href="./assets/', 'href="../../assets/'),
    ('src="./assets/', 'src="../../assets/'),
]

PAGE_HREFS = [
    ("./index.html", "../landing/index.html"),
    ("./login.html", "../login/index.html"),
    ("./product-demo-hub.html", "../product-demo-hub/index.html"),
    ("./company-onboarding.html", "../company-onboarding/index.html"),
    ("./enterprise-memory.html", "../enterprise-memory/index.html"),
    ("./demand-diagnosis.html", "../demand-diagnosis/index.html"),
    ("./job-agent-workbench-prototype.html", "../job-agent-workbench-prototype/index.html"),
    ("./job-agent-workbench-prototype.legacy.html", "../job-agent-workbench-prototype-legacy/index.html"),
    ("./job-agent-workbench.html", "../job-agent-workbench/index.html"),
    ("./job-agent-workbench-legacy.html", "../job-agent-workbench-legacy/index.html"),
    ("./agent-birth-card.html", "../agent-birth-card/index.html"),
    ("./agent-birth-card-share-demo.html", "../agent-birth-card-share-demo/index.html"),
    ("./agent-birth-card-legacy.html", "../agent-birth-card-legacy/index.html"),
    ("./agent-employee.html", "../agent-employee/index.html"),
    ("./ai-employee-roster.html", "../ai-employee-roster/index.html"),
    ("./feedback-evolution.html", "../feedback-evolution/index.html"),
]


def rewrite_paths(html: str) -> str:
    html = html.replace("./assets/", "../../assets/")
    for a, b in REPLACEMENTS:
        html = html.replace(a, b)
    for a, b in PAGE_HREFS:
        html = html.replace(a, b)
    for a, b in PAGE_HREFS:
        html = html.replace(f'location.href = "{a}"', f'location.href = "{b}"')
        html = html.replace(f"location.href = '{a}'", f"location.href = '{b}'")
        html = html.replace(f'window.location.href = "{a}"', f'window.location.href = "{b}"')
        html = html.replace(f"window.location.href = '{a}'", f"window.location.href = '{b}'")
    return html


def extract_styles(text: str):
    parts = []

    def repl(m):
        parts.append(m.group(1).strip())
        return ""

    out = re.sub(r"<style>\s*(.*?)\s*</style>", repl, text, flags=re.S | re.I)
    css = "\n\n".join(parts) if parts else ""
    return out, css


def extract_inline_scripts(text: str):
    blocks = []

    def on_script(m):
        attrs = m.group(1) or ""
        inner = m.group(2) or ""
        if re.search(r"\ssrc\s*=", attrs, re.I):
            return m.group(0)
        inner = inner.strip()
        if inner:
            blocks.append(inner)
        return ""

    out = re.sub(r"<script([^>]*)>\s*(.*?)\s*</script>", on_script, text, flags=re.S | re.I)
    js = "\n\n".join(blocks) if blocks else ""
    return out, js


def collect_external_script_srcs(html: str):
    srcs = []
    for m in re.finditer(r'<script[^>]+src=["\']([^"\']+)["\']', html, re.I):
        srcs.append(m.group(1))
    return srcs


def strip_all_scripts(html: str) -> str:
    return re.sub(r"<script[^>]*>.*?</script>\s*", "", html, flags=re.S | re.I)


def inject_head_links(html: str) -> str:
    if "shell.css" in html:
        return html
    block = (
        "\n  <link rel=\"stylesheet\" href=\"../../assets/shell.css\" />\n"
        "  <link rel=\"stylesheet\" href=\"./style.css\" />"
    )
    m = re.search(r'<link[^>]*href=["\']\.\./\.\./assets/tokens\.css["\'][^>]*/>', html, re.I)
    if m:
        return html[: m.end()] + block + html[m.end() :]
    return html.replace("<head>", "<head>" + block, 1)


def inject_body_scripts(html: str, external_srcs: list) -> str:
    lines = []
    for s in external_srcs:
        if not s.startswith("../../assets/"):
            s = rewrite_paths(s)
        lines.append(f'  <script src="{s}"></script>')
    lines.append('  <script src="./script.js"></script>')
    block = "\n".join(lines) + "\n"
    if "</body>" in html:
        return html.replace("</body>", block + "</body>", 1)
    return html + block


def process_one(src_name: str, slug: str):
    src = ROOT / src_name
    if not src.exists():
        print("skip missing", src_name)
        return
    raw = src.read_text(encoding="utf-8")
    ext_order = [rewrite_paths(s) for s in collect_external_script_srcs(raw)]
    body, css = extract_styles(raw)
    body, js = extract_inline_scripts(body)
    body = strip_all_scripts(body)
    body = rewrite_paths(body)
    js = rewrite_paths(js)
    body = inject_head_links(body)
    body = inject_body_scripts(body, ext_order)
    out_dir = ROOT / "pages" / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(body.strip() + "\n", encoding="utf-8")
    (out_dir / "style.css").write_text(css + "\n", encoding="utf-8")
    (out_dir / "script.js").write_text(js + "\n", encoding="utf-8")
    print("ok", slug)


def main():
    (ROOT / "pages").mkdir(exist_ok=True)
    for src, slug in MAPPING:
        process_one(src, slug)


if __name__ == "__main__":
    main()
