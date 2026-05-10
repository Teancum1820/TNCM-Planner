const STORAGE_KEY = 'first-things-planner-state';

const inspirationBank = [
  {
    title: 'Start with heaven',
    category: 'Faith',
    effort: 'small',
    importance: 10,
    description: 'Read a chapter, write one impression, and kneel in prayer before opening your task list.',
  },
  {
    title: 'Minister to one person',
    category: 'Service',
    effort: 'small',
    importance: 8,
    description: 'Send a sincere message, make a call, or drop off a small note of encouragement.',
  },
  {
    title: 'Build a 25-minute focus block',
    category: 'Work',
    effort: 'medium',
    importance: 7,
    description: 'Pick the highest-impact project, silence distractions, and work until the timer ends.',
  },
  {
    title: 'Reset your space',
    category: 'Home',
    effort: 'medium',
    importance: 5,
    description: 'Clear one surface, start laundry, and make your environment easier to feel the Spirit in.',
  },
  {
    title: 'Care for your body',
    category: 'Health',
    effort: 'medium',
    importance: 6,
    description: 'Walk, stretch, hydrate, or plan a simple nourishing meal.',
  },
  {
    title: 'Plan tomorrow tonight',
    category: 'Planning',
    effort: 'small',
    importance: 6,
    description: 'Choose tomorrow’s top three tasks and put scripture study and prayer in the first square.',
  },
];

const defaultTasks = [
  {
    id: crypto.randomUUID(),
    title: 'Scripture study',
    category: 'Faith',
    effort: 'small',
    importance: 10,
    sacred: true,
    completed: false,
    notes: 'Study first, even if it is just one focused passage.',
  },
  {
    id: crypto.randomUUID(),
    title: 'Prayer',
    category: 'Faith',
    effort: 'small',
    importance: 10,
    sacred: true,
    completed: false,
    notes: 'Counsel with Heavenly Father before moving into the day.',
  },
  {
    id: crypto.randomUUID(),
    title: 'Review family and work commitments',
    category: 'Planning',
    effort: 'medium',
    importance: 6,
    sacred: false,
    completed: false,
    notes: 'Protect time for people and responsibilities that matter most.',
  },
];

const state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { tasks: defaultTasks, darkMode: false, selectedSuggestion: 0 };
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length ? parsed.tasks : defaultTasks,
      darkMode: Boolean(parsed.darkMode),
      selectedSuggestion: parsed.selectedSuggestion ?? 0,
    };
  } catch {
    return { tasks: defaultTasks, darkMode: false, selectedSuggestion: 0 };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function orderTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.sacred !== b.sacred) return a.sacred ? -1 : 1;
    if (b.importance !== a.importance) return b.importance - a.importance;
    const effortRank = { small: 3, medium: 2, large: 1 };
    return (effortRank[b.effort] ?? 0) - (effortRank[a.effort] ?? 0);
  });
}

function getMomentum() {
  const completed = state.tasks.filter((task) => task.completed).length;
  if (!state.tasks.length) return 0;
  return Math.round((completed / state.tasks.length) * 100);
}

function categoryTone(category) {
  const tones = {
    Faith: 'gold',
    Service: 'blue',
    Work: 'green',
    Home: 'rose',
    Health: 'mint',
    Planning: 'violet',
    Learning: 'amber',
  };
  return tones[category] ?? 'slate';
}

