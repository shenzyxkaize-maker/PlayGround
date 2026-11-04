(() => {
  'use strict';

  const SAVE_KEY = 'between-stops-save-v1';
  const initialState = () => ({
    scene: 0,
    cash: 3,
    energy: 4,
    closeness: 3,
    history: [],
    flags: {},
    pending: false,
    finished: false
  });

  const scenes = [
    {
      time: '7:12', period: 'AM', place: 'THE 14 BUS STOP', kicker: 'BEFORE THE SHIFT', title: 'The message on the counter',
      text: [
        'Dani has been standing at the bus stop for six minutes when her phone buzzes. It is her dad, Rafael: <em>First day trying the bus. I know where to get off. Don’t rearrange your day for me.</em>',
        'His follow-up appointment is at three. He came home after hip surgery three weeks ago and has been practicing the stairs like they are a private argument. Dani has a pharmacy shift at eight, and her manager mentioned someone might need to stay late.',
        'The bus is still nowhere in sight. Dani types a reply, deletes it, and watches the little typing cursor blink.'
      ],
      prompt: 'WHAT DOES DANI SEND?',
      choices: [
        { label: '“Text me when you get there. I’ll keep my phone on.”', response: 'A practical promise, not a rescue plan. Rafael replies with a thumbs-up, then sends a second one, as if the first might not have landed.', delta: { closeness: 1 }, flag: 'trust' },
        { label: 'Call the clinic and ask if the appointment can be moved to a time she can go.', response: 'The receptionist finds a slot tomorrow morning. It means another trip to arrange, but today has a little more breathing room.', delta: { energy: 1, cash: -1 }, flag: 'reschedule' },
        { label: 'Ask their neighbor June if she can be Rafael’s backup ride.', response: 'June says yes, then asks what time. Dani sends the details. Asking takes less time than she expected; accepting the answer takes a beat longer.', delta: { closeness: 1, energy: 1 }, flag: 'neighbor' }
      ]
    },
    {
      time: '8:06', period: 'AM', place: 'WILLOW STREET PHARMACY', kicker: 'CLOCKED IN', title: 'A favor with a price tag',
      text: [
        'The bus arrives with a sigh of brakes and the smell of wet leaves. By the time Dani reaches the pharmacy, the morning line is already curled past the greeting-card rack.',
        'Her manager, Mr. Patel, catches her by the stockroom door. Someone called out. “Could you stay until close? I can put the extra hours on this week’s check.” He looks tired too. He is not asking lightly.',
        'Dani thinks of the appointment at three, and of the electricity bill folded under a magnet at home.'
      ],
      prompt: 'HOW DOES SHE ANSWER?',
      choices: [
        { label: 'Take the extra hours, and work out a plan for the appointment later.', response: 'Mr. Patel looks relieved and writes her name on the schedule. The extra pay will matter. The rest of the day gets tighter around the edges.', delta: { cash: 2, energy: -1, closeness: -1 }, flag: 'overtime' },
        { label: 'Offer to stay one extra hour, then leave for the appointment.', response: 'They make a small compromise: one hour of coverage, and a clear handoff. It is not the whole favor he needed, but it is something he can plan around.', delta: { cash: 1, energy: -1 }, flag: 'partialshift' },
        { label: 'Say she can’t today, and explain the appointment plainly.', response: 'There is a pause. Then Mr. Patel nods and moves a name on the roster. Dani feels the sting of saying no, and also the odd relief of not inventing an excuse.', delta: { energy: 1, closeness: 1 }, flag: 'declinedshift' }
      ]
    },
    {
      time: '12:24', period: 'PM', place: 'THE BREAK ROOM', kicker: 'A SMALL PAUSE', title: 'Lunch, if you can call it that',
      text: [
        'At lunch, Dani finds Rafael’s note in her bag: a grocery list on the back of an old envelope. Milk. Oats. The tea he likes. At the bottom, in his careful block letters: <em>I can get the bus by myself.</em>',
        'She has twenty minutes before the next prescription pickup. The break-room microwave hums. Someone has left a clementine in the fruit bowl with a tiny sticker still on it.',
        'Dani sets the envelope beside her sandwich. She can answer now, or give herself the whole twenty minutes.'
      ],
      prompt: 'WHERE DOES THE BREAK GO?',
      choices: [
        { label: 'Call Dad. Ask what part of today he wants help with—and what part he doesn’t.', response: '“I can do the bus,” Rafael says. “I could use help with the stairs at the clinic.” It is a useful answer. It is also nice to hear his voice instead of guessing at it.', delta: { closeness: 2, energy: -1 }, flag: 'asked' },
        { label: 'Eat slowly, step outside for air, and text that you’ll talk after the appointment.', response: 'The alley is quiet except for a delivery truck backing up two blocks away. For ten minutes, Dani does not need to be anyone’s backup plan.', delta: { energy: 2 }, flag: 'rested' },
        { label: 'Use the break to check the bus route and write the clinic directions on the envelope.', response: 'She draws the transfer in blue pen, with the stop circled twice. It is the kind of help that can fit in a pocket without making a big announcement.', delta: { energy: 1, closeness: 1 }, flag: 'route' }
      ]
    },
    {
      time: '2:41', period: 'PM', place: 'WILLOW STREET PHARMACY', kicker: 'THE AFTERNOON RUSH', title: 'The call from the clinic',
      text: [
        'The pharmacy phone rings as the after-school rush begins. Rafael is outside the clinic. The bus he expected did not come, and the next one will get him there twenty minutes after his appointment.',
        '“I can wait,” he says. In the background, a bus exhales at the curb. He does not sound panicked. He does sound like he has been trying not to be a problem all day.',
        'Dani glances at the queue, then at the clock above the register. There are several ways to help. None of them make the afternoon longer.'
      ],
      prompt: 'WHAT DOES SHE DO?',
      choices: [
        { label: 'Ask a coworker to cover the register and call Rafael a rideshare.', response: 'A coworker swaps places without making a fuss. The ride costs more than a bus fare, but Rafael gets to the clinic before they close the check-in desk.', delta: { cash: -1, closeness: 1, energy: -1 }, flag: 'rideshare' },
        { label: 'Call June and ask if she can meet Rafael at the stop.', response: 'June is already on her way home. She changes direction and promises to meet him at the clinic entrance. Dani lets herself say thank you twice.', delta: { closeness: 2 }, flag: 'helped' },
        { label: 'Stay on the phone and talk him through the next bus and the transfer.', response: 'They check the route together, one stop at a time. Rafael reads the street names aloud. Dani listens for the moment his voice steadies.', delta: { energy: -1, closeness: 1 }, flag: 'guided' }
      ]
    },
    {
      time: '6:18', period: 'PM', place: 'THE APARTMENT KITCHEN', kicker: 'BACK HOME', title: 'The envelope under the magnet',
      text: [
        'The apartment smells like toasted bread. Rafael is home, shoes lined up neatly by the door. The appointment is over; the doctor says the healing is on track. The grocery envelope sits under its usual magnet, softened at the fold.',
        'Dani is tired in the specific way that makes small decisions feel like paperwork. Rafael asks whether she wants to go over the new exercises together. The electricity bill waits on the counter. So does dinner.',
        'For a moment, neither of them moves. The kettle clicks off.'
      ],
      prompt: 'HOW DO THEY SPEND THE EVENING?',
      choices: [
        { label: 'Make a simple dinner together and let the bill wait until morning.', response: 'They make eggs and toast. Rafael gets the plates; Dani handles the hot pan. The bill stays under the magnet, still real, but not the only thing in the room.', delta: { energy: 1, closeness: 2 }, flag: 'sharedmeal' },
        { label: 'Sit down with the bill and make a short plan for the week.', response: 'They list what is due, what can wait, and which day Rafael can take the bus alone. The numbers are not generous. At least they are both looking at the same page.', delta: { cash: 1, energy: -1, closeness: 1 }, flag: 'madeplan' },
        { label: 'Ask Dad to start the exercises while you take twenty minutes to yourself.', response: 'Rafael nods. “I can do twenty minutes.” Dani sits by the open window with a glass of water, hearing the quiet repetitions from the next room.', delta: { energy: 2 }, flag: 'quiet' }
      ]
    }
  ];

  let state = initialState();
  const $ = (id) => document.getElementById(id);
  const intro = $('intro-screen');
  const game = $('game-screen');
  const sceneArea = $('choice-area');
  const afterChoice = $('after-choice');
  let toastTimer;

  function save() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) { /* Private browsing can disable storage. */ }
  }
  function normalizeState(saved) {
    if (!saved || !Number.isInteger(saved.scene) || !Array.isArray(saved.history)) return null;
    const normalized = initialState();
    normalized.scene = Math.max(0, Math.min(saved.scene, scenes.length));
    const resource = (value, fallback) => Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : fallback;
    normalized.cash = resource(saved.cash, normalized.cash);
    normalized.energy = resource(saved.energy, normalized.energy);
    normalized.closeness = resource(saved.closeness, normalized.closeness);
    normalized.history = saved.history;
    normalized.flags = saved.flags && typeof saved.flags === 'object' ? saved.flags : {};
    normalized.finished = Boolean(saved.finished);
    normalized.pending = Boolean(saved.pending);
    return normalized;
  }
  function readSave() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      return normalizeState(saved);
    } catch (_) { /* Ignore incomplete or unavailable saves. */ }
    return null;
  }
  function showToast(message) {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }
  function showGame() {
    intro.classList.add('hidden');
    game.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    renderScene();
  }
  function begin(resume = false) {
    if (!resume) {
      state = initialState();
      save();
      hideJournal();
      showGame();
      return;
    }
    const saved = readSave();
    if (saved) {
      state = saved;
      showGame();
      return;
    }
    showToast('No saved day found.');
  }
  function updateMeter(name, value) {
    state[name] = Math.max(0, Math.min(5, value));
    $(`${name}-value`).textContent = state[name];
    const meter = $(`${name}-meter`);
    [...meter.children].forEach((tick, index) => tick.classList.toggle('filled', index < state[name]));
    meter.setAttribute('aria-label', `${name === 'cash' ? 'Cash buffer' : name === 'energy' ? 'Energy' : 'Closeness'} ${state[name]} of 5`);
  }
  function updateSidebar() {
    updateMeter('cash', state.cash);
    updateMeter('energy', state.energy);
    updateMeter('closeness', state.closeness);
    $('journal-count').textContent = state.history.length;
    const index = Math.min(state.scene, 5);
    $('progress-fill').style.width = `${Math.max(16, (index + (state.finished ? 1 : 0)) / 6 * 100)}%`;
    $('chapter-count').textContent = `${String(Math.min(index + 1, 6)).padStart(2, '0')} / 06`;
  }
  function renderScene() {
    updateSidebar();
    if (state.scene >= scenes.length) {
      renderEnding();
      return;
    }
    const scene = scenes[state.scene];
    $('story-time').innerHTML = `${scene.time}<span>${scene.period}</span>`;
    $('story-place').textContent = scene.place;
    $('scene-kicker').textContent = scene.kicker;
    $('scene-index').textContent = String(state.scene + 1).padStart(2, '0');
    $('scene-title').textContent = scene.title;
    $('scene-text').innerHTML = scene.text.map(paragraph => `<p>${paragraph}</p>`).join('');
    sceneArea.innerHTML = `<div class="choice-prompt">${scene.prompt}</div>`;
    scene.choices.forEach((choice, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'choice-button';
      button.innerHTML = `<span class="choice-key">0${index + 1}</span><span class="choice-label"></span><span class="choice-arrow" aria-hidden="true">↗</span>`;
      button.querySelector('.choice-label').textContent = choice.label;
      button.addEventListener('click', () => choose(choice));
      sceneArea.appendChild(button);
    });
    sceneArea.classList.remove('hidden');
    afterChoice.classList.add('hidden');
    $('ending-actions').classList.add('hidden');
    if (state.pending && state.history.length && state.history[state.history.length - 1].scene === scene.title) {
      sceneArea.classList.add('hidden');
      $('response-text').textContent = state.history[state.history.length - 1].response;
      afterChoice.classList.remove('hidden');
    }
    updateJournal();
  }
  function choose(choice) {
    if (afterChoice.classList.contains('hidden') === false) return;
    const scene = scenes[state.scene];
    const changes = choice.delta || {};
    Object.entries(changes).forEach(([key, amount]) => updateMeter(key, state[key] + amount));
    if (choice.flag) state.flags[choice.flag] = true;
    state.history.push({ scene: scene.title, time: `${scene.time} ${scene.period}`, choice: choice.label, response: choice.response });
    state.pending = true;
    $('response-text').textContent = choice.response;
    sceneArea.classList.add('hidden');
    afterChoice.classList.remove('hidden');
    $('continue-button').focus({ preventScroll: true });
    updateSidebar();
    updateJournal();
    save();
  }
  function continueStory() {
    state.pending = false;
    state.scene += 1;
    save();
    renderScene();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function renderEnding() {
    state.finished = true;
    save();
    updateSidebar();
    const { cash, energy, closeness, flags } = state;
    let title, kicker, paragraphs;
    if (closeness >= 4 && energy >= 2) {
      kicker = 'A LITTLE MORE ROOM';
      title = 'The table for two';
      paragraphs = [
        'The kitchen light is the warm yellow one. Rafael tells Dani a story about the bus driver who waited while he counted out his change. He does the hand gesture for the driver’s expression, and she laughs before she can stop herself.',
        flags.asked ? 'The new exercises are on the fridge now, with a note in Rafael’s handwriting: <em>Ask before helping.</em> Dani adds a small check mark beside tomorrow’s first one.' : 'They do not solve the whole week tonight. They make enough of it feel shared that tomorrow does not look quite so steep.',
        'Outside, the last bus of the evening slides past the window. It is going somewhere. For once, nobody has to catch it.'
      ];
    } else if (cash <= 2) {
      kicker = 'A PLAN WITH MARGINS';
      title = 'Tomorrow, in pencil';
      paragraphs = [
        'The electricity bill gets a date beside it and a number beside that. It is not the number Dani would choose, but it is one they can start from. Rafael offers to make breakfast tomorrow; Dani lets him.',
        flags.neighbor || flags.helped ? 'June’s name is added to the paper beside the clinic times—not as a last resort, just as someone they can ask. The list is still a list. It feels less like a wall.' : 'They write down the bus times, the next refill, and the day the extra hours land on the check. The week is still tight. At least it has edges now.',
        'Nothing about the day was easy. A few parts, though, were easier because someone else knew about them.'
      ];
    } else if (energy <= 2) {
      kicker = 'THE QUIET AFTER';
      title = 'A chair by the window';
      paragraphs = [
        'Dani sits by the open window with both feet on the floor. In the next room, Rafael counts through the exercises, then starts over when he loses track. The second time, he gets all the way to ten.',
        'There is no big conversation tonight. There is water on the table, tomorrow’s appointment written where they can both see it, and the relief of not having to decide everything before bed.',
        'The neighborhood settles into its nighttime sounds. Dani takes one slow breath, and then another.'
      ];
    } else {
      kicker = 'AN ORDINARY KIND OF GOOD';
      title = 'One thing at a time';
      paragraphs = [
        'The kettle clicks off again. Dani and Rafael have covered the things that needed covering today: the ride, the refill, the bill. They have not covered everything. They have stopped pretending they have to.',
        flags.overtime ? 'Dani sets an alarm for the early bus and folds the extra-shift schedule into her pocket. Rafael is already planning what he will make for breakfast.' : 'Rafael puts tomorrow’s bus times beside the grocery list. Dani promises to check in after work—not every hour, just once, like they agreed.',
        'The day ends the way most days do: with a light switched off, a door left open a crack, and the next morning waiting without asking for an answer yet.'
      ];
    }
    $('story-time').innerHTML = '8:36<span>PM</span>';
    $('story-place').textContent = 'HOME, SOUTH END';
    $('scene-kicker').textContent = kicker;
    $('scene-index').textContent = '06';
    $('scene-title').textContent = title;
    $('scene-text').innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
    sceneArea.classList.add('hidden');
    afterChoice.classList.add('hidden');
    $('ending-actions').classList.remove('hidden');
    updateJournal();
    save();
  }
  function updateJournal() {
    const list = $('journal-list');
    if (!state.history.length) {
      list.innerHTML = '<p class="journal-empty">The day hasn’t started yet. Your choices will find their way here.</p>';
      return;
    }
    list.innerHTML = state.history.map(entry => `<article class="journal-entry"><div class="entry-time">${escapeHtml(entry.time)}</div><h4>${escapeHtml(entry.scene)}</h4><p>You chose: “${escapeHtml(entry.choice)}”</p></article>`).join('');
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function hideJournal() { $('journal-drawer').classList.add('hidden'); }

  $('start-button').addEventListener('click', () => begin(false));
  $('resume-button').addEventListener('click', () => begin(true));
  $('continue-button').addEventListener('click', continueStory);
  $('restart-button').addEventListener('click', () => begin(false));
  $('home-link').addEventListener('click', (event) => {
    event.preventDefault();
    game.classList.add('hidden');
    intro.classList.remove('hidden');
    const saved = readSave();
    $('resume-button').classList.toggle('hidden', !saved);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('journal-button').addEventListener('click', () => $('journal-drawer').classList.remove('hidden'));
  $('review-button').addEventListener('click', () => $('journal-drawer').classList.remove('hidden'));
  $('close-journal').addEventListener('click', () => $('journal-drawer').classList.add('hidden'));
  $('journal-drawer').addEventListener('click', event => { if (event.target === $('journal-drawer')) $('journal-drawer').classList.add('hidden'); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') $('journal-drawer').classList.add('hidden');
    if (game.classList.contains('hidden') || !afterChoice.classList.contains('hidden')) return;
    const number = Number(event.key);
    if (number >= 1 && number <= 3) {
      const options = sceneArea.querySelectorAll('.choice-button');
      if (options[number - 1]) options[number - 1].click();
    }
  });

  const saved = readSave();
  if (saved) {
    $('resume-button').classList.remove('hidden');
    $('start-button').querySelector('span').textContent = 'Start a new day';
  }
})();
