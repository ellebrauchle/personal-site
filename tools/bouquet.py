"""Generate Petal Ping's tile: a bouquet of looping single-line blooms."""
import math, random

random.seed(23)
W, H = 400, 190
TIE = (168, 205)          # where the gathered stems want to meet, just off-tile

def rot(x, y, a):
    c, s = math.cos(a), math.sin(a)
    return x * c - y * s, x * s + y * c

def bloom(n, length, width, spin):
    """One unbroken line, out and back for each petal, loops crossing at the centre."""
    d = ["M 0 0"]
    step = 2 * math.pi / n
    for i in range(n):
        a = spin + i * step + random.uniform(-0.22, 0.22) * step
        L = length * random.uniform(0.80, 1.22)
        Wd = width * random.uniform(0.78, 1.3)
        tip = rot(L, 0, a)
        c1 = rot(L * 0.22, -Wd, a)
        c2 = rot(L * 1.02, -Wd * 0.78, a)
        c3 = rot(L * 1.02, Wd * 0.78, a)
        c4 = rot(L * 0.22, Wd, a)
        d.append("C %.1f %.1f %.1f %.1f %.1f %.1f" % (*c1, *c2, *tip))
        d.append("C %.1f %.1f %.1f %.1f 0 0" % (*c3, *c4))
    return " ".join(d)

def blob(r):
    pts, n = [], 8
    for i in range(n):
        a = i * 2 * math.pi / n
        rr = r * random.uniform(0.72, 1.22)
        pts.append((math.cos(a) * rr, math.sin(a) * rr))
    d = ["M %.1f %.1f" % pts[0]]
    for i in range(n):
        p0, p1 = pts[i], pts[(i + 1) % n]
        mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
        bulge = random.uniform(1.2, 1.44)
        d.append("Q %.1f %.1f %.1f %.1f" % (mx * bulge, my * bulge, p1[0], p1[1]))
    return " ".join(d) + " Z"

# x, y, petal length, petals, spin, blob radius, blob offset, stem target,
# stem bow. The first five are still gathered; the last two have come loose
# and drift off to the right on their own stems.
FLOWERS = [
    ( 52,  74, 30, 5, -0.30, 25, (-12,  9), TIE,        (-34,  26)),
    (104,  44, 23, 5,  0.42, 19, (  8, 10), TIE,        (-16,  40)),
    (163,  70, 33, 6, -0.12, 27, (-10,  6), TIE,        (  4,  30)),
    (218,  40, 21, 5,  0.60, 17, (  9, 11), TIE,        ( 26,  44)),
    (263,  76, 26, 5, -0.44, 21, (  7, -8), TIE,        ( 30,  26)),
    (326,  47, 19, 5,  0.20, 15, ( -9,  8), (352, 150), ( 30, -14)),
    (360, 112, 15, 5, -0.55, 12, (  6,  9), (300, 190), (  8,  34)),
]

parts = [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"' % (W, H, W, H),
    '     role="img" aria-label="A line-drawn bouquet of flowers">',
    '  <!--',
    "    Petal Ping's tile: looping single-line blooms over soft pink washes,",
    '    gathered as a bouquet with two stems come loose. Generated, then',
    '    committed as a flat file. Edit the generator, not this file.',
    '  -->',
    '  <rect width="%d" height="%d" fill="#F7EFE6"/>' % (W, H),
    '',
    '  <g fill="#F0B3B1">',
]

for x, y, L, n, spin, br, (bx, by), tgt, bow in FLOWERS:
    parts.append('    <path transform="translate(%.1f %.1f)" d="%s"/>' % (x + bx, y + by, blob(br)))
parts.append('  </g>')
parts.append('')
parts.append('  <g fill="none" stroke="#33312E" stroke-width="1.4" '
             'stroke-linecap="round" stroke-linejoin="round">')

# stems first, drawn in page coordinates so they can reach a shared tie point
for x, y, L, n, spin, br, _b, (tx, ty), (bx, by) in FLOWERS:
    c1 = (x + bx * 0.5, y + (ty - y) * 0.35)
    c2 = (tx + bx * 0.8, y + (ty - y) * 0.78)
    parts.append('    <path d="M %.1f %.1f C %.1f %.1f %.1f %.1f %.1f %.1f"/>'
                 % (x, y, c1[0], c1[1], c2[0], c2[1], tx, ty))

for x, y, L, n, spin, br, _b, _t, _bow in FLOWERS:
    parts.append('    <path transform="translate(%.1f %.1f)" d="%s"/>'
                 % (x, y, bloom(n=n, length=L, width=L * 0.52, spin=spin)))

parts.append('  </g>')
parts.append('</svg>')

open('assets/petal-ping.svg', 'w').write("\n".join(parts) + "\n")
print("wrote assets/petal-ping.svg")
