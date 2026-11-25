"""Run every ```python run block in content/ and compare with the "Expected output" box after it.

Usage:  python3 scripts/verify_examples.py [--fill] [content/02-python-math.md ...]
        --fill inserts an "Expected output" box (with the real output) after any
        top-level runnable block that has none. Review the result before committing.
Needs:  numpy, pandas, scikit-learn (the same packages the in-browser runner loads).
"""
import glob, os, re, subprocess, sys, tempfile

def strip_quote(lines):
    return [re.sub(r"^> ?", "", l) for l in lines]

def blocks(path):
    lines = open(path, encoding="utf8").read().split("\n")
    i = 0
    while i < len(lines):
        raw = lines[i]
        quoted = raw.startswith(">")
        line = re.sub(r"^> ?", "", raw) if quoted else raw
        if re.match(r"^```python run\s*$", line):
            start, code = i + 1, []
            i += 1
            while i < len(lines):
                l = re.sub(r"^> ?", "", lines[i]) if quoted else lines[i]
                if l.startswith("```"):
                    break
                code.append(l)
                i += 1
            # look for an "Expected output" box right after
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            expected = None
            if j < len(lines) and lines[j].startswith("> **Expected output:**"):
                k = j + 1
                if k < len(lines) and lines[k].startswith("> ```"):
                    exp = []
                    k += 1
                    while k < len(lines) and not lines[k].startswith("> ```"):
                        exp.append(re.sub(r"^> ?", "", lines[k]))
                        k += 1
                    expected = "\n".join(exp)
            yield start, "\n".join(code), expected
        i += 1

def norm(s):
    return "\n".join(l.rstrip() for l in s.strip().split("\n"))

fill = "--fill" in sys.argv
args = [a for a in sys.argv[1:] if a != "--fill"]
files = args or sorted(glob.glob(os.path.join(os.path.dirname(__file__), "..", "content", "*.md")))
fails = runs = 0
inserts = {}

def code_is_quoted(f, line):
    return open(f, encoding="utf8").read().split("\n")[line - 1].startswith(">")
for f in files:
    for line, code, expected in blocks(f):
        runs += 1
        with tempfile.TemporaryDirectory() as d:
            p = subprocess.run([sys.executable, "-I", "-c", code], cwd=d, capture_output=True, text=True, timeout=120)
        out = p.stdout + p.stderr
        name = f"{os.path.basename(f)}:{line}"
        if p.returncode != 0:
            fails += 1
            print(f"ERROR  {name}\n{out}")
        elif expected is None and fill and p.returncode == 0 and out.strip() and not code_is_quoted(f, line):
            inserts.setdefault(f, []).append((line, out))
        elif expected is not None and norm(out) != norm(expected):
            fails += 1
            print(f"DIFF   {name}\n--- expected\n{expected}\n--- actual\n{out}")
for f, items in inserts.items():
    lines = open(f, encoding="utf8").read().split("\n")
    for line, out in sorted(items, reverse=True):
        end = line
        while not lines[end].startswith("```"):
            end += 1
        box = ["", "> **Expected output:**", "> ```text"] + [("> " + l).rstrip() for l in out.rstrip().split("\n")] + ["> ```"]
        lines[end + 1:end + 1] = box
    open(f, "w", encoding="utf8").write("\n".join(lines))
    print(f"filled {len(items)} expected-output boxes in {os.path.basename(f)}")
print(f"{runs} runnable examples, {fails} problems")
sys.exit(1 if fails else 0)
