import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { username, displayName, title, bio, phoneNumber, email, website, location, company, links, skills } = req.body;

    // Check if username is available
    const existingNameCard = await prisma.nameCard.findUnique({
      where: {
        username,
      },
    });

    if (existingNameCard) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create name card
    const nameCard = await prisma.nameCard.create({
      data: {
        username,
        displayName,
        title,
        bio,
        phoneNumber,
        email,
        website,
        location,
        company,
        skills,
        user: {
          connect: {
            id: session.user.id,
          },
        },
        links: {
          create: links?.map(link => ({
            platform: link.platform,
            url: link.url,
          })) || [],
        },
      },
      include: {
        links: true,
      },
    });

    return res.status(201).json(nameCard);
  } catch (error) {
    console.error('Error creating name card:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
