"""Export the CC0 MakeHuman bust used by DIA Kompas (run inside Blender)."""
import math
import sys
from collections import defaultdict
from pathlib import Path

import bpy
from mathutils import Vector

data = Path(sys.argv[sys.argv.index("--") + 1])
destination = Path(sys.argv[sys.argv.index("--") + 2])
bpy.ops.wm.read_factory_settings(use_empty=True)

vertices, groups = [], defaultdict(list)
group = ""
for line in (data / "3dobjs/base.obj").read_text().splitlines():
    tokens = line.split()
    if not tokens:
        continue
    if tokens[0] == "v":
        vertices.append(Vector(map(float, tokens[1:4])))
    elif tokens[0] == "g":
        group = tokens[1]
    elif tokens[0] == "f":
        groups[group].append(tuple(int(token.split("/")[0]) - 1 for token in tokens[1:]))

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

skin = material("Skin", (.62, .36, .27))
skin_nodes = skin.node_tree.nodes
skin_attribute = skin_nodes.new("ShaderNodeVertexColor")
skin_attribute.layer_name = "Complexion"
skin.node_tree.links.new(skin_attribute.outputs["Color"], skin_nodes.get("Principled BSDF").inputs["Base Color"])
shirt = material("Civilian teal crewneck", (.027, .177, .204), .8)
shirt_attribute = shirt.node_tree.nodes.new("ShaderNodeVertexColor")
shirt_attribute.layer_name = "Complexion"
shirt.node_tree.links.new(shirt_attribute.outputs["Color"], shirt.node_tree.nodes.get("Principled BSDF").inputs["Base Color"])
hair = material("Chestnut hair", (.077, .034, .021), .52)
hair_light = material("Chestnut highlights", (.11, .05, .029), .53)
brow = material("Eyebrows", (.095, .044, .027), .70)
teeth = material("Teeth", (.74, .68, .58))
mouth = material("Inside mouth", (.13, .033, .034))
lash = material("Eyelashes", (.09, .039, .024))

def mesh_object(name, faces, materials):
    points = sorted(set(index for face in faces for index in face))
    remap = {original: index for index, original in enumerate(points)}
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([blender_position(vertices[index]) for index in points], [],
                     [[remap[index] for index in face] for face in faces])
    mesh.update()
    result = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(result)
    for entry in materials:
        mesh.materials.append(entry)
    for face in mesh.polygons:
        face.use_smooth = True
    return result, points

def gauss(value):
    return math.exp(-value * value)

def color_at(point):
    x, y, z = point
    x = abs(x)
    base = Vector((.64, .375, .283))
    if z > .85 and y > 5.8:
        blush = gauss((x - .43) / .21) * gauss((y - 6.54) / .21)
        lips = gauss(x / .25) * gauss((y - 6.25) / .075) * min(1, max(0, (z - 1.22) * 8))
        shadow = gauss((x - .31) / .20) * gauss((y - 6.85) / .15) * .13
        base = base.lerp(Vector((.61, .228, .204)), blush * .28)
        base = base.lerp(Vector((.45, .125, .115)), lips * .84)
        base *= 1 - shadow
    return tuple(base)

def is_shirt(point):
    x, y, z = point
    neckline = 5.28 + .3 * min(1, abs(x) / .61) + (.06 if z < .1 else 0)
    return y < neckline

bust_faces = [f for f in groups["body"] if all(vertices[i].y > 4.46 for i in f)]
bust, bust_indices = mesh_object("Assistant", bust_faces, [skin, shirt, mouth])
colors = bust.data.color_attributes.new(name="Complexion", type="FLOAT_COLOR", domain="CORNER")
for polygon, face in zip(bust.data.polygons, bust_faces):
    mean = sum((vertices[i] for i in face), Vector((0, 0, 0))) / len(face)
    if is_shirt(mean):
        polygon.material_index = 1
    elif mean.y > 6.04 and mean.y < 6.42 and abs(mean.x) < .3 and .87 < mean.z < 1.16:
        polygon.material_index = 2
    for loop, original in zip(polygon.loop_indices, face):
        point = vertices[original]
        rgb = (.028, .19, .22) if polygon.material_index == 1 else color_at(point)
        colors.data[loop].color = (*rgb, 1)
bust.data.color_attributes.active_color = colors

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

def sampled_mesh(name, points, faces, materials):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata([blender_position(Vector(point)) for point in points], [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    for entry in materials:
        mesh.materials.append(entry)
    for face in mesh.polygons:
        face.use_smooth = True
    return obj

def sweep(name, points, radius, surface):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.resolution_u = 7
    curve.bevel_depth = radius
    curve.bevel_resolution = 1
    spline = curve.splines.new("BEZIER")
    spline.bezier_points.add(len(points) - 1)
    for index, (control, point) in enumerate(zip(spline.bezier_points, points)):
        control.co = blender_position(Vector(point))
        control.handle_left_type = control.handle_right_type = "AUTO"
        control.radius = .25 if index in (0, len(points) - 1) else 1
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(surface)
    return obj

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
    cap = sampled_mesh("Iris", cap_points, cap_faces, [pupil, iris])
    for face in cap.data.polygons:
        face.material_index = int(face.index >= 24)
    for vertex in cap.data.vertices:
        vertex.co -= center
    cap.parent = eye
    sweep("Brow", [(side * xx, yy, zz) for xx, yy, zz in
          [(.11, 6.996, 1.366), (.21, 7.025, 1.379), (.32, 7.035, 1.365),
           (.43, 7.013, 1.295), (.54, 6.956, 1.188)]], .022, brow)

# Layered cap with a raised front hairline and a longer back, plus asymmetrical swept sides.
points, faces = [], []
segments, rings = 72, 22
for ring in range(rings + 1):
    for segment in range(segments):
        theta = math.tau * segment / segments
        front = max(0, math.cos(theta))
        limit = 2.39 - 1.38 * front ** 1.65 + .14 * math.sin(theta * 2) * front
        phi = .018 + ring / rings * (limit - .018)
        wave = .012 * math.sin(theta * 13 + phi * 5)
        points.append(((.755 + wave) * math.sin(phi) * math.sin(theta) - .035,
                       6.98 + 1.07 * math.cos(phi),
                       .435 + (.94 + wave) * math.sin(phi) * math.cos(theta)))
        if ring:
            a = (ring - 1) * segments + segment
            b = (ring - 1) * segments + (segment + 1) % segments
            faces.append((a, b, b + segments, a + segments))
faces.append(tuple(range(segments)))
cap = sampled_mesh("Swept hairstyle", points, faces, [hair, hair_light])
for face in cap.data.polygons:
    face.material_index = int(face.index % segments % 9 in (0, 1))

for side in [-1, 1]:
    for i in range(7):
        shift = i * .043
        sweep("Hair strand", [
            (-.15 + side * shift, 7.99 - shift * .15, .65 + shift),
            (side * (.33 + shift), 7.66 + shift * .1, 1.13 - shift * .36),
            (side * (.69 + shift * .35), 7.16, .92 - shift * .65),
            (side * (.77 + shift * .3), 6.54, .49 - shift),
            (side * (.65 + shift * .38), 5.91 + shift * .4, .42 - shift),
            (side * (.7 + shift * .2), 5.55 + shift * .6, .56 - shift),
        ], .061 - i * .003, hair_light if i in (1, 4) else hair)

bpy.ops.object.select_all(action="DESELECT")
bpy.ops.export_scene.gltf(filepath=str(destination), export_format="GLB",
                         export_yup=True, export_apply=False, export_animations=False)
