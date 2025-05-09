import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to create a slug from username
const createSlug = (username) => {
  return username.toLowerCase()
    .replace(/[^\w\s-]/g, '')  // Remove non-word chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  // Check authentication
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to use this API' });
  }

  if (req.method === 'POST') {
    // Create new namecard
    try {
      const { username, displayName, ...data } = req.body;
      
      if (!username || !displayName) {
        return res.status(400).json({ error: 'Username and display name are required' });
      }
      
      // Check if username already exists
      const existing = await prisma.nameCard.findUnique({
        where: { username },
      });
      
      if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Check if user already has a namecard
      const existingUserCard = await prisma.nameCard.findUnique({
        where: { userId: session.user.id },
      });
      
      if (existingUserCard) {
        return res.status(400).json({ error: 'You already have a namecard' });
      }

      // Create the namecard
      const slug = createSlug(username);
      const nameCard = await prisma.nameCard.create({
        data: {
          username,
          slug,
          displayName,
          ...data,
          user: {
            connect: { id: session.user.id },
          },
        },
      });
      
      return res.status(201).json(nameCard);
    } catch (error) {
      console.error('Error creating namecard:', error);
      return res.status(500).json({ error: 'Failed to create namecard' });
    }
  } else if (req.method === 'GET') {
    // Get user's namecard
    try {
      const nameCard = await prisma.nameCard.findUnique({
        where: { userId: session.user.id },
        include: {
          socialLinks: true,
          skills: {
            orderBy: { displayOrder: 'asc' }
          },
          education: {
            orderBy: { displayOrder: 'asc' }
          },
          experience: {
            orderBy: { displayOrder: 'asc' }
          }
        }
      });
      
      if (!nameCard) {
        return res.status(404).json({ error: 'Namecard not found' });
      }
      
      return res.status(200).json(nameCard);
    } catch (error) {
      console.error('Error fetching namecard:', error);
      return res.status(500).json({ error: 'Failed to fetch namecard' });
    }
  } else if (req.method === 'PUT') {
    // Update namecard
    try {
      const nameCard = await prisma.nameCard.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!nameCard) {
        return res.status(404).json({ error: 'Namecard not found' });
      }
      
      // Update basic fields
      const { username, socialLinks, skills, education, experience, ...data } = req.body;
      
      // Check if updating username and if it exists
      if (username && username !== nameCard.username) {
        const existingUsername = await prisma.nameCard.findUnique({
          where: { username },
        });
        
        if (existingUsername) {
          return res.status(400).json({ error: 'Username already exists' });
        }
      }
      
      // Update the namecard with basic fields
      let updatedCard = await prisma.nameCard.update({
        where: { id: nameCard.id },
        data: {
          ...(username && { username, slug: createSlug(username) }),
          ...data,
        },
      });
      
      // Update related records if provided
      if (socialLinks) {
        // Delete existing links
        await prisma.socialLink.deleteMany({
          where: { nameCardId: nameCard.id }
        });
        
        // Create new links
        if (socialLinks.length > 0) {
          await prisma.socialLink.createMany({
            data: socialLinks.map((link, index) => ({
              ...link,
              nameCardId: nameCard.id,
              displayOrder: index
            }))
          });
        }
      }
      
      // Update skills if provided
      if (skills) {
        // Delete existing skills
        await prisma.skill.deleteMany({
          where: { nameCardId: nameCard.id }
        });
        
        // Create new skills
        if (skills.length > 0) {
          await prisma.skill.createMany({
            data: skills.map((skill, index) => ({
              ...skill,
              nameCardId: nameCard.id,
              displayOrder: index
            }))
          });
        }
      }
      
      // Update education if provided
      if (education) {
        // Delete existing education entries
        await prisma.education.deleteMany({
          where: { nameCardId: nameCard.id }
        });
        
        // Create new education entries
        if (education.length > 0) {
          await prisma.education.createMany({
            data: education.map((edu, index) => ({
              ...edu,
              nameCardId: nameCard.id,
              displayOrder: index
            }))
          });
        }
      }
      
      // Update experience if provided
      if (experience) {
        // Delete existing experience entries
        await prisma.experience.deleteMany({
          where: { nameCardId: nameCard.id }
        });
        
        // Create new experience entries
        if (experience.length > 0) {
          await prisma.experience.createMany({
            data: experience.map((exp, index) => ({
              ...exp,
              nameCardId: nameCard.id,
              displayOrder: index
            }))
          });
        }
      }
      
      // Get updated namecard with all relations
      const fullUpdatedCard = await prisma.nameCard.findUnique({
        where: { id: nameCard.id },
        include: {
          socialLinks: true,
          skills: true,
          education: true,
          experience: true
        }
      });
      
      return res.status(200).json(fullUpdatedCard);
    } catch (error) {
      console.error('Error updating namecard:', error);
      return res.status(500).json({ error: 'Failed to update namecard' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
