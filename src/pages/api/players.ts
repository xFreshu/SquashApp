import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Endpoint to get all players
export const GET: APIRoute = async () => {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return new Response(JSON.stringify(players), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas pobierania graczy' }), {
      status: 500,
    });
  }
};

// Endpoint to create a new player
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ message: 'Nazwa gracza jest wymagana' }), {
        status: 400,
      });
    }

    const existingPlayer = await prisma.player.findUnique({
      where: { name: name.trim() },
    });

    if (existingPlayer) {
      return new Response(JSON.stringify({ message: 'Gracz o tej nazwie już istnieje' }), {
        status: 409, // Conflict
      });
    }

    const newPlayer = await prisma.player.create({
      data: {
        name: name.trim(),
      },
    });

    return new Response(JSON.stringify(newPlayer), {
      status: 201, // Created
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas tworzenia gracza' }), {
      status: 500,
    });
  }
};
