import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { usernameOrSlug } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!usernameOrSlug) {
    return res.status(400).json({ error: 'Username or slug is required' });
  }
  
  try {
    // Try to find namecard by username or slug
    const nameCard = await prisma.nameCard.findFirst({
      where: {
        OR: [
          { username: usernameOrSlug },
          { slug: usernameOrSlug }
        ]
      },
      include: {
        socialLinks: {
          orderBy: { displayOrder: 'asc' }
        },
        skills: {
          orderBy: { displayOrder: 'asc' }
        },
        education: {
          orderBy: { displayOrder: 'asc' }
        },
        experience: {
          orderBy: { displayOrder: 'asc' }
        },
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    if (!nameCard) {
      return res.status(404).json({ error: 'Name card not found' });
    }
    
    // Increment view count
    await prisma.nameCard.update({
      where: { id: nameCard.id },
      data: { viewCount: { increment: 1 } }
    });
    
    // Return the namecard
    return res.status(200).json(nameCard);
  } catch (error) {
    console.error('Error fetching namecard:', error);
    return res.status(500).json({ error: 'Failed to fetch namecard' });
  }
}
