import type { APIRoute } from 'astro';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const GET: APIRoute = async () => {
  try {
    const players = await prisma.player.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return new Response(JSON.stringify(players), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas pobierania graczy' }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ message: 'Nazwa gracza jest wymagana' }), { status: 400 });
    }

    const trimmedName = name.trim();

    const existingPlayer = await prisma.player.findUnique({
      where: { name: trimmedName },
    });

    if (existingPlayer) {
      return new Response(JSON.stringify({ message: 'Gracz o tej nazwie już istnieje' }), { status: 409 });
    }

    const newPlayer = await prisma.player.create({
      data: { name: trimmedName },
    });

    return new Response(JSON.stringify(newPlayer), { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: 'Błąd podczas tworzenia gracza' }), { status: 500 });
  }
};
