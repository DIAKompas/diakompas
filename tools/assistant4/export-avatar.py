"""Export the CC0 MakeHuman bust used by DIA Kompas (run inside Blender)."""
import math
import sys
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Vector

data = Path(sys.argv[sys.argv.index("--") + 1])
textures = Path(sys.argv[sys.argv.index("--") + 2])
destination = Path(sys.argv[sys.argv.index("--") + 3])
bpy.ops.wm.read_factory_settings(use_empty=True)

def read_obj(path):
    points, uvs, groups, corners = [], [], defaultdict(list), {}
    group = "mesh"
    for line in path.read_text().splitlines():
        tokens = line.split()
        if not tokens:
            continue
        if tokens[0] == "v":
            points.append(Vector(map(float, tokens[1:4])))
        elif tokens[0] == "vt":
            uvs.append(tuple(map(float, tokens[1:3])))
        elif tokens[0] == "g":
            group = tokens[1]
        elif tokens[0] == "f":
            refs = [token.split("/") for token in tokens[1:]]
            face = tuple(int(ref[0]) - 1 for ref in refs)
            groups[group].append(face)
            corners[face] = tuple(uvs[int(ref[1]) - 1] for ref in refs)
    return points, groups, corners

vertices, groups, body_uv = read_obj(data / "3dobjs/base.obj")

def target(path):
    changes = {}
    for line in path.read_text().splitlines():
        items = line.split()
        if len(items) == 4 and items[0].isdigit():
            changes[int(items[0])] = Vector(map(float, items[1:]))
    return changes

for index, delta in target(data / "targets/macrodetails/caucasian-female-young.target").items():
    vertices[index] += delta

def blender_position(point):
    return point.x, -point.z, point.y - 6.7

def material(name, color, roughness=.55):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Roughness"].default_value = roughness
    return result

def image_material(name, filename, roughness, alpha=False):
    result = material(name, (1, 1, 1), roughness)
    shader = result.node_tree.nodes.get("Principled BSDF")
    texture = result.node_tree.nodes.new("ShaderNodeTexImage")
    texture.image = bpy.data.images.load(str(textures / filename))
    result.node_tree.links.new(texture.outputs["Color"], shader.inputs["Base Color"])
    if alpha:
        result.surface_render_method = "DITHERED"
        result.node_tree.links.new(texture.outputs["Alpha"], shader.inputs["Alpha"])
    return result

skin = image_material("Skin", "skin.jpg", .62)
shirt = material("Civilian teal crewneck", (.028, .19, .22), .8)
hair = image_material("Ponytail hair", "hair.png", .61, alpha=True)
teeth = material("Teeth", (.74, .68, .58))
mouth = material("Inside mouth", (.13, .033, .034))
lash = material("Eyelashes", (.09, .039, .024))

def mesh(points, faces, name, materials, uvs=None):
    geometry = bpy.data.meshes.new(name)
    geometry.from_pydata([blender_position(point) for point in points], [], faces)
    geometry.update()
    result = bpy.data.objects.new(name, geometry)
    bpy.context.collection.objects.link(result)
    for entry in materials:
        geometry.materials.append(entry)
    for face in geometry.polygons:
        face.use_smooth = True
    if uvs:
        layer = geometry.uv_layers.new(name="UVMap")
        for polygon, coords in zip(geometry.polygons, uvs):
            for loop, uv in zip(polygon.loop_indices, coords):
                layer.data[loop].uv = uv
    return result

def mesh_object(name, faces, materials, with_uv=False):
    points = sorted(set(index for face in faces for index in face))
    remap = {original: index for index, original in enumerate(points)}
    result = mesh([vertices[index] for index in points],
                  [[remap[index] for index in face] for face in faces],
                  name, materials, [body_uv[face] for face in faces] if with_uv else None)
    return result, points

def is_shirt(point):
    x, y, z = point
    neckline = 5.28 + .3 * min(1, abs(x) / .61) + (.06 if z < .1 else 0)
    return y < neckline

bust_faces = [f for f in groups["body"] if all(vertices[i].y > 4.46 for i in f)]
bust, bust_indices = mesh_object("Assistant", bust_faces, [skin, shirt, mouth], with_uv=True)
for polygon, face in zip(bust.data.polygons, bust_faces):
    mean = sum((vertices[i] for i in face), Vector((0, 0, 0))) / len(face)
    if is_shirt(mean):
        polygon.material_index = 1
    elif mean.y > 6.04 and mean.y < 6.42 and abs(mean.x) < .3 and .87 < mean.z < 1.16:
        polygon.material_index = 2

