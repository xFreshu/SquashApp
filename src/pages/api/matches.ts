import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { playerOneId, playerTwoId, playerOneScore, playerTwoScore, winnerId } = body;

    if (
      playerOneId === undefined ||
      playerTwoId === undefined ||
      playerOneScore === undefined ||
      playerTwoScore === undefined ||
      winnerId === undefined
    ) {
      return new Response(JSON.stringify({ message: 'Brak wszystkich wymaganych danych meczu' }), {
        status: 400,
      });
    }

    const newMatch = await prisma.match.create({
      data: {
        playerOneId,
        playerTwoId,
        playerOneScore,
        playerTwoScore,
        winnerId,
      },
    });

    return new Response(JSON.stringify(newMatch), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
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
