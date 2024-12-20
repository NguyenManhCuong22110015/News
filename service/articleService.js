import { subscribe } from 'diagnostics_channel';
import db from '../utils/db.js';

export default {
    async getArticlesByWriterID(userID){

        return db('articles').where('writer_id', userID).orderBy('id', 'desc');;
    },

    getArticleByID(id) {
        return db('articles').where('id', id).first();
    },


    async searchArticles(keyword, limit, offset) {
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
                .limit(limit)
                .offset(offset);;
    
            return results;
        } catch (error) {
            console.error('Error searching articles:', error);
            throw error;
        }
    },
    async searchAndCountArticles(keyword) {
        try {
            // Lấy danh sách bài viết
            const articles = await db('articles')
                .select(
                    'id',
                    'title',
                    'content',
                    'summary',
                    db.raw(
                        `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE) AS score`,
                        [keyword]
                    )
                )
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .orderBy('score', 'desc');
    
            // Đếm tổng số bài viết
            const totalResults = await db('articles')
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .count('id as total')
                .first();
    
            return {
                articles,
                total: totalResults.total,
            };
        } catch (error) {
            console.error('Error searching and counting articles:', error);
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
    },
    countByCatId(id) {
        return db('articles').count('id as total').where('category_id', id).first();
    },
    updateSubscription(userId, days) {
        return db('users')
            .where('id', userId)
            .update({
                subscription_expiry: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
            });
    },
    cancelSubscription(userId) {
        return db('users')
            .where('id', userId)
            .update({
                subscription_expiry: new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' ')
            });
    },
    async updatePremium(id) {
        // Get current value
        const article = await db('articles')
            .where('id', id)
            .first('is_premium');
        
        // Toggle value
        return db('articles')
            .where('id', id)
            .update({ 
                is_premium: article.is_premium ? 0 : 1 
            });
    },
    approveArticle(articleId,categoryId,publishDate,tags){
        return db('articles')
            .where('id', articleId)
            .update({
                category_id: categoryId,
                status: 'Approved',
                updated_at: new Date(publishDate).toISOString().slice(0, 19).replace('T', ' ')
            })
            .then(() => {
                return db('article_tags')
                    .where('article_id', articleId)
                    .del()
                    .then(() => {
                        return db('article_tags')
                            .insert(tags.map(tagId => ({ article_id: articleId, tag_id: tagId })));
                    });
            });
    },
    rejectArticle(articleId, text, writer_id) {
        return db.transaction(async trx => {
            await trx('messages')
                .insert({
                    article_id: articleId,
                    editor_id: writer_id,
                    message: text,
                    create_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                });
    
            await trx('articles')
                .where('id', articleId)
                .update({
                    status: 'Rejected'
                });
    
            return { success: true };
        });
    },
    deleteArticle(id) {
        return db('articles').where('id', id).del();
    },
    getRejectedMessage(id) {
        return db('messages')
            .join('users', 'messages.editor_id', '=', 'users.id')
            .where('article_id', id)
            .orderBy('messages.id', 'desc')
            .first({
                message: 'messages.message',
                editor_id: 'messages.editor_id',
                editor_name: 'users.name',
                created_at: 'messages.create_at'
            });
    },
    
}