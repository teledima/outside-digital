const { Pool } = require('pg')
const { createHash } = require('crypto');
const { finished } = require('stream');

class User {
    constructor() {
        this.pool = new Pool()
    }

    async getUser({uid, email, fields=['*']}) {
        let client;
    
        try {
            client = await this.pool.connect()
            const whereClause = uid != null? [' uid = $1 ', uid] : [' email = $1 ', email] 
            const userSelectRes = await client.query(`select ${fields.join(',')} from users where ${whereClause[0]}`, [whereClause[1]])
            return userSelectRes !== null? userSelectRes.rows[0] : userSelectRes
        } catch(e) {
            return null
        } finally {
            client?.release()
        }
    }

    async addUser(userBody) {
        let client;
    
        try {
            const client = await this.pool.connect()
            const insertRes = await client.query(
                'insert into users(email, password, nickname) values ($1, $2, $3) returning uid, email, nickname', 
                [userBody.email, createHash('SHA256').update(userBody.password).digest('hex'), userBody.nickname]
            )
            return { user: insertRes.rows[0], error: null }
        } catch(e) {
            return { user: null, error: e.code }
        } finally {
            client?.release()
        }
    }

    async updateUser(updateBody, uid) {
        let client, setClause = [];
    
        if (updateBody.email) {
            setClause.push([` email = \$${setClause.length + 1} `, updateBody.email])
        }
        if (updateBody.nickname) {
            setClause.push([` nickname = \$${setClause.length + 1} `, updateBody.nickname])
        }
        if (updateBody.password) {
            setClause.push([` password = \$${setClause.length + 1} `, createHash('SHA256').update(userBody.password).digest('hex')])
        }
    
        if (setClause.length > 0) {
            try {
                client = await this.pool.connect()
                const res = await client.query(
                    `update users set ${setClause.map(item => item[0]).join(',')} where uid = \$${setClause.length + 1} returning email, nickname`, 
                    [...setClause.map(item => item[1]), uid]
                )
                
                return {
                    error: null,
                    user: res.rows[0]
                }
            } catch(e) {
                return {
                    error: e.code,
                    user: await this.getUser({uid: uid, fields: ['email', 'nickname']})
                }
            } finally {
                client?.release()
            }
        } else {
            return {
                error: null,
                user: await this.getUser({uid: uid, fields: ['email', 'nickname']})
            }
        }
    }

    async deleteUser(uid) {
        let client;

        try {
            client = await this.pool.connect()
            return (await client.query('delete from users where uid = $1', [uid])).rowCount > 0 
        } catch { 
            return false
        } finally {
            client?.release()
        }
    }
}

module.exports = new User()

