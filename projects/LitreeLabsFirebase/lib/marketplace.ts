import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export interface Template {
  id?: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  category: 'barber' | 'lash-tech' | 'nail-tech' | 'salon' | 'spa' | 'general';
  platform: 'instagram' | 'tiktok' | 'facebook' | 'all';
  content: string;
  preview: string;
  price: number; // in cents
  commission: number; // 30% = 0.30
  tags: string[];
  salesCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  approved: boolean;
}

export interface TemplatePurchase {
  id?: string;
  buyerId: string;
  templateId: string;
  sellerId: string;
  price: number;
  commission: number;
  sellerEarnings: number;
  purchasedAt: Date;
}

/**
 * Template Marketplace
 * Users can buy/sell templates with 30% commission
 */

/**
 * List a template for sale
 */
export async function listTemplate(template: Omit<Template, 'id' | 'createdAt' | 'salesCount' | 'rating' | 'reviewCount' | 'approved'>): Promise<string> {
  if (!db) throw new Error('Firebase not initialized');

  const templateData = {
    ...template,
    commission: 0.30, // 30% commission
    salesCount: 0,
    rating: 5.0,
    reviewCount: 0,
    approved: false, // Requires approval
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'marketplace_templates'), templateData);
  return docRef.id;
}

/**
 * Get marketplace templates
 */
export async function getMarketplaceTemplates(
  filters?: {
    category?: string;
    platform?: string;
    maxPrice?: number;
    minRating?: number;
  }
): Promise<Template[]> {
  if (!db) return [];
  
  try {
    let q = query(
      collection(db, 'marketplace_templates'),
      where('approved', '==', true),
      orderBy('salesCount', 'desc'),
      limit(50)
    );

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.platform) {
      q = query(q, where('platform', 'in', [filters.platform, 'all']));
    }

    const snapshot = await getDocs(q);
    const templates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    } as Template));

    // Filter by price and rating on client side
    return templates.filter(t => {
      if (filters?.maxPrice && t.price > filters.maxPrice) return false;
      if (filters?.minRating && t.rating < filters.minRating) return false;
      return true;
    });
  } catch (error) {
    console.error('Failed to get templates:', error);
    return [];
  }
}

/**
 * Purchase a template
 */
export async function purchaseTemplate(
  buyerId: string,
  templateId: string
): Promise<{ success: boolean; template?: Template; error?: string }> {
  if (!db) return { success: false, error: 'Firebase not initialized' };
  
  try {
    // Get template
    const templateRef = doc(db, 'marketplace_templates', templateId);
    const templateSnap = await getDocs(query(collection(db, 'marketplace_templates'), where('__name__', '==', templateId)));
    
    if (templateSnap.empty) {
      return { success: false, error: 'Template not found' };
    }

    const template = {
      id: templateSnap.docs[0].id,
      ...templateSnap.docs[0].data(),
      createdAt: templateSnap.docs[0].data().createdAt?.toDate(),
    } as Template;

    // Check if already purchased
    const existingPurchase = await getDocs(
      query(
        collection(db, 'template_purchases'),
        where('buyerId', '==', buyerId),
        where('templateId', '==', templateId)
      )
    );

    if (!existingPurchase.empty) {
      return { success: true, template }; // Already owns it
    }

    // Calculate earnings
    const sellerEarnings = Math.floor(template.price * (1 - template.commission));
    template.price - sellerEarnings;

    // Create purchase record
    const purchase: Omit<TemplatePurchase, 'id'> = {
      buyerId,
      templateId,
      sellerId: template.sellerId,
      price: template.price,
      commission: template.commission,
      sellerEarnings,
      purchasedAt: new Date(),
    };

    await addDoc(collection(db, 'template_purchases'), {
      ...purchase,
      purchasedAt: Timestamp.now(),
    });

    // Update sales count
    await updateDoc(templateRef, {
      salesCount: template.salesCount + 1,
    });

    // TODO: Transfer earnings to seller via Stripe Connect

    return { success: true, template };
  } catch (error) {
    console.error('Purchase error:', error);
    return { success: false, error: 'Failed to complete purchase' };
  }
}

/**
 * Get user's purchased templates
 */
export async function getPurchasedTemplates(userId: string): Promise<Template[]> {
  if (!db) return [];
  
  try {
    const purchasesSnap = await getDocs(
      query(
        collection(db, 'template_purchases'),
        where('buyerId', '==', userId),
        orderBy('purchasedAt', 'desc')
      )
    );

    const templateIds = purchasesSnap.docs.map(doc => doc.data().templateId);
    
    if (templateIds.length === 0) return [];

    // Get all templates (Firestore 'in' query supports up to 10 items)
    const templates: Template[] = [];
    for (const templateId of templateIds.slice(0, 10)) {
      const templateSnap = await getDocs(
        query(collection(db, 'marketplace_templates'), where('__name__', '==', templateId))
      );
      
      if (!templateSnap.empty) {
        templates.push({
          id: templateSnap.docs[0].id,
          ...templateSnap.docs[0].data(),
          createdAt: templateSnap.docs[0].data().createdAt?.toDate(),
        } as Template);
      }
    }

    return templates;
  } catch (error) {
    console.error('Failed to get purchased templates:', error);
    return [];
  }
}

/**
 * Get seller's earnings
 */
export async function getSellerEarnings(sellerId: string): Promise<{
  totalEarnings: number;
  totalSales: number;
  pendingEarnings: number;
}> {
  if (!db) return { totalEarnings: 0, totalSales: 0, pendingEarnings: 0 };
  
  try {
    const salesSnap = await getDocs(
      query(
        collection(db, 'template_purchases'),
        where('sellerId', '==', sellerId)
      )
    );

    const sales = salesSnap.docs.map(doc => doc.data());
    
    return {
      totalEarnings: sales.reduce((sum, s) => sum + s.sellerEarnings, 0),
      totalSales: sales.length,
      pendingEarnings: sales.reduce((sum, s) => sum + s.sellerEarnings, 0), // TODO: Track paid vs pending
    };
  } catch (error) {
    console.error('Failed to get earnings:', error);
    return { totalEarnings: 0, totalSales: 0, pendingEarnings: 0 };
  }
}
