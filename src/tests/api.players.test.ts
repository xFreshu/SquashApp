import { describe, it, expect, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

// We import the API route functions directly to test them
import { GET, POST } from '../pages/api/players.ts';

const prisma = new PrismaClient();

describe('API: /api/players', () => {
  // Keep track of created players to clean up after tests
  const createdPlayerIds: number[] = [];

  afterAll(async () => {
    // Cleanup: Delete all players created during the tests
    if (createdPlayerIds.length > 0) {
      await prisma.player.deleteMany({
        where: {
          id: {
            in: createdPlayerIds,
          },
        },
      });
    }
  });

  it('should create a new player via POST and then retrieve it via GET', async () => {
    // 1. Create a new player
    const playerName = `TestPlayer_${Date.now()}`;
    const postRequest = new Request('http://localhost/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName }),
    });

    // We cast to `any` because we don't need the full Astro-specific context for this test
    const postResponse = await POST({ request: postRequest } as any);
    expect(postResponse.status).toBe(201);

    const newPlayer = await postResponse.json();
    expect(newPlayer).toHaveProperty('id');
    expect(newPlayer.name).toBe(playerName);
    createdPlayerIds.push(newPlayer.id);

    // 2. Retrieve all players and check if the new one is there
    const getResponse = await GET({} as any);
    expect(getResponse.status).toBe(200);
    
    const players = await getResponse.json();
    const foundPlayer = players.find((p: any) => p.id === newPlayer.id);
    
    expect(foundPlayer).toBeDefined();
    expect(foundPlayer.name).toBe(playerName);
  });

  it('should not create a player with a duplicate name', async () => {
    // 1. Create a player
    const playerName = `DuplicateTest_${Date.now()}`;
    const firstPostRequest = new Request('http://localhost/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName }),
    });
    const firstPostResponse = await POST({ request: firstPostRequest } as any);
    const firstPlayer = await firstPostResponse.json();
    createdPlayerIds.push(firstPlayer.id);
    expect(firstPostResponse.status).toBe(201);

    // 2. Attempt to create another player with the same name
    const secondPostRequest = new Request('http://localhost/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: playerName }),
    });
    const secondPostResponse = await POST({ request: secondPostRequest } as any);
    
    // Expect a 409 Conflict status, indicating a duplicate
    expect(secondPostResponse.status).toBe(409);
  });
});
