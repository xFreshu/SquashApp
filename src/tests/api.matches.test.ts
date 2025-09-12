import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { PrismaClient, type Player } from '@prisma/client';

import { GET, POST, DELETE } from '../pages/api/matches.ts';

const prisma = new PrismaClient();

describe('API: /api/matches', () => {
  let testPlayer1: Player;
  let testPlayer2: Player;
  const createdMatchIds: number[] = [];

  // Create players before any tests run
  beforeAll(async () => {
    testPlayer1 = await prisma.player.create({
      data: { name: `MatchTestPlayer1_${Date.now()}` },
    });
    testPlayer2 = await prisma.player.create({
      data: { name: `MatchTestPlayer2_${Date.now()}` },
    });
  });

  // Clean up all created data
  afterAll(async () => {
    if (createdMatchIds.length > 0) {
      await prisma.match.deleteMany({ where: { id: { in: createdMatchIds } } });
    }
    await prisma.player.deleteMany({ where: { id: { in: [testPlayer1.id, testPlayer2.id] } } });
  });

  it('should create a new match via POST', async () => {
    const matchData = {
      playerOneId: testPlayer1.id,
      playerTwoId: testPlayer2.id,
      playerOneScore: 11,
      playerTwoScore: 5,
      winnerId: testPlayer1.id,
      durationInSeconds: 300,
    };

    const postRequest = new Request('http://localhost/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(matchData),
    });

    const postResponse = await POST({ request: postRequest } as any);
    expect(postResponse.status).toBe(201);

    const newMatch = await postResponse.json();
    expect(newMatch).toHaveProperty('id');
    expect(newMatch.playerOneId).toBe(testPlayer1.id);
    expect(newMatch.playerTwoId).toBe(testPlayer2.id);
    createdMatchIds.push(newMatch.id);
  });

  it('should retrieve matches via GET', async () => {
    // This test relies on the match created in the previous test
    const getResponse = await GET({} as any);
    expect(getResponse.status).toBe(200);

    const matches = await getResponse.json();
    expect(Array.isArray(matches)).toBe(true);
    expect(matches.length).toBeGreaterThan(0);

    const foundMatch = matches.find((m: any) => m.id === createdMatchIds[0]);
    expect(foundMatch).toBeDefined();
    expect(foundMatch.playerOne.name).toBe(testPlayer1.name);
    expect(foundMatch.winner.id).toBe(testPlayer1.id);
  });

  it('should clear all matches via DELETE', async () => {
    // Ensure there is at least one match to delete
    expect(createdMatchIds.length).toBeGreaterThan(0);

    const deleteRequest = new Request('http://localhost/api/matches', { method: 'DELETE' });
    const deleteResponse = await DELETE({ request: deleteRequest } as any);
    expect(deleteResponse.status).toBe(200);

    // Verify the history is now empty
    const getResponse = await GET({} as any);
    const matches = await getResponse.json();
    expect(matches.length).toBe(0);

    // Clear the local array as well since we deleted them from the DB
    createdMatchIds.length = 0;
  });
});
