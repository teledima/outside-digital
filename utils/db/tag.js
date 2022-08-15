const { Pool } = require('pg')

class Tag {
    constructor() {
        this.pool = new Pool()
    }

    async getTag (id) {
        let client; 

        try {
            client = await this.pool.connect()
            const res = (await client.query(
                `select t1.name, t1.sort_order as "sortOrder", t2.uid, t2.nickname
                   from tags t1
                  inner join users t2 on t1.creator = t2.uid 
                  where t1.id = $1`,
                [id]
            )).rows[0]
            
            return {
                creator: {
                    uid: res.uid,
                    nickname: res.nickname
                },
                name: res.name,
                sortOrder: res.sortOrder
            }
        } catch { 
            return null
        } finally {
            client?.release()
        }
    }

    async getAllTags({sortByOrder=false, sortByName=false, offset=0, length=10}) {
        offset = Number(offset)
        length = Number(length)
    
        let client,
            tags = [],
            sortClause = [],
            quantity = 0;

        if (sortByOrder) {
            sortClause.push('t1.sort_order')
        }
        if (sortByName) {
            sortClause.push('t1.name')
        }
    
        try {
            client = await this.pool.connect()
            const res = await client.query(
                `select t1.name, t1.sort_order as "sortOrder", t2.uid, t2.nickname
                   from tags t1
                  inner join users t2 on t1.creator = t2.uid
                  ${sortClause.length > 0 ? 'order by' : ''} ${sortClause.join(',')}
                 offset ${offset}
                  limit ${length}
                `
            )
            
            const countRes = await client.query('select count(1) as cnt from tags')
    
            quantity = Number(countRes.rows[0].cnt)
            tags = res.rows.map(item => (
                {
                    creator: {
                        uid: item.uid,
                        nickname: item.nickname
                    },
                    name: item.name,
                    sortOrder: item.sortOrder
                }
            ))

            length = res.rowCount
        } catch { 

        } finally {
            client?.release()
        }

        return {
            data: tags,
            meta: { offset: offset, length, quantity }
        }
    }

    async addTag(tagBody, creatorUid) {
        let client;
    
        try {
            client = await this.pool.connect()
            const res = await client.query(
                'insert into tags(name, sort_order, creator) values ($1, $2, $3) returning id, name, sort_order as "sortOrder"', 
                [tagBody.name, tagBody.sortOrder, creatorUid]
            )
            return { tag: res.rows[0], error: null }
        } catch(e) {
            return { tag: null, error: e.code }
        } finally {
            client?.release()
        }
    }
    
    async updateTag (id, name, sortOrder, uid) {
        let client, tag, setClause = [];
    
        if (name) {
            setClause.push([` name = \$${setClause.length + 1} `, name])
        }
        if (sortOrder) {
            setClause.push([` sort_order = \$${setClause.length + 1}`, sortOrder])
        }
    
        if (setClause.length > 0) {
            try {
                client = await this.pool.connect()
                const res = await client.query(
                    `update tags t1 
                        set ${setClause.map(item => item[0]).join(',')} 
                       from users t2
                      where t1.id = \$${setClause.length + 1} and t1.creator = \$${setClause.length + 2} and t1.creator = t2.uid
                     returning t1.name, t1.sort_order as "sortOrder", t2.uid, t2.nickname`,
                    [...setClause.map(item => item[1]), id, uid]
                )

                if (res.rowCount > 0) {
                    const row = res.rows[0]
                    tag = {
                        tag: {
                            name: row.name,
                            sortOrder: row.sortOrder,
                            creator: {
                                uid: row.uid,
                                nickname: row.nickname
                            }
                        },
                        error: null
                    }
                }
            } catch(e) {
                tag = { 
                    tag: await this.getTag(id),
                    error: e.code
                }
            } finally {
                client?.release()
            }
        }
    
        return tag
    }
    
    async deleteTag (id, uid) {
        let client;
    
        try {
            client = await this.pool.connect()
            const deletRes = await client.query('delete from tags where id = $1 and creator = $2', [id, uid])
            return {
                count: deletRes.rowCount,
                error: null
            }
        } catch(e) {
            return {
                count: 0,
                error: e.code
            }
        } finally {
            client?.release()
        }
    }
}

module.exports = new Tag()
