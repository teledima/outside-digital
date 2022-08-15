const { Pool } = require('pg')

class UserTag {
    constructor() {
        this.pool = new Pool()
    }

    async getTags(uid) {
        let client;
    
        try {
            client = await this.pool.connect()
            const tagsSelectRes = await client.query(
                `select t2.id, t2.name, t2.sort_order as "sortOrder" 
                   from users_tags t1 
                  inner join tags t2 on t1.tag_id = t2.id
                  where t1.user_id = $1`,
                [uid]
            )

            return tagsSelectRes.rows
        } catch {
            return null
        } finally {
            client?.release()
        }
    }

    async addUserTags (tags, uid) {
        let client;
    
        try {
            client = await this.pool.connect()
            await client.query(
                `insert into users_tags(user_id, tag_id) 
                 select $1 as user_id, id from unnest($2::int[]) as id`, [uid, tags.map(item => Number(item))]
            )
        } catch { 

        } finally {
            client?.release()
            return this.getTags(uid)
        }
    }
    
    async deleteUserTag (id, uid) {
        let client;
    
        try {
            client = await pool.connect()
            await client.query(
                'delete from users_tags where tag_id = $1 and user_id = $2 ', 
                [id, uid]
            )
        } catch(e) {

        } finally {
            client?.release()
            return this.getTags(uid)
        }
    }
}

module.exports = new UserTag()
