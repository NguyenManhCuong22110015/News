import db from '../utils/db.js';

export default {
    async getArticlesByWriterID(userID){

        const list = await db('writer_article').where('writer_id', userID)
        
        const articleIds = list.map(item => item.article_id);

        return db('articles').whereIn('id', articleIds);
    },

    getArticleByID(id) {
        return db('articles').where('id', id).first();
    },


    async searchArticles(keyword) {
        try {
            // Updated query with correct column names
            const results = await db('articles')
                .select(
                    'id',
                    'title',
                    // Replaced 'abstract' with 'summary'
                    'content',
                    'summary', 
                    db.raw(
                        `MATCH (title, content,summary) AGAINST (? IN NATURAL LANGUAGE MODE) AS score`,
                        [keyword]
                    )
                )
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .orderBy('score', 'desc')
                .limit(5);
    
            return results;
        } catch (error) {
            console.error('Error searching articles:', error);
            throw error;
        }
    },
    async getArticle() {
        return db('articles').orderBy('id', 'desc');
    },
    async updateStatus(id, status) {
        return db('articles')
          .where('id', id)
          .update({ status: status, updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      },

      async countByCatId(id) {
        return db('articles').count('id as total').where('category_id', id).first();
      },
      async findPageByCatId(id, limit, offset) {
        return db('articles').where('category_id', id).limit(limit).offset(offset);
      }
    
}