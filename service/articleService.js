import { subscribe } from 'diagnostics_channel';
import db from '../utils/db.js';

export default {
    async getArticlesByWriterID(userID){

        return db('articles').where('writer_id', userID).orderBy('id', 'desc');;
    },

    getArticleByID(id) {
        return db('articles')
            .join('category', 'articles.category_id', '=', 'category.id')
            .select('articles.*', 'category.name as category_name')
            .where('articles.id', id)
            .first();
    },



    async searchArticles(keyword, limit, offset, isPremiumUser = false) {
        try {
            let query = db('articles')
                .select(
                    'id',
                    'title',
                    'content',
                    'summary', 
                    'is_premium',
                    db.raw(
                        `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE) AS score`,
                        [keyword]
                    )
                )
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .where('status', 'Published');

            if (!isPremiumUser) {
                query = query.where('is_premium', false);
            }

            const results = await query
                .orderBy('score', 'desc')
                .limit(limit)
                .offset(offset);

            return results;
        } catch (error) {
            console.error('Error searching articles:', error);
            throw error;
        }
    },
    async searchAndCountArticles(keyword, isPremiumUser ) {
        try {
            let query = db('articles')
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
                .where('status', 'Published');
    
            if (!isPremiumUser) {
                query = query.where('is_premium', false);
            }
    
            const articles = await query.orderBy('score', 'desc');
    
            const totalQuery = db('articles')
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .where('status', 'Published');
    
            if (!isPremiumUser) {
                totalQuery.where('is_premium', false);
            }
    
            const totalResults = await totalQuery.count('id as total').first();
    
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
        return db('articles').orderBy('id', 'desc').whereIn('status', ['Published', 'Approved']);
    },
    async updateStatus(id, status) {
        return db('articles')
          .where('id', id)
          .update({ status: status, updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') });
      },

      async countByCatId(id, isPremiumUser) {
        let query = db('articles')
            .count('id as total')
            .where('category_id', id)
            .where('status', 'Published');
    
        if (!isPremiumUser) {
            query = query.where('is_premium', false);
        }
    
        return query.first();
    },
    async countByTagId(id, isPremiumUser) {
        let query = db('article_tags')
            .join('articles', 'article_tags.article_id', '=', 'articles.id')
            .where('article_tags.tag_id', id)
            .where('articles.status', 'Published')
            .count('article_tags.id as total');
    
        if (!isPremiumUser) {
            query = query.where('articles.is_premium', false);
        }
    
        return query.first();
    },
    async findPageByCatId(id, limit, offset, isPremiumUser) {
        let query = db('articles')
            .join('category', 'articles.category_id', '=', 'category.id')
            .select('articles.*', 'category.name as category_name')
            .where('articles.category_id', id)
            .where('articles.status', 'Published');
    
        if (!isPremiumUser) {
            query = query
                .where('articles.is_premium', false)
                .orderBy('articles.updated_at', 'desc');
        } else {
            query = query
                .orderByRaw('articles.is_premium DESC, articles.updated_at DESC');
        }
    
        return query
            .limit(limit)
            .offset(offset);
    },
    async findPageByTagId(id, limit, offset, isPremiumUser) {
        let query = db('articles')
            .join('article_tags', 'articles.id', '=', 'article_tags.article_id')
            .join('tag', 'article_tags.tag_id', '=', 'tag.id')
            .select('articles.*', 'tag.name as tag_name')
            .where('article_tags.tag_id', id)
            .where('articles.status', 'Published');
    
            if (!isPremiumUser) {
                query = query
                    .where('articles.is_premium', false)
                    .orderBy('articles.updated_at', 'desc');
            } else {
                query = query
                    .orderByRaw('articles.is_premium DESC, articles.updated_at DESC');
            }
        
            return query
                .limit(limit)
                .offset(offset);
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
    async findTagById(id) {
        return db('tag')
            .where('id', id)
            .first();
    },
    getArticleById(id) {
        return db('articles').where('id', id).first();
    },
    getAuthorById(id) {
        return db('users').where('id', id).first();
    },
    getArticleSameCate(category_id, article_id, isPremiumUser ) {
        let query = db('articles')
            .where('category_id', category_id)
            .whereNot('id', article_id)
            .where('status', 'Published');
    
        if (!isPremiumUser) {
            query = query.where('is_premium', false);
        }
    
        return query
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
    getTagsByArticleId(id) {
        return db('article_tags')
            .join('tag', 'article_tags.tag_id', '=', 'tag.id')
            .where('article_id', id)
            .select('tag.*');
    },
    
}