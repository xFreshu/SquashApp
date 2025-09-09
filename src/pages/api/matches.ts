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

// GET endpoint to retrieve all matches with player data included
export const GET: APIRoute = async () => {
  try {
    const db = await readDb();
    
    // Manually "include" or "join" player data into matches
    const enrichedMatches = db.matches.map((match: any) => ({
      ...match,
      playerOne: db.players.find((p: any) => p.id === match.playerOneId),
      playerTwo: db.players.find((p: any) => p.id === match.playerTwoId),
      winner: db.players.find((p: any) => p.id === match.winnerId),
    }));

    const sortedMatches = enrichedMatches.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return new Response(JSON.stringify(sortedMatches), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas odczytu danych' }), { status: 500 });
  }
};

// POST endpoint to create a new match
export const POST: APIRoute = async ({ request }) => {
  try {
    const db = await readDb();
    const body = await request.json();
    const { playerOneId, playerTwoId, playerOneScore, playerTwoScore, winnerId, durationInSeconds } = body;

    if (
      playerOneId === undefined ||
      playerTwoId === undefined ||
      playerOneScore === undefined ||
      playerTwoScore === undefined ||
      winnerId === undefined ||
      durationInSeconds === undefined
    ) {
      return new Response(JSON.stringify({ message: 'Brak wszystkich wymaganych danych meczu' }), { status: 400 });
    }

    const newMatch = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      playerOneId,
      playerTwoId,
      playerOneScore,
      playerTwoScore,
      winnerId,
      durationInSeconds,
    };

    db.matches.push(newMatch);
    await writeDb(db);

    return new Response(JSON.stringify(newMatch), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas zapisu danych' }), { status: 500 });
  }
};