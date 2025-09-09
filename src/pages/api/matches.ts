import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    // --- DEBUGGING LOGS START ---
    console.log('--- Otrzymano dane w API /api/matches ---');
    console.log('Cały obiekt body:', body);
    console.log('Typy danych:');
    for (const key in body) {
      console.log(`  - ${key}: ${typeof body[key]}`);
    }
    console.log('--- Koniec logów diagnostycznych ---');
    // --- DEBUGGING LOGS END ---

    const { playerOneId, playerTwoId, playerOneScore, playerTwoScore, winnerId, durationInSeconds } = body;

    if (
      playerOneId === undefined ||
      playerTwoId === undefined ||
      playerOneScore === undefined ||
      playerTwoScore === undefined ||
      winnerId === undefined ||
      durationInSeconds === undefined
    ) {
      return new Response(JSON.stringify({ message: 'Brak wszystkich wymaganych danych meczu' }), {
        status: 400,
      });
    }

    const newMatch = await prisma.match.create({
      data: {
        playerOneId: playerOneId,
        playerTwoId: playerTwoId,
        playerOneScore: playerOneScore,
        playerTwoScore: playerTwoScore,
        winnerId: winnerId,
        durationInSeconds: durationInSeconds,
      },
    });

    return new Response(JSON.stringify(newMatch), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('!!! Błąd krytyczny w API /api/matches !!!');
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas zapisywania meczu' }), {
      status: 500,
    });
  }
};

export const GET: APIRoute = async () => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        playerOne: true,
        playerTwo: true,
        winner: true,
      },
    });
    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas pobierania meczów' }), {
      status: 500,
    });
  }
};
