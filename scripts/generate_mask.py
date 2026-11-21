from PIL import Image

im = Image.open('reefiya-organic-mask.png').convert('RGBA')
w, h = im.size
pixels = im.load()

# Trace the edge from y=0 to y=h-1
edge = []
for y in range(h):
    found_x = w
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r > 128 and a > 128:
            found_x = x
            break
    edge.append((found_x, y))

# Generate normalized coordinates 0..1
norm_edge = [(round(x / w, 4), round(y / h, 4)) for x, y in edge]

# Subsample or smooth into a high-precision SVG path
sub = norm_edge[::3]
if sub[-1] != norm_edge[-1]:
    sub.append(norm_edge[-1])

# Build path: start at top-right (1,0), down to bottom-right (1,1), bottom-left of white (x_bot, 1),
# trace edge up to (x_top, 0), close to (1,0).
d_parts = ['M 1 0', 'L 1 1']
for x, y in reversed(sub):
    d_parts.append(f'L {x} {y}')
d_parts.append('Z')
path_d = ' '.join(d_parts)

# RTL mirrored path (x -> 1 - x)
rtl_d_parts = ['M 0 0', 'L 0 1']
for x, y in reversed(sub):
    rtl_d_parts.append(f'L {round(1 - x, 4)} {y}')
rtl_d_parts.append('Z')
rtl_path_d = ' '.join(rtl_d_parts)

# Also create the contour line path for the muted gold line (from top of curve to bottom)
contour_parts = [f'M {round(sub[0][0]*100, 2)} 0']
for x, y in sub[1:]:
    contour_parts.append(f'L {round(x*100, 2)} {round(y*100, 2)}')
contour_d = ' '.join(contour_parts)

# RTL contour
rtl_contour_parts = [f'M {round((1 - sub[0][0])*100, 2)} 0']
for x, y in sub[1:]:
    rtl_contour_parts.append(f'L {round((1 - x)*100, 2)} {round(y*100, 2)}')
rtl_contour_d = ' '.join(rtl_contour_parts)

# Write reefiya-organic-mask.svg
svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">
  <defs>
    <clipPath id="reefiyaOrganicMask" clipPathUnits="objectBoundingBox">
      <path d="{path_d}" />
    </clipPath>
    <clipPath id="reefiyaOrganicMaskRTL" clipPathUnits="objectBoundingBox">
      <path d="{rtl_path_d}" />
    </clipPath>
  </defs>
  <path d="M {w} 0 L {w} {h} ''' + ' '.join([f'L {x} {y}' for x, y in reversed(edge)]) + ''' Z" fill="white" />
</svg>'''

with open('reefiya-organic-mask.svg', 'w') as f:
    f.write(svg_content)

with open('paths.py', 'w') as f:
    f.write(f'PATH_D = """{path_d}"""\n')
    f.write(f'RTL_PATH_D = """{rtl_path_d}"""\n')
    f.write(f'CONTOUR_D = """{contour_d}"""\n')
    f.write(f'RTL_CONTOUR_D = """{rtl_contour_d}"""\n')

print("Mask SVG & Paths written!")
