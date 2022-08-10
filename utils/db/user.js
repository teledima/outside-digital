const { Pool } = require('pg')
const { createHash } = require('crypto')

class User {
    constructor() {
        this.pool = new Pool({
            host: 'localhost',
            user: 'postgres',
            password: 'postgres',
            database: 'postgres'
        })
    }

    async getUser({uid, email, fields=['*']}) {
        const client = await this.pool.connect()

        let user = null;
    
        try {
            const whereClause = uid != null? [' uid = $1 ', uid] : [' email = $1 ', email] 
            const userSelectRes = await client.query(`select ${fields.join(',')} from users where ${whereClause[0]}`, [whereClause[1]])
            user = userSelectRes !== null? userSelectRes.rows[0] : userSelectRes
        } catch(e) {
            user = null
        }
        
        client.release()
        return user
    }

    async addUser(userBody) {
        const client = await this.pool.connect()
        
        let user = null
    
        try {
            const insertRes = await client.query(
                'insert into users(email, password, nickname) values ($1, $2, $3) returning uid, email, nickname', 
                [userBody.email, createHash('SHA256').update(userBody.password).digest('hex'), userBody.nickname]
            )
            user = { user: insertRes.rows[0], error: null }
        } catch(e) {
            user = { user: null, error: e.code }
        }
        
        client.release()
        return user
    }

    async updateUser(updateBody, uid) {
        const client = await this.pool.connect()
    
        let setClause = [];
    
        if (updateBody.email) {
            setClause.push([` email = \$${setClause.length + 1} `, updateBody.email])
        }
        if (updateBody.nickname) {
            setClause.push([` nickname = \$${setClause.length + 1} `, updateBody.nickname])
        }
        if (updateBody.password) {
            setClause.push([` password = \$${setClause.length + 1} `, createHash('SHA256').update(userBody.password).digest('hex')])
        }
        let updatedUser = null
    
        if (setClause.length > 0) {
            try {
                const res = await client.query(
                    `update users set ${setClause.map(item => item[0]).join(',')} where uid = \$${setClause.length + 1} returning email, nickname`, 
                    [...setClause.map(item => item[1]), uid]
                )
                
                updatedUser = {
                    error: null,
                    user: res.rows[0]
                }
            } catch(e) {
                updatedUser = {
                    error: e.code,
                    user: await this.getUser({uid: uid, fields: ['email', 'nickname']})
                }
            }
        } else {
            updatedUser = {
                error: null,
                user: await this.getUser({uid: uid, fields: ['email', 'nickname']})
            }
        }
        
    
        client.release()
        return updatedUser
    }

    async deleteUser(uid) {
        const client = await this.pool.connect()

        let deleted = false;
        try {
            await client.query('delete from users where uid = $1', [uid])
            deleted = true
        } catch { }
    
        client.release()
        return deleted
    }
}

module.exports = new User()

