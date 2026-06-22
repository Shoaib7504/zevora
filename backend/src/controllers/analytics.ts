import { Request, Response } from 'express';
import { Product, User, Review } from '../models';

/**
 * GET /analytics
 * Retrieves aggregated charts data for products by category, rating distributions, and signup history
 */
export async function getAnalyticsSummary(req: Request, res: Response): Promise<void> {
  try {
    // 1. Products per category (Pie Chart: [{ name, value }])
    const productsPerCategory = await Product.aggregate([
      { $group: { _id: '$category', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
      { $sort: { name: 1 } }
    ]);

    // 2. Ratings distribution (Bar Chart: [{ rating, count }])
    const ratingsDistributionRaw = await Review.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } }
    ]);
    const ratingsDistribution = [1, 2, 3, 4, 5].map(ratingVal => {
      const found = ratingsDistributionRaw.find(r => r._id === ratingVal);
      return {
        rating: `${ratingVal} Star`,
        count: found ? found.count : 0
      };
    });

    // 3. User Signups timeline (Line Chart: [{ date, signups }])
    const signupTimeline = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          signups: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', signups: 1, _id: 0 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        productsPerCategory,
        ratingsDistribution,
        signupTimeline
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}
