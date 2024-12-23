import db from '../utils/db.js';


export default {

    async getCategories() {
      return await db('category').where('parent_id', 0).limit(7);  
    },



    async getApprovedArticlesEachWeek(limit = 7, isPremiumUser ) {
        try {
            const now = new Date();
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 7);
    
            let query = db('articles')
                .join('category', 'articles.category_id', '=', 'category.id')
                .where('articles.status', 'Published')
                .andWhere('articles.updated_at', '>=', lastWeek)
                .andWhere('articles.updated_at', '<=', now)
                .select('articles.*', 'category.name as category_name');
    
            if (!isPremiumUser) {
                query = query.where('articles.is_premium', false);
            } else {
                query = query.orderBy('articles.is_premium', 'desc');
            }
    
            const featuredArticles = await query
                .orderBy('articles.views', 'desc')
                .limit(limit);
    
            return featuredArticles;
        } catch (error) {
            console.error('Error fetching approved articles:', error);
            throw error;
        }
    },
    async getMostViewedArticles(limit = 10, isPremiumUser ) {
        const now = new Date();
        try {
            let query = db('articles')
                .join('category', 'articles.category_id', '=', 'category.id')
                .where('articles.status', 'Published')
                .andWhere('articles.updated_at', '<=', now)
                .select('articles.*', 'category.name as category_name');
    
            if (!isPremiumUser) {
                // Non-premium users only see non-premium articles
                query = query.where('articles.is_premium', false);
            } else {
                // Premium users see premium articles first
                query = query.orderBy('articles.is_premium', 'desc');
            }
    
            const mostViewedArticles = await query
                .orderBy('articles.views', 'desc')
                .limit(limit);
    
            return mostViewedArticles;
        } catch (error) {
            console.error('Error fetching most viewed articles:', error);
            throw error;
        }
    },
    async getLatestArticles(limit = 10, isPremiumUser ) {
        const now = new Date();
        try {
            let query = db('articles')
                .join('category', 'articles.category_id', '=', 'category.id')
                .where('articles.status', 'Published')
                .andWhere('articles.updated_at', '<=', now)
                .select('articles.*', 'category.name as category_name');
    
            if (!isPremiumUser) {
                query = query.where('articles.is_premium', false);
            } else {
                query = query.orderBy('articles.is_premium', 'desc');
            }
            const latestArticles = await query
                .orderBy('articles.updated_at', 'desc')
                .limit(limit);
    
            return latestArticles;
        } catch (error) {
            console.error('Error fetching latest articles:', error);
            throw error;
        }
    },
    async getTopCategoriesByViews(limit = 10, isPremiumUser ) {
        const now = new Date();
        try {
            const categories = await db('category')
                .select('id', 'name')
                .limit(limit);
    
            if (!categories || categories.length === 0) {
                return [];
            }
    
            const topCategoriesWithArticles = [];
    
            for (const category of categories) {
                try {
                    let articlesQuery = db('articles')
                        .where('category_id', category.id)
                        .andWhere('updated_at', '<=', now)
                        .andWhere('status', 'Published');
                        
    
                    if (!isPremiumUser) {
                        articlesQuery = articlesQuery.where('is_premium', false);
                    }
    
                    const [totalViews, latestArticle] = await Promise.all([
                        articlesQuery.clone().sum('views as total_views').first(),
                        articlesQuery.clone().orderBy('updated_at', 'desc').first()
                    ]);
    
                    if (latestArticle && totalViews && totalViews.total_views) {
                        topCategoriesWithArticles.push({
                            category: category.name,
                            total_views: parseInt(totalViews.total_views) || 0,
                            article: latestArticle
                        });
                    }
                } catch (categoryError) {
                    console.error(`Error processing category ${category.id}:`, categoryError);
                    continue;
                }
            }
    
            return topCategoriesWithArticles
                .sort((a, b) => b.total_views - a.total_views)
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching top categories by views:', error);
            throw error;
        }
    }
}