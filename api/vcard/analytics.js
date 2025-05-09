import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { username, type } = req.query;
  
  // For analytics tracking (public access)
  if (req.method === 'POST') {
    try {
      const { username, trackingType } = req.body;
      
      if (!username || !trackingType) {
        return res.status(400).json({ error: 'Username and tracking type are required' });
      }
      
      const vcard = await prisma.vCard.findUnique({
        where: { username }
      });
      
      if (!vcard) {
        return res.status(404).json({ error: 'VCard not found' });
      }
      
      // Update the appropriate tracking field
      if (trackingType === 'qr_download') {
        await prisma.vCard.update({
          where: { id: vcard.id },
          data: { qrDownloads: { increment: 1 } }
        });
      } else if (trackingType === 'contact_saved') {
        await prisma.vCard.update({
          where: { id: vcard.id },
          data: { totalContacts: { increment: 1 } }
        });
      } else if (trackingType === 'click') {
        const { linkType } = req.body;
        if (!linkType) {
          return res.status(400).json({ error: 'Link type is required for click tracking' });
        }
        
        const currentClickCount = vcard.clickCount || {};
        const newClickCount = {
          ...currentClickCount,
          [linkType]: (currentClickCount[linkType] || 0) + 1
        };
        
        await prisma.vCard.update({
          where: { id: vcard.id },
          data: { clickCount: newClickCount }
        });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error updating analytics:', error);
      return res.status(500).json({ error: 'Failed to update analytics' });
    }
  }
  
  // For fetching analytics (authenticated users only)
  if (req.method === 'GET') {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: 'You must be signed in to access analytics' });
    }
    
    try {
      const vcard = await prisma.vCard.findFirst({
        where: {
          userId: session.user.id,
          ...(username ? { username } : {})
        }
      });
      
      if (!vcard) {
        return res.status(404).json({ error: 'VCard not found' });
      }
      
      // Return analytics data
      return res.status(200).json({
        viewCount: vcard.viewCount,
        qrDownloads: vcard.qrDownloads,
        totalContacts: vcard.totalContacts,
        clickCount: vcard.clickCount || {}
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
