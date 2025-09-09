import type { APIRoute } from 'astro';
import { promises as fs } from 'fs';
import path from 'path';

// Define the path to the JSON database file
const dbPath = path.join(process.cwd(), 'data', 'db.json');

// Helper function to read the database
async function readDb() {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    // If the file does not exist or is empty, return a default structure
    if (error.code === 'ENOENT') {
        return { players: [], matches: [] };
    }
    throw error;
  }
}

// Helper function to write to the database
async function writeDb(data: any) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET endpoint to retrieve all players
export const GET: APIRoute = async () => {
  try {
    const db = await readDb();
    // Sort players by creation date, newest first
    const sortedPlayers = db.players.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return new Response(JSON.stringify(sortedPlayers), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas odczytu danych' }), { status: 500 });
  }
};

// POST endpoint to create a new player
export const POST: APIRoute = async ({ request }) => {
  try {
    const db = await readDb();
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ message: 'Nazwa gracza jest wymagana' }), { status: 400 });
    }

    const trimmedName = name.trim();
    const existingPlayer = db.players.find((p: any) => p.name.toLowerCase() === trimmedName.toLowerCase());

    if (existingPlayer) {
      return new Response(JSON.stringify({ message: 'Gracz o tej nazwie już istnieje' }), { status: 409 });
    }

    const newPlayer = {
      id: Date.now(), // Simple unique ID generation
      createdAt: new Date().toISOString(),
      name: trimmedName,
    };

    db.players.push(newPlayer);
    await writeDb(db);

    return new Response(JSON.stringify(newPlayer), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas zapisu danych' }), { status: 500 });
  }
};