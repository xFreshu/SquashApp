import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Rozpoczynanie czyszczenia bazy danych...');

  // Delete all matches first due to foreign key constraints
  const deletedMatches = await prisma.match.deleteMany({});
  console.log(`Usunięto ${deletedMatches.count} meczów.`);

  // Then delete all players
  const deletedPlayers = await prisma.player.deleteMany({});
  console.log(`Usunięto ${deletedPlayers.count} graczy.`);

  console.log('Czyszczenie bazy danych zakończone.');
}

main()
  .catch((e) => {
    console.error('Wystąpił błąd podczas czyszczenia bazy danych:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
