import {
  ACESFilmicToneMapping, AmbientLight, CylinderGeometry, DirectionalLight, GLTFLoader,
  Group, LatheGeometry, Mesh, MeshStandardMaterial, PerspectiveCamera, Scene,
  TorusGeometry, Vector2, WebGLRenderer
} from './three-vendor.js';

function disposeScene(scene) {
  const geometries = new Set();
  const materials = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) {
      for (const material of [object.material].flat()) materials.add(material);
    }
  });
  geometries.forEach(geometry => geometry.dispose());
  const textures = new Set();
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value?.isTexture) textures.add(value);
    }
    material.dispose();
  }
  const images = new Set();
  for (const texture of textures) {
    images.add(texture.source?.data);
    texture.dispose();
  }
  for (const image of images) image?.close?.();
}

function stage(host, onLoss, distance, target) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  const canvas = renderer.domElement;
  // Limit fill-rate on mobile GPUs; preserve sharper rendering on desktop.
  const compact = matchMedia('(max-width: 540px)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.25 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  const scene = new Scene();
  const camera = new PerspectiveCamera(33, 1, .1, 30);
  camera.position.set(.16, target + .17, distance);
  camera.lookAt(0, target, 0);
  const key = new DirectionalLight(0xfff2e5, 2.2);
  key.position.set(-2, 3, 5);
  const fill = new DirectionalLight(0xd8ecff, 1.3);
  fill.position.set(3, 1, 2);
  const rim = new DirectionalLight(0xffffff, 2);
  rim.position.set(0, 3, -4);
  scene.add(key, fill, rim, new AmbientLight(0xffffff, .95));
  host.append(canvas);

  let disposed = false;
  let lastWidth = 0;
  let lastHeight = 0;
  function draw() {
    if (disposed || canvas.hidden) return;
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    if (width !== lastWidth || height !== lastHeight) {
      lastWidth = width;
      lastHeight = height;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
  }
  const resize = new ResizeObserver(draw);
  resize.observe(host);
  function contextLost(event) {
    event.preventDefault();
    onLoss();
  }
  canvas.addEventListener('webglcontextlost', contextLost);
  function dispose() {
    if (disposed) return;
    disposed = true;
    resize.disconnect();
    canvas.removeEventListener('webglcontextlost', contextLost);
    disposeScene(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }
  return { canvas, scene, draw, dispose };
}

export async function mountAvatar(host, onLoss) {
  let lost = false;
  let ready = false;
  const view = stage(host, () => {
    lost = true;
    if (ready) onLoss();
  }, 5.5, .02);
  view.canvas.dataset.scene = 'assistant';
  const pivot = new Group();
  view.scene.add(pivot);

  try {
    const asset = await new GLTFLoader().loadAsync(new URL('./assistant.glb', import.meta.url).href);
    pivot.add(asset.scene);
    if (lost) throw new Error('WebGL context lost while loading the avatar');
  } catch (error) {
    view.dispose();
    throw error;
  }

  const face = [];
  const eyes = [];
  pivot.traverse(object => {
    if (object.morphTargetInfluences) face.push(object);
    if (object.name === 'EyeLeft' || object.name === 'EyeRight') eyes.push(object);
  });
  function expression(name, value) {
    for (const mesh of face) {
      const key = mesh.morphTargetDictionary[name];
      if (key !== undefined) mesh.morphTargetInfluences[key] = value;
    }
  }

  let visible = true;
  let paused = false;
  let reduced = false;
  let talking = false;
  let mode = 'idle';
  let modeChangedAt = performance.now();
  let frame = null;
  let lastFrame = -Infinity;
  function paint(now) {
    const time = now / 1000;
    const blinkPhase = (time + 1.3) % 5.3;
    const blink = reduced ? 0 : Math.max(0, 1 - Math.abs(blinkPhase - .18) / .15);
    const response = mode === 'answered';
    pivot.rotation.y = reduced ? 0 : Math.sin(time * .42) * .055 + (mode === 'thinking' ? .035 : -.018);
    const elapsed = Math.max(0, now - modeChangedAt);
    const nod = response ? Math.sin(Math.min(1, elapsed / 550) * Math.PI) * .10 : 0;
    pivot.rotation.x = reduced ? 0 : Math.sin(time * .38) * .018 + (mode === 'typing' ? .025 : 0) + nod;
    pivot.rotation.z = reduced ? 0 : Math.sin(time * .33) * .012;
    for (const eye of eyes) {
      eye.rotation.y = reduced ? 0 : Math.sin(time * .9 + .6) * .09;
      eye.rotation.x = reduced ? 0 : Math.sin(time * .61) * .04;
    }
    expression('BlinkLeft', blink);
    expression('BlinkRight', blink);
    expression('Smile', response ? .16 : .08);
    expression('Speak', talking && !reduced ? (.5 + .5 * Math.sin(time * 22)) * .52 : 0);
    view.draw();
  }
  function tick(time) {
    // 24 fps on compact screens, about 30 fps elsewhere; WebGL stays interactive.
    const frameInterval = matchMedia('(max-width: 540px)').matches ? 42 : 33;
    if (time - lastFrame >= frameInterval) {
      lastFrame = time;
      paint(time);
    }
    frame = requestAnimationFrame(tick);
  }
  function update() {
    const animate = visible && !paused && !reduced;
    if (animate && frame === null) frame = requestAnimationFrame(tick);
    if (!animate && frame !== null) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    if (visible && !paused) paint(performance.now());
  }
  ready = true;
  update();
  return {
    setMode(value) {
      if (mode === value) return;
      mode = value;
      modeChangedAt = performance.now();
      update();
    },
    setReduced(value) {
      if (reduced === value) return;
      reduced = value;
      update();
    },
    setTalking(value) {
      talking = value;
      update();
    },
    setVisible(value) {
      if (visible === value) return;
      visible = value;
      view.canvas.hidden = !visible;
      update();
    },
    setPaused(value) {
      if (paused === value) return;
      paused = value;
      update();
    },
    dispose() {
      visible = false;
      update();
      view.dispose();
    }
  };
}

function component(geometry, color, x = 0, y = 0, z = 0) {
  const mesh = new Mesh(geometry, new MeshStandardMaterial({ color, roughness: .61 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function sensor() {
  const model = new Group();
  model.add(component(new CylinderGeometry(1.06, 1.16, .08, 48), 0x91a9b3));
  model.add(component(new CylinderGeometry(.79, .87, .22, 48), 0xf3f4f5, 0, .13));
  model.add(component(new CylinderGeometry(.31, .31, .055, 32), 0x35657b, 0, .264));
  model.add(component(new CylinderGeometry(.045, .029, .53, 16), 0x526574, 0, -.28));
  return model;
}

function redCell() {
  const profile = [
    [0, -.13], [.30, -.13], [.65, -.18], [.84, -.23], [1.05, -.18],
    [1.13, -.02], [1.08, .17], [.89, .23], [.67, .2], [.40, .135], [0, .105]
  ].map(([r, y]) => new Vector2(r, y));
  return component(new LatheGeometry(profile, 54), 0xba2547);
}

function plate() {
  const model = new Group();
  model.add(component(new CylinderGeometry(1.24, 1.15, .09, 48), 0xfdf9ee));
  const rim = component(new TorusGeometry(1.16, .065, 10, 48), 0xe9eeed, 0, .03);
  rim.rotation.x = Math.PI / 2;
  model.add(rim);
  for (const [color, angle, size] of [[0x34785d, 0, Math.PI], [0xb7645e, Math.PI, Math.PI / 2], [0xc38e4c, 1.5 * Math.PI, Math.PI / 2]]) {
    model.add(component(new CylinderGeometry(1.06, 1.06, .05, 36, 1, false, angle, size - .025), color, 0, .067));
  }
  return model;
}

export function mountLesson(host, onLoss) {
  const view = stage(host, onLoss, 4.9, 0);
  view.canvas.dataset.scene = 'learning';
  const pivot = new Group();
  pivot.rotation.x = .69;
  pivot.rotation.z = -.14;
  view.scene.add(pivot);
  const factories = [sensor, redCell, plate];
  let current = -1;

  return {
    select(index) {
      if (index === current) return;
      disposeScene(pivot);
      pivot.clear();
      current = index;
      pivot.rotation.y = -.17;
      pivot.add(factories[index]());
      view.draw();
    },
    rotate(direction) {
      pivot.rotation.y += direction * Math.PI / 6;
      pivot.rotation.z += direction * Math.PI / 16;
      view.draw();
    },
    setVisible(visible) {
      view.canvas.hidden = !visible;
      view.draw();
    },
    dispose: view.dispose
  };
}
