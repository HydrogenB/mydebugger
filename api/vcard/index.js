import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'You must be signed in to use this API' });
  }

  // Handle GET request - get user's vcard
  if (req.method === 'GET') {
    try {
      const vcard = await prisma.vcard.findUnique({
        where: { userId: session.user.id },
        include: {
          socialLinks: true,
          customLinks: true,
          skills: true,
          services: true,
          portfolio: true,
          testimonials: true,
          appearances: true
        }
      });
      
      if (!vcard) {
        return res.status(404).json({ error: 'VCard not found' });
      }
      
      return res.status(200).json(vcard);
    } catch (error) {
      console.error('Error fetching vcard:', error);
      return res.status(500).json({ error: 'Failed to fetch vcard' });
    }
  }
  
  // Handle POST request - create new vcard
  if (req.method === 'POST') {
    try {
      const { username, displayName, ...data } = req.body;
      
      // Enhanced validation for required fields
      if (!username || !displayName) {
        return res.status(400).json({ error: 'Username and display name are required' });
      }
      
      // Enhanced username validation - allow only letters, numbers, underscores, and hyphens
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!usernameRegex.test(username)) {
        return res.status(400).json({ 
          error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens' 
        });
      }
      
      // Check if username already exists - with better error message
      const existingVCard = await prisma.vCard.findUnique({
        where: { username },
      });
      
      if (existingVCard) {
        return res.status(400).json({ error: 'This username is already taken. Please choose a different one.' });
      }
      
      // Check if user already has a vcard
      const existingUserVCard = await prisma.vCard.findUnique({
        where: { userId: session.user.id },
      });
      
      if (existingUserVCard) {
        return res.status(400).json({ 
          error: 'You already have a vcard. Please update your existing card instead of creating a new one.' 
        });
      }

      // Create default appearance
      const defaultAppearance = await prisma.appearance.create({
        data: {
          name: `appearance_${nanoid(6)}`,
          theme: 'light',
          primary: '#3B82F6',
          secondary: '#10B981',
          font: 'Inter',
          userId: session.user.id
        }
      });

      // Create the vcard
      const vcard = await prisma.vCard.create({
        data: {
          username,
          displayName,
          ...data,
          user: {
            connect: { id: session.user.id },
          },
          appearances: {
            connect: { id: defaultAppearance.id }
          }
        },
      });
      
      return res.status(201).json(vcard);
    } catch (error) {
      console.error('Error creating vcard:', error);
      return res.status(500).json({ 
        error: 'Failed to create vcard. Please try again or contact support if the issue persists.' 
      });
    }
  }
  
  // Handle PUT request - update vcard
  if (req.method === 'PUT') {
    try {
      const { socialLinks, customLinks, skills, services, portfolio, testimonials, ...data } = req.body;
      
      // Get the user's vcard
      const vcard = await prisma.vCard.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!vcard) {
        return res.status(404).json({ error: 'VCard not found. Please create a VCard first.' });
      }

      // Check if username is being changed and if it's available
      if (data.username && data.username !== vcard.username) {
        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(data.username)) {
          return res.status(400).json({ 
            error: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens' 
          });
        }
        
        const existingUsername = await prisma.vCard.findUnique({
          where: { username: data.username },
        });
        
        if (existingUsername) {
          return res.status(400).json({ error: 'This username is already taken. Please choose a different one.' });
        }
      }
      
      // Validate URLs in data if present
      if (data.website) {
        data.website = ensureValidUrl(data.website);
      }
      
      // Update the vcard with basic fields
      const updatedVCard = await prisma.vCard.update({
        where: { id: vcard.id },
        data: { ...data },
      });
      
      // Update social links if provided
      if (socialLinks) {
        // Delete existing links
        await prisma.socialLink.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        // Create new links with URL validation
        if (socialLinks.length > 0) {
          await Promise.all(socialLinks.map(link => 
            prisma.socialLink.create({
              data: {
                platform: link.platform,
                url: ensureValidUrl(link.url),
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }

      // Update custom links if provided
      if (customLinks) {
        await prisma.customLink.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        if (customLinks.length > 0) {
          await Promise.all(customLinks.map(link => 
            prisma.customLink.create({
              data: {
                title: link.title,
                url: ensureValidUrl(link.url),
                icon: link.icon,
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }

      // Update skills if provided
      if (skills) {
        await prisma.skill.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        if (skills.length > 0) {
          await Promise.all(skills.map(skill => 
            prisma.skill.create({
              data: {
                name: skill.name.trim().substring(0, 50), // Limit skill name length
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }

      // Update services if provided
      if (services) {
        await prisma.service.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        if (services.length > 0) {
          await Promise.all(services.map(service => 
            prisma.service.create({
              data: {
                title: service.title.trim().substring(0, 100),
                description: service.description.trim().substring(0, 500),
                icon: service.icon,
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }

      // Update portfolio items if provided
      if (portfolio) {
        await prisma.portfolioItem.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        if (portfolio.length > 0) {
          await Promise.all(portfolio.map(item => 
            prisma.portfolioItem.create({
              data: {
                title: item.title.trim().substring(0, 100),
                description: item.description ? item.description.trim().substring(0, 500) : null,
                imageUrl: item.imageUrl,
                link: item.link ? ensureValidUrl(item.link) : null,
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }

      // Update testimonials if provided
      if (testimonials) {
        await prisma.testimonial.deleteMany({
          where: { vcardId: vcard.id }
        });
        
        if (testimonials.length > 0) {
          await Promise.all(testimonials.map(item => 
            prisma.testimonial.create({
              data: {
                name: item.name.trim().substring(0, 100),
                position: item.position ? item.position.trim().substring(0, 100) : null,
                content: item.content.trim().substring(0, 1000),
                avatar: item.avatar,
                vcard: { connect: { id: vcard.id } }
              }
            })
          ));
        }
      }
      
      // Get the full updated vcard with all relations
      const fullUpdatedVCard = await prisma.vCard.findUnique({
        where: { id: vcard.id },
        include: {
          socialLinks: true,
          customLinks: true,
          skills: true,
          services: true,
          portfolio: true,
          testimonials: true,
          appearances: true
        }
      });
      
      return res.status(200).json(fullUpdatedVCard);
    } catch (error) {
      console.error('Error updating vcard:', error);
      return res.status(500).json({ 
        error: 'Failed to update vcard. Please try again or contact support if the issue persists.',
        details: error.message 
      });
    }
  }

  // Handle DELETE request - delete vcard
  if (req.method === 'DELETE') {
    try {
      const vcard = await prisma.vCard.findUnique({
        where: { userId: session.user.id },
      });
      
      if (!vcard) {
        return res.status(404).json({ error: 'VCard not found' });
      }
      
      // Delete related appearance
      await prisma.appearance.deleteMany({
        where: { id: vcard.appearanceId }
      });
      
      // Delete the vcard (cascade will handle related entities)
      await prisma.vCard.delete({
        where: { id: vcard.id }
      });
      
      return res.status(200).json({ success: true, message: 'VCard deleted successfully' });
    } catch (error) {
      console.error('Error deleting vcard:', error);
      return res.status(500).json({ error: 'Failed to delete vcard' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Helper function to ensure URLs are valid
function ensureValidUrl(url) {
  if (!url) return url;
  
  url = url.trim();
  
  // If URL doesn't start with http:// or https://, add https://
  if (!url.match(/^https?:\/\//)) {
    url = `https://${url}`;
  }
  
  try {
    // Check if URL is valid
    new URL(url);
    return url;
  } catch (e) {
    // If URL is invalid, return null
    return null;
  }
}
