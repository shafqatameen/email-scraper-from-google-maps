import { promises as fs } from 'fs';
import path from 'path';

export interface HistorySession {
  id: string;
  query: string;
  date: string;
  totalResults: number;
  data: any[];
}

const dataDir = path.join(process.cwd(), 'data');
const historyFile = path.join(dataDir, 'history.json');

// Ensure the directory exists
async function ensureDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    // ignore
  }
}

export async function getHistory(): Promise<HistorySession[]> {
  await ensureDir();
  try {
    const data = await fs.readFile(historyFile, 'utf8');
    return JSON.parse(data);
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

export async function saveHistorySession(session: HistorySession): Promise<void> {
  const history = await getHistory();
  // Insert at the beginning so newest is first
  history.unshift(session);
  await fs.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf8');
}

export async function deleteHistorySession(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter(s => s.id !== id);
  await fs.writeFile(historyFile, JSON.stringify(filtered, null, 2), 'utf8');
}

export async function clearHistory(): Promise<void> {
  await ensureDir();
  await fs.writeFile(historyFile, JSON.stringify([], null, 2), 'utf8');
}
