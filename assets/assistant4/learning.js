const sources = [
  'https://www.niddk.nih.gov/health-information/diabetes/overview/managing-diabetes/continuous-glucose-monitoring',
  'https://www.niddk.nih.gov/health-information/diagnostic-tests/a1c-test',
  'https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html'
];

export function addLearningModels(copy, element) {
  const topics = document.querySelector('#topics');
  const section = element('section', 'dk4-learning');
  const heading = element('h2', '');
  heading.id = 'dk4-learning-title';
  section.setAttribute('aria-labelledby', heading.id);
  const choices = element('div', 'dk4-buttons');
  const modelButtons = sources.map((_, index) => {
    const button = element('button', '');
    button.type = 'button';
    button.addEventListener('click', () => {
      lesson = index;
      viewer?.select(lesson);
      render();
    });
    choices.append(button);
    return button;
  });
  const layout = element('div', 'dk4-lesson');
  const stage = element('div', 'dk4-stage');
  const diagram = element('div', 'dk4-diagram');
  stage.setAttribute('aria-hidden', 'true');
  stage.append(diagram);
  const content = element('div', '');
  const title = element('h3', '');
  const description = element('p', '');
  const source = element('a', '');
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  const controls = element('div', 'dk4-buttons');
  const toggle = element('button', '');
  const previous = element('button', '');
  const next = element('button', '');
  toggle.type = previous.type = next.type = 'button';
  controls.append(toggle, previous, next);
  content.append(title, description, source, controls);
  layout.append(stage, content);
  section.append(heading, choices, layout);
  topics.after(section);

  let lesson = 0;
  let viewer;
  let loading = false;
  let failed = false;
  let enabled = false;

  function render() {
    const t = copy();
    heading.textContent = t.models;
    for (const [index, button] of modelButtons.entries()) {
      button.textContent = t.lessons[index][0];
      button.setAttribute('aria-pressed', String(lesson === index));
    }
    [title.textContent, description.textContent] = t.lessons[lesson];
    source.href = sources[lesson];
    source.textContent = t.source;
    diagram.dataset.lesson = String(lesson);
    diagram.hidden = enabled;
    toggle.disabled = loading || failed;
    toggle.textContent = loading ? t.loading : failed ? t.unavailable : enabled ? t.twoD : t.threeD;
    toggle.setAttribute('aria-pressed', String(enabled));
    previous.textContent = t.previous;
    next.textContent = t.next;
    previous.hidden = next.hidden = !enabled;
  }

  function fallBack() {
    viewer?.dispose();
    viewer = undefined;
    enabled = loading = false;
    failed = true;
    render();
  }

  toggle.addEventListener('click', async () => {
    if (viewer) {
      enabled = !enabled;
      viewer.setVisible(enabled);
      if (enabled) viewer.select(lesson);
      else toggle.focus();
      render();
      return;
    }
    loading = true;
    render();
    try {
      const { mountLesson } = await import('./engine.js');
      viewer = mountLesson(stage, fallBack);
      enabled = true;
      viewer.select(lesson);
      loading = false;
      render();
    } catch {
      fallBack();
    }
  });
  previous.addEventListener('click', () => viewer?.rotate(-1));
  next.addEventListener('click', () => viewer?.rotate(1));
  new MutationObserver(render).observe(document.documentElement, { attributeFilter: ['lang'] });
  render();
}
