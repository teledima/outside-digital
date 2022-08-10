const { Pool } = require('pg')

class UserTag {
    constructor() {
        this.pool = new Pool({
            host: 'localhost',
            user: 'postgres',
            password: 'postgres',
            database: 'postgres'
        })
    }

    async getTags(uid) {
        const client = await this.pool.connect()
    
        let tags = null
    
        try {
            const tagsSelectRes = await client.query(
                `select t2.id, t2.name, t2.sort_order as "sortOrder" 
                   from users_tags t1 
                  inner join tags t2 on t1.tag_id = t2.id
                  where t1.user_id = $1`,
                [uid]
            )
            tags = tagsSelectRes.rows
            
        } catch {
            tags = null
        }
        
        client.release()
        return tags;
    }

    async addUserTags (tags, uid) {
        const client = await this.pool.connect()
    
        let allTags = null
    
        try {
            await client.query(
                `insert into users_tags(user_id, tag_id) 
                 select $1 as user_id, id from unnest($2::int[]) as id`, [uid, tags.map(item => Number(item))]
            )
            allTags = await getTags(uid)
        } catch(e) {
            allTags = await getTags(uid)
        }

        return allTags
    }
    
    async deleteUserTag (id, uid) {
        const client = await pool.connect()
    
        let allTags = null
    
        try {
            await client.query(
                'delete from users_tags where tag_id = $1 and user_id = $2 ', 
                [id, uid]
            )
            allTags = await getTags(uid)
        } catch(e) {
            allTags = await getTags(uid)
        }
    
        return allTags
    }
}

module.exports = new UserTag()
