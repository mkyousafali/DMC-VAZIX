import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';
const { Client } = pg;

const dir = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(join(dir, '../.env'), 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const i = t.indexOf('=');
  if (i < 0) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const client = new Client({ connectionString: env.SUPABASE_DIRECT_CONNECTION_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const sql = `
INSERT INTO saved_notes (user_id, category, title, content, is_quick_note)
SELECT u.id, v.cat, v.title, v.content, true
FROM app_users u,
(VALUES
  ('mood',       'Feeling happy',      'Feeling happy today'),
  ('mood',       'Low mood',           'Mood is low today'),
  ('mood',       'Irritable',          'Feeling irritable and on edge'),
  ('mood',       'Hopeful',            'Feeling hopeful'),
  ('mood',       'Depressed',          'Feeling depressed'),
  ('mood',       'Grateful',           'Feeling grateful today'),
  ('stress',     'High stress',        'High stress today'),
  ('stress',     'Overwhelmed',        'Feeling overwhelmed'),
  ('stress',     'Manageable',         'Stress is manageable today'),
  ('stress',     'Burned out',         'Feeling burned out'),
  ('anxiety',    'Panic attack',       'Had a panic attack'),
  ('anxiety',    'Racing thoughts',    'Racing thoughts and cant switch off'),
  ('anxiety',    'Anxious morning',    'Anxious in the morning'),
  ('anxiety',    'Social anxiety',     'Social anxiety triggered today'),
  ('anxiety',    'Chest tight',        'Chest tightness and shallow breathing'),
  ('sleep',      'Insomnia',           'Could not sleep last night'),
  ('sleep',      'Vivid dreams',       'Had vivid or disturbing dreams'),
  ('sleep',      'Slept early',        'Went to bed early tonight'),
  ('sleep',      'Napped',             'Took a nap during the day'),
  ('sleep',      'Woke early',         'Woke up too early and could not sleep again'),
  ('trigger',    'Family conflict',    'Family conflict triggered my mood'),
  ('trigger',    'Financial stress',   'Financial stress weighing on me'),
  ('trigger',    'Work deadline',      'Work deadline causing pressure'),
  ('trigger',    'Loneliness',         'Feeling lonely and isolated'),
  ('trigger',    'Bad news',           'Received some bad news today'),
  ('trigger',    'Rejection',          'Experienced rejection'),
  ('activity',   'Walk',               'Went for a walk outside'),
  ('activity',   'Exercise',           'Did exercise or workout today'),
  ('activity',   'Rest day',           'Rest day with no physical activity'),
  ('activity',   'Yoga',               'Did yoga or stretching'),
  ('activity',   'Social time',        'Spent time with friends or family'),
  ('activity',   'Creative',           'Did something creative today'),
  ('medication', 'Took medication',    'Took medication as scheduled'),
  ('medication', 'Missed dose',        'Missed a dose today'),
  ('medication', 'Side effects',       'Experiencing side effects from medication'),
  ('medication', 'New medication',     'Started a new medication today'),
  ('health',     'Body pain',          'Experiencing body pain today'),
  ('health',     'Fatigue',            'Feeling fatigued and low energy'),
  ('health',     'Appetite loss',      'Loss of appetite today'),
  ('health',     'Ate well',           'Ate well and nutritious meals today'),
  ('general',    'Good day',           'Overall it was a good day'),
  ('general',    'Bad day',            'Overall it was a difficult day'),
  ('general',    'Mixed day',          'Mixed feelings throughout the day')
) AS v(cat, title, content)
WHERE u.username = 'yousafali'
ON CONFLICT DO NOTHING;
`;

await client.query(sql);
console.log('Done — added more quick note presets');
await client.end();
