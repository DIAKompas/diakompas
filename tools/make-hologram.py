"""Build the untextured head and fallback from the licensed MakeHuman base.obj."""
import json
import struct
import sys
from pathlib import Path

vertices, edges, group = [], set(), None
for line in Path(sys.argv[1]).read_text().splitlines():
    fields = line.split()
    if not fields:
        continue
    tag, *data = fields
    if tag == 'v':
        vertices.append(tuple(map(float, data)))
    elif tag == 'g':
        group = data[0]
    elif tag == 'f' and group == 'body':
        face = [vertices[int(token.split('/')[0]) - 1] for token in data]
        if not all(point[1] > 6.14 for point in face):
            continue
        points = [tuple(round(value / .038) for value in point) for point in face]
        for a, b in zip(points, points[1:] + points[:1]):
            if a != b:
                edges.add(tuple(sorted((a, b))))

points = sorted({point for edge in edges for point in edge})
vectors = [(x * .038 / 2.15, (y * .038 - 7.32) / 2.15, (.65 - z * .038) / 2.15)
           for x, y, z in points]
lookup = {point: index for index, point in enumerate(points)}
indices = [lookup[point] for edge in sorted(edges) for point in edge]
positions = b''.join(struct.pack('<3f', *point) for point in vectors)
index_data = struct.pack(f'<{len(indices)}H', *indices)
binary = positions + index_data
binary += b'\0' * (-len(binary) % 4)
asset = {
    'asset': {'version': '2.0', 'generator': 'DIA Kompas / MakeHuman CC0'},
    'extensionsUsed': ['KHR_materials_unlit'],
    'scene': 0, 'scenes': [{'nodes': [0]}], 'nodes': [{'mesh': 0}],
    'meshes': [{'primitives': [{'attributes': {'POSITION': 0}, 'indices': 1, 'mode': 1, 'material': 0}]}],
    'materials': [{'extensions': {'KHR_materials_unlit': {}}, 'alphaMode': 'BLEND',
                   'pbrMetallicRoughness': {'baseColorFactor': [.008, .32, .34, .43]}}],
    'buffers': [{'byteLength': len(binary)}],
    'bufferViews': [{'buffer': 0, 'byteLength': len(positions), 'target': 34962},
                    {'buffer': 0, 'byteOffset': len(positions), 'byteLength': len(index_data), 'target': 34963}],
    'accessors': [{'bufferView': 0, 'componentType': 5126, 'count': len(vectors), 'type': 'VEC3',
                   'min': list(map(min, zip(*vectors))), 'max': list(map(max, zip(*vectors)))},
                  {'bufferView': 1, 'componentType': 5123, 'count': len(indices), 'type': 'SCALAR'}],
}
data = json.dumps(asset, separators=(',', ':')).encode()
data += b' ' * (-len(data) % 4)
output = Path('assets/assistant4')
(output / 'hologram.glb').write_bytes(
    struct.pack('<4sII', b'glTF', 2, 28 + len(data) + len(binary))
    + struct.pack('<I4s', len(data), b'JSON') + data
    + struct.pack('<I4s', len(binary), b'BIN\0') + binary
)
lines = []
for a, b in zip(indices[::2], indices[1::2]):
    x, y, z = vectors[a]
    u, v, w = vectors[b]
    if (z + w) / 2 > -.08:
        lines.append(f'M{80+x*123:.1f},{80-y*123:.1f}l{(u-x)*123:.1f},{(y-v)*123:.1f}')
(output / 'hologram.svg').write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><path fill="none" '
    'stroke="#098e95" stroke-width=".65" opacity=".64" d="' + ''.join(lines) + '"/></svg>\n'
)
print(f'{len(vectors)} vertices, {len(edges)} lines')
