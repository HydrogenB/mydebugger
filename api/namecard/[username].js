import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { username } = req.query;

  if (req.method === 'GET') {
    try {
      const nameCard = await prisma.nameCard.findUnique({
        where: {
          username: username,
        },
        include: {
          links: true,
          user: {
            select: {
              name: true,
              image: true,
              email: true,
            },
          },
        },
      });

      if (!nameCard) {
        return res.status(404).json({ error: 'Name card not found' });
      }

      return res.status(200).json(nameCard);
    } catch (error) {
      console.error('Error fetching name card:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } 

  return res.status(405).json({ error: 'Method not allowed' });
}
