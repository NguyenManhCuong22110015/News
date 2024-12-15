import db from '../utils/db.js';


export default {

    async getCategories() {
      return await db('category').where('parent_id', 0).limit(7);  
    },



    async getApprovedArticlesEachWeek(limit = 5) {
        try {
             const now = new Date();
        const lastWeek = new Date();
        lastWeek.setDate(now.getDate() - 7);

        // Truy vấn bài viết
        const featuredArticles = await db('articles')
            .join('category', 'articles.category_id', '=', 'category.id') 
            .where('articles.status', 'Approved')
            .andWhere('articles.updated_at', '>=', lastWeek)
            .andWhere('articles.updated_at', '<=', now)
            .select('articles.*', 'category.name as category_name') 
            .orderBy('articles.views', 'desc') 
            .limit(limit); 

        return featuredArticles;
        } catch (error) {
            console.error('Error fetching approved articles:', error);
            throw error;
        }
    },
    async getMostViewedArticles(limit = 10) {
        try {
            // Truy vấn bài viết với thông tin category_name
            const mostViewedArticles = await db('articles')
                .join('category', 'articles.category_id', '=', 'category.id') 
                .where('articles.status', 'Approved')
                .select('articles.*', 'category.name as category_name') 
                .orderBy('articles.views', 'desc')
                .limit(limit);
    
            return mostViewedArticles;
        } catch (error) {
            console.error('Error fetching most viewed articles:', error);
            throw error;
        }
    },
    async getLatestArticles(limit = 10) {
        try {
            // Truy vấn bài viết mới nhất với thông tin category_name
            const latestArticles = await db('articles')
                .join('category', 'articles.category_id', '=', 'category.id') // Join với bảng category
                .where('articles.status', 'Approved')
                .select('articles.*', 'category.name as category_name') // Lấy tất cả thông tin bài viết và tên chuyên mục
                .orderBy('articles.updated_at', 'desc')
                .limit(limit);
    
            return latestArticles;
        } catch (error) {
            console.error('Error fetching latest articles:', error);
            throw error;
        }
    },
    async getTopCategoriesByViews(limit = 10) {
        try {
           
            const categories = await db('category')
                .select('id', 'name') 
                .limit(limit); 
    

            const topCategoriesWithArticles = [];
    
            for (const category of categories) {
                const totalViews = await db('articles')
                    .where('category_id', category.id)
                    .andWhere('status', 'Approved')
                    .sum('views as total_views') 
                    .first();
    
                
                const latestArticle = await db('articles')
                    .where('category_id', category.id)
                    .andWhere('status', 'Approved')
                    .orderBy('updated_at', 'desc') 
                    .first(); 
    
                if (latestArticle && totalViews) {
                    topCategoriesWithArticles.push({
                        category: category.name,
                        total_views: totalViews.total_views,
                        article: latestArticle,
                    });
                }
            }
    
            topCategoriesWithArticles.sort((a, b) => b.total_views - a.total_views);
    
            return topCategoriesWithArticles.slice(0, limit); 
        } catch (error) {
            console.error('Error fetching top categories by views:', error);
            throw error;
        }
    }
}