import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { username } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Find the VCard with the requested username
    const vcard = await prisma.vCard.findUnique({
      where: { username },
      include: {
        socialLinks: true,
        customLinks: true,
        skills: true,
        services: true,
        portfolio: true,
        testimonials: true,
        appearances: true,
        user: {
          select: {
            name: true,
            email: true,
            image: true
          }
        }
      }
    });
    
    if (!vcard) {
      return res.status(404).json({ error: 'VCard not found' });
    }
    
    if (!vcard.isPublic) {
      return res.status(403).json({ error: 'This VCard is private' });
    }
    
    // Increment view count
    await prisma.vCard.update({
      where: { id: vcard.id },
      data: { viewCount: { increment: 1 } }
    });
    
    return res.status(200).json(vcard);
  } catch (error) {
    console.error('Error fetching vcard:', error);
    return res.status(500).json({ error: 'Failed to fetch vcard' });
  }
}
