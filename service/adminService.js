import db from '../utils/db.js';


export default {
    async addTag(tagData) {
        const { name } = tagData;
        const addDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return db('tag').insert({
              name,
              created_at: addDate,
              updated_at: addDate,
              status: 1,
            })
            .then(() => {
                return db("tag").select("id").orderBy("id", "desc").limit(1);
            })
        },
    async addUser(user) {
              return db('users').insert(user). then(() => {return db("users").select("UserID").orderBy("UserID", "desc").limit(1);});
            },
    async getUserById(userId) {
        try {
            const user = await db('users').where('UserID', userId).first(); // Adjust table name if necessary
            return user; // Returns a single user object
        } catch (error) {
            console.error('Database error:', error);
            throw error;
        }
    },
    async getAllUsers() {
        return db('users').orderBy('id', 'desc'); 
    },
    async getTags() {
        return db('tag')
    },
    async findTagById(id){
        return db("tag").where("id", id).first();
    },
    async delTag(id){
        return db("tag").where("id", id).del();
    }, 
    async patchTag(id,tag){
        return db("tag").where("id", id).update(tag);
    },
    async delUser(id){
        return db("users").where("UserID", id).del();
    }, 
    async patchUser(id,category){
        return db("users").where("UserID", id).update(category);
    }
}