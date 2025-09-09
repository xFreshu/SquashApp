import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET endpoint to retrieve all matches with player data included
export const GET: APIRoute = async () => {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        playerOne: true,
        playerTwo: true,
        winner: true,
      },
    });
    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas pobierania meczów' }), { status: 500 });
  }
};

// POST endpoint to create a new match
export const POST: APIRoute = async ({ request }) => {
  try {
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

    const newMatch = await prisma.match.create({
      data: {
        playerOneId,
        playerTwoId,
        playerOneScore,
        playerTwoScore,
        winnerId,
        durationInSeconds,
      },
    });

    return new Response(JSON.stringify(newMatch), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas zapisywania meczu' }), { status: 500 });
  }
};

// DELETE endpoint to clear all matches
export const DELETE: APIRoute = async () => {
  try {
    await prisma.match.deleteMany({});
    return new Response(JSON.stringify({ message: 'Historia meczów została wyczyszczona.' }), {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas czyszczenia historii meczów' }), { status: 500 });
  }
};