function render() {
  document.documentElement.dataset.theme = state.darkMode ? 'dark' : 'light';
  const orderedTasks = orderTasks(state.tasks);
  const momentum = getMomentum();
  const suggestion = inspirationBank[state.selectedSuggestion % inspirationBank.length];

  document.querySelector('#app').innerHTML = `
    <main class="shell">
      <section class="hero puzzle-card animate-in">
        <nav class="topbar" aria-label="App controls">
          <div class="brand">
            <span class="brand-mark">✦</span>
            <span>First Things Planner</span>
          </div>
          <button class="mode-toggle" type="button" data-action="toggle-mode" aria-label="Toggle light and dark mode">
            ${state.darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </nav>

        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">LDS-centered productivity</p>
            <h1>Put God first, then let the day fall into place.</h1>
            <p class="lede">
              Enter your goals and tasks. The planner keeps scripture study and prayer at the top,
              then sorts everything else by significance so your next right square is always clear.
            </p>
            <div class="hero-actions">
              <a class="primary-link" href="#task-form">Add today’s goals</a>
              <button class="ghost-link" type="button" data-action="add-faith-reset">Restore faith anchors</button>
            </div>
          </div>
          <div class="daily-board" aria-label="Daily priority board">
            ${orderedTasks
              .slice(0, 6)
              .map(
                (task, index) => `
                  <div class="board-tile ${task.sacred ? 'sacred' : ''}" style="--delay:${index * 70}ms">
                    <span>${index + 1}</span>
                    <strong>${escapeHtml(task.title)}</strong>
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
      </section>

      <section class="stats-row" aria-label="Planner summary">
        <article class="stat-card puzzle-card animate-in delay-1">
          <span>Momentum</span>
          <strong>${momentum}%</strong>
          <div class="meter"><i style="width:${momentum}%"></i></div>
        </article>
        <article class="stat-card puzzle-card animate-in delay-2">
          <span>Faith anchors</span>
          <strong>${state.tasks.filter((task) => task.sacred).length}</strong>
          <small>Scripture and prayer stay first.</small>
        </article>
        <article class="stat-card puzzle-card animate-in delay-3">
          <span>Planned squares</span>
          <strong>${state.tasks.length}</strong>
          <small>Ordered from most important to least.</small>
        </article>
      </section>

      <section class="planner-grid">
        <form id="task-form" class="task-form puzzle-card animate-in delay-2">
          <div>
            <p class="eyebrow">Add a square</p>
            <h2>What do you need to accomplish?</h2>
          </div>
          <label>
            Goal or task
            <input name="title" type="text" placeholder="Prepare lesson, finish budget, call mom..." required />
          </label>
          <div class="form-columns">
            <label>
              Area
              <select name="category">
                <option>Faith</option>
                <option>Family</option>
                <option>Service</option>
                <option>Work</option>
                <option>Home</option>
                <option>Health</option>
                <option>Learning</option>
                <option>Planning</option>
              </select>
            </label>
            <label>
              Significance
              <input name="importance" type="range" min="1" max="10" value="6" />
            </label>
          </div>
          <div class="form-columns">
            <label>
              Effort
              <select name="effort">
                <option value="small">Small</option>
                <option value="medium" selected>Medium</option>
                <option value="large">Large</option>
              </select>
            </label>
            <label class="checkbox-label">
              <input name="sacred" type="checkbox" />
              Treat as a spiritual priority
            </label>
          </div>
          <label>
            Notes or next step
            <textarea name="notes" rows="3" placeholder="Write the first faithful action..."></textarea>
          </label>
          <button class="submit-button" type="submit">Prioritize my day</button>
        </form>

        <section class="priority-list puzzle-card animate-in delay-3" aria-live="polite">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Ordered plan</p>
              <h2>Most important to least important</h2>
            </div>
            <button class="text-button" type="button" data-action="clear-completed">Clear completed</button>
          </div>
          <div class="task-stack">
            ${orderedTasks.map(renderTask).join('')}
          </div>
        </section>
      </section>

      <section class="idea-panel puzzle-card animate-in delay-4">
        <div>
          <p class="eyebrow">Need inspiration?</p>
          <h2>Try a guided goal</h2>
          <p>${escapeHtml(suggestion.description)}</p>
        </div>
        <div class="idea-card ${categoryTone(suggestion.category)}">
          <span>${escapeHtml(suggestion.category)}</span>
          <strong>${escapeHtml(suggestion.title)}</strong>
          <button type="button" data-action="add-suggestion">Add this plan</button>
          <button type="button" class="subtle" data-action="shuffle-suggestion">Show another</button>
        </div>
      </section>
    </main>
  `;

  bindEvents();
}

function renderTask(task, index) {
  return `
    <article class="task-item ${task.completed ? 'completed' : ''} ${task.sacred ? 'sacred' : ''}" style="--delay:${index * 45}ms">
      <button class="check" type="button" data-action="toggle-task" data-id="${task.id}" aria-label="Mark ${escapeHtml(task.title)} complete">
        ${task.completed ? '✓' : ''}
      </button>
      <div class="task-content">
        <div class="task-title-row">
          <strong>${escapeHtml(task.title)}</strong>
          <span class="tag ${categoryTone(task.category)}">${escapeHtml(task.category)}</span>
        </div>
        <p>${escapeHtml(task.notes || 'No notes yet. Choose the next faithful step.')}</p>
        <div class="task-meta">
          <span>Significance ${task.importance}/10</span>
          <span>${escapeHtml(task.effort)} effort</span>
          ${task.sacred ? '<span>Faith first</span>' : ''}
        </div>
      </div>
      <button class="delete" type="button" data-action="delete-task" data-id="${task.id}" aria-label="Delete ${escapeHtml(task.title)}">×</button>
    </article>
  `;
}

function bindEvents() {
  document.querySelector('#task-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title').trim();
    if (!title) return;

    state.tasks.push({
      id: crypto.randomUUID(),
      title,
      category: formData.get('category'),
      effort: formData.get('effort'),
      importance: Number(formData.get('importance')),
      sacred: formData.get('sacred') === 'on' || formData.get('category') === 'Faith',
      completed: false,
      notes: formData.get('notes').trim(),
    });
    event.currentTarget.reset();
    saveState();
    render();
  });

  document.querySelectorAll('[data-action]').forEach((element) => {
    element.addEventListener('click', () => handleAction(element));
  });
}

function handleAction(element) {
  const action = element.dataset.action;
  const id = element.dataset.id;

  if (action === 'toggle-mode') {
    state.darkMode = !state.darkMode;
  }

  if (action === 'toggle-task') {
    const task = state.tasks.find((item) => item.id === id);
    if (task) task.completed = !task.completed;
  }

  if (action === 'delete-task') {
    state.tasks = state.tasks.filter((task) => task.id !== id);
  }

  if (action === 'clear-completed') {
    state.tasks = state.tasks.filter((task) => !task.completed || task.sacred);
  }

  if (action === 'shuffle-suggestion') {
    state.selectedSuggestion = (state.selectedSuggestion + 1) % inspirationBank.length;
  }

  if (action === 'add-suggestion') {
    const suggestion = inspirationBank[state.selectedSuggestion % inspirationBank.length];
    state.tasks.push({
      id: crypto.randomUUID(),
      title: suggestion.title,
      category: suggestion.category,
      effort: suggestion.effort,
      importance: suggestion.importance,
      sacred: suggestion.category === 'Faith',
      completed: false,
      notes: suggestion.description,
    });
    state.selectedSuggestion = (state.selectedSuggestion + 1) % inspirationBank.length;
  }

  if (action === 'add-faith-reset') {
    ensureFaithAnchor('Scripture study', 'Study first, even if it is just one focused passage.');
    ensureFaithAnchor('Prayer', 'Counsel with Heavenly Father before moving into the day.');
  }

  saveState();
  render();
}

function ensureFaithAnchor(title, notes) {
  const exists = state.tasks.some((task) => task.title.toLowerCase() === title.toLowerCase());
  if (!exists) {
    state.tasks.unshift({
      id: crypto.randomUUID(),
      title,
      category: 'Faith',
      effort: 'small',
      importance: 10,
      sacred: true,
      completed: false,
      notes,
    });
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

render();
