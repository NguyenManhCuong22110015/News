import { subscribe } from 'diagnostics_channel';
import db from '../utils/db.js';
import pdf from 'html-pdf';
import htmlPdfNode from 'html-pdf-node';
import fs from 'fs';
import { request } from 'http';
export default {
    async getArticlesByWriterID(userID) {

        return db('articles').where('writer_id', userID).orderBy('id', 'desc');;
    },

    getArticleByID(id) {
        return db('articles')
            .join('category', 'articles.category_id', '=', 'category.id')
            .select('articles.*', 'category.name as category_name')
            .where('articles.id', id)
            .first();
    },

    async getArticleByPre(pre) {
        return db('articles').where('is_premium', pre);
    },
    async getArticleContentById(id) {
        try {
            const article = await db('articles')
                .join('category', 'articles.category_id', '=', 'category.id')
                .leftJoin('article_tags', 'articles.id', '=', 'article_tags.article_id')
                .leftJoin('tag', 'article_tags.tag_id', '=', 'tag.id')
                .select(
                    'articles.*',
                    'category.name as category_name',
                    db.raw('GROUP_CONCAT(tag.name) as tag_names')
                )
                .where('articles.id', id)
                .groupBy('articles.id')
                .first();

            if (!article) {
                throw new Error('Article not found');
            }

            const htmlTemplate = `
                <h1 style="text-align: center; margin-bottom: 30px;">${article.title}</h1>
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="color: #666; margin-right: 15px;color:red"> ${article.category_name}</span>
                    ${article.tag ? `<span style="color: #666;">Tags: ${article.tag.split(',').join(', ')}</span>` : ''}
                </div>
                <div class="content">
                    ${article.content}
                </div>
            `;

            return htmlTemplate;
        } catch (error) {
            console.error('Error fetching article:', error);
            throw error;
        }
    },
    async generatePdfFromHtml(htmlContent, outputPath) {
        try {
            const file = { content: htmlContent };
            const options = { format: 'A4' };

            await htmlPdfNode.generatePdf(file, options).then((pdfBuffer) => {
                fs.writeFileSync(outputPath, pdfBuffer);
            });

            return outputPath;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },
    async getOrderedArticles() {
        return db('articles').orderBy('is_premium', 'desc'); // Orders by is_premium (1 first, 0 after)
    },
    async getArticlesBasedOnUserSubscription(userID) {
        try {
            // Check if user is premium
            const user = await db('users').where('id', userID).first();
            if (!user) {
                throw new Error('User not found');
            }

            // Determine if the user is premium
            const isPremiumUser = user.subscription_expiry && new Date(user.subscription_expiry) > new Date();

            if (isPremiumUser) {
                // Premium user: return all articles with premium ones on top
                return db('articles').orderBy('is_premium', 'desc');
            } else {
                // Non-premium user: return only non-premium articles
                return db('articles').where('is_premium', 0);
            }
        } catch (error) {
            console.error('Error fetching articles based on user subscription:', error);
            throw error;
        }
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
                        `MATCH (title, content, summary) AGAINST ('${keyword}' IN NATURAL LANGUAGE MODE) AS score`
                    )
                )
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST ('${keyword}' IN NATURAL LANGUAGE MODE)`
                )
                .whereRaw(
                    `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                    [keyword]
                )
                .where('status', 'Published');

            if (!isPremiumUser) {
                query = query.where('is_premium', false).orderBy('score', 'desc');
            }
            else {
                query = query
                    .orderByRaw('articles.is_premium DESC, articles.updated_at DESC');
            }

            const results = await query

                .limit(limit)
                .offset(offset);

            return results;
        } catch (error) {
            console.error('Error searching articles:', error);
            throw error;
        }
    },
    async searchAndCountArticles(keyword, isPremiumUser) {
        try {
            // Full-Text Search Query
            let fullTextQuery = db('articles')
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
                fullTextQuery = fullTextQuery.where('is_premium', false);
            }

            // SQL LIKE Query
            let likeQuery = db('articles')
                .select(
                    'id',
                    'title',
                    'content',
                    'summary',
                    db.raw('0 AS score') // LIKE không có điểm số, mặc định là 0
                )
                .where('status', 'Published')
                .andWhere(function () {
                    this.where('title', 'LIKE', `%${keyword}%`)
                        .orWhere('content', 'LIKE', `%${keyword}%`)
                        .orWhere('summary', 'LIKE', `%${keyword}%`);
                });

            if (!isPremiumUser) {
                likeQuery = likeQuery.where('is_premium', false);
            }

            // Kết hợp Full-Text và LIKE
            const articles = await db
                .union([fullTextQuery, likeQuery], true)
                .orderBy('score', 'desc');

            // Đếm tổng số kết quả
            const totalQuery = db('articles')
                .where('status', 'Published')
                .andWhere(function () {
                    this.whereRaw(
                        `MATCH (title, content, summary) AGAINST (? IN NATURAL LANGUAGE MODE)`,
                        [keyword]
                    ).orWhere('title', 'LIKE', `%${keyword}%`)
                        .orWhere('content', 'LIKE', `%${keyword}%`)
                        .orWhere('summary', 'LIKE', `%${keyword}%`);
                });

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
        return db('articles').orderBy('id', 'desc').whereIn('status', ['Published', 'draft']);
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
        return db('articles')
            .join('category', 'articles.category_id', '=', 'category.id')
            .select('articles.*', 'category.name as category_name')
            .where('articles.id', id)
            .first();
    },
    getAuthorById(id) {
        return db('users').where('id', id).first();
    },
    getArticleSameCate(category_id, article_id, isPremiumUser) {
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
                subscription_expiry: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
                request: false
            });
    },
    cancelSubscription(userId) {
        return db('users')
            .where('id', userId)
            .update({
                subscription_expiry: new Date(Date.now()).toISOString().slice(0, 19).replace('T', ' '),
                request: false
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
    approveArticle(articleId, categoryId, publishDate, tags) {
        const date = new Date(publishDate);
        const offset = date.getTimezoneOffset();
        date.setMinutes(date.getMinutes() - offset);
        return db('articles')
            .where('id', articleId)
            .update({
                category_id: categoryId,
                status: 'Published',
                updated_at: date.toISOString().slice(0, 19).replace('T', ' ')
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
    async checkUserLike(userId, articleId) {
        const result = await db('user_likes')
            .where({
                user_id: userId,
                article_id: articleId
            })
            .first();
        return result;
    },

    async addLike(userId, articleId) {
        // Transaction to ensure both operations succeed or fail together
        return await db.transaction(async (trx) => {
            // Add user like entry
            await trx('user_likes').insert({
                user_id: userId,
                article_id: articleId
            });

            // Increment article like count
            await trx('articles')
                .where('id', articleId)
                .increment('likes', 1);

            // Get updated like count
            const article = await trx('articles')
                .select('likes')
                .where('id', articleId)
                .first();

            return article.likes;
        });
    },

    async removeLike(userId, articleId) {
        // Transaction to ensure both operations succeed or fail together
        return await db.transaction(async (trx) => {
            // Remove user like entry
            await trx('user_likes')
                .where({
                    user_id: userId,
                    article_id: articleId
                })
                .delete();

            // Decrement article like count
            await trx('articles')
                .where('id', articleId)
                .decrement('likes', 1);

            // Get updated like count
            const article = await trx('articles')
                .select('likes')
                .where('id', articleId)
                .first();

            return article.likes;
        });
    },

    async toggleLike(userId, articleId) {
        const existingLike = await this.checkUserLike(userId, articleId);

        if (existingLike) {
            // User already liked - remove the like
            return await this.removeLike(userId, articleId);
        } else {
            // User hasn't liked - add the like
            return await this.addLike(userId, articleId);
        }
    }

}