import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://zevora-frontend.vercel.app';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://zevora-eta.vercel.app/api';

  const staticRoutes = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/chat`, lastModified: new Date() },
    { url: `${baseUrl}/dashboard/overview`, lastModified: new Date() },
  ];

  try {
    // Fetch products list from backend service to map product detail routes
    const res = await fetch(`${apiUrl}/products?limit=100`, {
      next: { revalidate: 3600 } // revalidate cache every hour
    });
    const data = await res.json();
    
    if (data.success && Array.isArray(data.data)) {
      const productRoutes = data.data.map((p: { _id: string; updatedAt?: string; createdAt?: string }) => ({
        url: `${baseUrl}/products/${p._id}`,
        lastModified: new Date(p.updatedAt || p.createdAt || new Date()),
      }));
      return [...staticRoutes, ...productRoutes];
    }
  } catch (error) {
    console.error('[Sitemap Generate Warning]: Failed to fetch dynamic product list for sitemap.', error);
  }

  return staticRoutes;
}