units = data / "targets/expression/units/caucasian"
def add_shapes(obj, indices):
    obj.shape_key_add(name="Basis")
    for label, filename in {
        "BlinkLeft": "eye-left-closure", "BlinkRight": "eye-right-closure",
        "Speak": "mouth-open", "Smile": "mouth-corner-puller"
    }.items():
        shape = obj.shape_key_add(name=label)
        for local, original in enumerate(indices):
            delta = target_deltas[filename].get(original)
            if delta is not None:
                shape.data[local].co = blender_position(vertices[original] + delta)

target_deltas = {name: target(units / (name + ".target")) for name in
                 ["eye-left-closure", "eye-right-closure", "mouth-open", "mouth-corner-puller"]}
add_shapes(bust, bust_indices)

for group_name in ["helper-upper-teeth", "helper-lower-teeth",
                   "helper-l-eyelashes-2", "helper-r-eyelashes-2"]:
    obj, indices = mesh_object(group_name, groups[group_name], [teeth if "teeth" in group_name else lash])
    add_shapes(obj, indices)

white = material("Sclera", (.69, .66, .58), .29)
iris = material("Hazel iris", (.14, .078, .035), .34)
pupil = material("Pupil", (.012, .009, .007), .32)
for side in [-1, 1]:
    x = side * .2885
    eye, eye_indices = mesh_object("EyeLeft" if side > 0 else "EyeRight",
                                   groups["helper-l-eye" if side > 0 else "helper-r-eye"], [white, iris, pupil])
    center = Vector(blender_position(Vector((x, 6.795, 1.11))))
    for vertex in eye.data.vertices:
        vertex.co -= center
    eye.location = center
    # Build iris/pupil as concentric spherical caps, children of the eye.
    cap_points, cap_faces = [], []
    for ring, radius in enumerate([.002, .025, .031, .049, .056]):
        for segment in range(24):
            angle = math.tau * segment / 24
            cap_points.append((x + radius * math.cos(angle), 6.795 + radius * math.sin(angle),
                               1.125 + math.sqrt(.159 ** 2 - radius ** 2)))
            if ring:
                a = (ring - 1) * 24 + segment
                b = (ring - 1) * 24 + (segment + 1) % 24
                cap_faces.append((a, a + 24, b + 24, b))
    cap = mesh([Vector(point) for point in cap_points], cap_faces, "Iris", [pupil, iris])
    for face in cap.data.polygons:
        face.material_index = int(face.index >= 24)
    for vertex in cap.data.vertices:
        vertex.co -= center
    cap.parent = eye

# Fit the official hairstyle using its MakeHuman barycentric vertex attachments.
# The scale definitions adjust offsets to match the morphed head.
def hair_positions(path):
    scales = [1, 1, 1]
    points = []
    reading = False
    for line in path.read_text().splitlines():
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if fields[0] in {"x_scale", "y_scale", "z_scale"}:
            axis = "xyz".index(fields[0][0])
            a, b = map(int, fields[1:3])
            scales[axis] = abs(vertices[a][axis] - vertices[b][axis]) / float(fields[3])
        elif fields[0] == "verts":
            reading = True
        elif reading:
            if not fields[0].isdigit():
                continue
            if len(fields) == 1:
                points.append(vertices[int(fields[0])])
                continue
            indices = list(map(int, fields[:3]))
            weights = list(map(float, fields[3:6]))
            offset = Vector(float(value) * scale for value, scale in zip(fields[6:], scales))
            points.append(sum((vertices[i] * w for i, w in zip(indices, weights)), offset))
    return points

hair_points, hair_groups, hair_uv = read_obj(textures / "ponytail01.obj")
hair_faces = [face for group in hair_groups.values() for face in group]
fitted_hair = hair_positions(textures / "ponytail01.mhclo")
assert len(fitted_hair) == len(hair_points)
mesh(fitted_hair, hair_faces, "Ponytail hairstyle", [hair], [hair_uv[face] for face in hair_faces])

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(filepath=str(destination), export_format="GLB",
                         export_yup=True, export_apply=False, export_animations=False)
