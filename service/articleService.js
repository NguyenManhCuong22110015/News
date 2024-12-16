import db from '../utils/db.js';

export default {
    async getArticlesByWriterID(userID){

        return db('articles').where('writer_id', userID).orderBy('id', 'desc');;
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
      },
      async findChildCatById(id) {
        return db('category as child')
          .select('child.*', 'parent.name as parent_name')
          .leftJoin('category as parent', 'child.parent_id', 'parent.id')
          .where('child.parent_id', id);
      },
      async findCatById(id) {
        return db('category')
            .where('id', id)
            .first();
    },
    getArticleById(id) {
        return db('articles').where('id', id).first();
    },
    getAuthorById(id) {
        return db('users').where('id', id).first();
    },
    getArticleSameCate(category_id, article_id) {
        return db('articles')
            .where('category_id', category_id)
            .whereNot('id', article_id) 
            .orderByRaw('RAND()') 
            .limit(5);
    },
    getCommentByArticleId(id) {
        return db("comments")
            .join('users', 'comments.user_id', '=', 'users.id')
            .where('article_id', id)
            .select(
                'comments.*',
                'users.name as user_name'
            ).orderBy('comments.created_at', 'desc');;
    },
    addComment(article_id, user_id, content) {
        return db('comments').insert({
            article_id,
            user_id,
            content,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
    },
    async incrementViews(id) {
        return db('articles')
            .where('id', id)
            .increment('views', 1);
    }
    
}