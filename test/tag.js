const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiSorted = require('chai-sorted')
const app = require('../app')
const uuid = require('uuid')
const { Pool } = require('pg')

const expect = chai.expect
const pool = new Pool()

chai.use(chaiHttp)
chai.use(chaiSorted)

describe('Tag routes', () => {
    let token = null

    const baseCheckTag = (tag, keys) => {
        expect(tag).to.be.a('object')
        expect(tag).have.all.keys(...keys)

        if ('id' in keys) {
            expect(tag.id).to.be.a('number')
        }

        if ('name' in keys) {
            expect(tag.name).to.be.a('string')
        }

        if ('sortOrder' in keys) {
            expect(tag.sortOrder).to.be.a('number')
        }

        if ('creator' in keys) {
            expect(tag.creator).to.be.a('object')
            expect(tag.creator).have.all.keys('uid', 'nickname')
            expect(tag.creator.uid).to.be.a('string')
            expect(tag.creator.nickname).to.be.a('string')
            expect(uuid.validate(tag.creator.uid)).to.be.true
            expect(res.body.creator.nickname).to.be.not.empty
        }
    }

    before((beforeDone) => {
        pool.connect((err, client, done) => {
            if (err) {
                done()
                beforeDone()
                return
            }

            client.query('delete from users')
                .then(_ => client.query('alter sequence tags_id_seq restart with 1'))
                .finally(_ => { done(); beforeDone() })
            
        })
    })

    before((done) => {
        chai.request(app)
            .post('/signup')
            .send({ email: 'test@test.ru', password: 'test6VCdsv', nickname: 'test'})
            .end((err, res) => {
                token = res.body.token
                done()
            })
    })

    after((done) => {
        pool.end()
            .finally(_ => { done() })
    })

    describe('POST /tag', () => {
        it('Successful create tag', (done) => {
            chai.request(app)
                .post('/tag')
                .send({ name: 'testTag', sortOrder: 1 })
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('tag', 'error')
                    
                    expect(res.body.error).to.be.null

                    baseCheckTag(res.body.tag, ['id', 'name', 'sortOrder'])
                    expect(res.body.tag.id).to.be.equal(1)
                    expect(res.body.tag.name).to.be.equal('testTag')
                    expect(res.body.tag.sortOrder).to.be.equal(1)
                    done()
                })
        }) 
        
        it('Fail unauthenticated user to create tag', (done) => {
            chai.request(app)
                .post('/tag')
                .send({ name: 'testTag2', sortOrder: 0 })
                .end((err, res) => {
                    expect(res).have.status(401)
                    done()
                })
        })

        it('Fail to add same tag', (done) => {
            chai.request(app)
            .post('/tag')
            .send({ name: 'testTag', sortOrder: 0 })
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                expect(res).have.status(500)
                expect(res.text).to.be.not.empty
                done()
            })
        })
    })

    describe('GET /tag/:id', () => {
        it('Get existing tag', (done) => {
            chai.request(app)
                .get('/tag/1')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)

                    baseCheckTag(res.body, ['creator', 'name', 'sortOrder'])

                    expect(res.body.creator.nickname).to.be.equal('test')
                    expect(res.body.name).to.be.equal('testTag')
                    expect(res.body.sortOrder).to.be.equal(1)
                    done()
                })
        })

        it('Get does not existing tag', (done) => {
            chai.request(app)
                .get('/tag/2')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(404)
                    done()
                }) 
        })
    })

    describe('GET /tag', () => {
        before((beforeDone) => {
            pool.connect((err, client, done) => {
                if (err) {
                    done()
                    beforeDone()
                    return
                }

                client.query('delete from tags')
                    .then(_ => client.query('alter sequence tags_id_seq restart with 1'))
                    .then(_ => client.query('select gen_random_tags($1, $2)', ['test', 20]))
                    .finally(_ => { done(); beforeDone() })
            })
        })

        const checkBody = (res, offset, length, quantity) => {
            expect(res).have.status(200)
                    
            expect(res.body).to.be.a('object')
            expect(res.body).have.all.keys('data', 'meta')
            
            expect(res.body.data).to.be.a('array')
            expect(res.body.data).have.length(length)
            res.body.data.forEach(el => {
                baseCheckTag(el, ['creator', 'name', 'sortOrder'])
            });

            expect(res.body.meta).have.all.keys('offset', 'length', 'quantity')
            expect(res.body.meta.offset).to.be.equal(offset)
            expect(res.body.meta.length).to.be.equal(length)
            expect(res.body.meta.quantity).to.be.equal(quantity)
        }

        it('Without parameters', (done) => {
            chai.request(app)
                .get('/tag')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 0, 10, 20)
                    done() 
                })
        })

        it('Over length', (done) => {
            chai.request(app)
                .get('/tag')
                .query('length=100')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 0, 20, 20)
                    done() 
                })
        })

        it('Over offset', (done) => {
            chai.request(app)
                .get('/tag')
                .query('offset=100')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 100, 0, 20)
                    done() 
                })
        })

        it('Offset and length', (done) => {
            chai.request(app)
                .get('/tag')
                .query('offset=10&length=5')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 10, 5, 20)

                    done() 
                })
        })

        it('Sort by name', (done) => {
            chai.request(app)
                .get('/tag')
                .query('sortByName')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 0, 10, 20)
                    
                    expect(res.body.data).to.be.sortedBy("name", { descending: false })
                    done()
                })    
        })
        
        it('Sort by sortOrder', (done) => {
            chai.request(app)
                .get('/tag')
                .query('sortByOrder')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    checkBody(res, 0, 10, 20)
                    
                    expect(res.body.data).to.be.sortedBy("sortOrder", { descending: false })
                    done()
                })    
        })
    })

    describe('PUT /tag/:id', () => {
        before((beforeDone) => {
            pool.connect((err, client, done) => {
                if (err) {
                    done()
                    beforeDone()
                    return
                }

                client.query('delete from tags where id <> 1')
                    .then(_ => client.query('insert into users(email, nickname, password) values ($1, $2, $3) returning uid', ['second_user@test.ru', 'seconUser', 'secondUser']))
                    .then(res => client.query('insert into tags(id, name, sort_order, creator) values (2, $1, 0, $2)', ['secondUserTag', res.rows[0].uid]))
                    .catch(e => console.log(e))
                    .finally(_ => { done(); beforeDone() })
            }) 
        })

        it('Change own tag', (done) => {
            chai.request(app)
                .put('/tag/1')
                .send({ name: 'myTag' })
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('tag', 'error')

                    baseCheckTag(res.body.tag, keys=['creator', 'name', 'sortOrder'])

                    expect(res.body.tag.name).to.be.equal('myTag')
                    done()
                })
        })
        
        it('Fail change tag other user', (done) => {
            chai.request(app)
                .put('/tag/2')
                .send({ name: 'myTag2' })
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(404)
                    done()
                })
        })

        it('Fail change name that already exist', (done) => {
            chai.request(app)
                .put('/tag/1')
                .send({ name: 'secondUserTag' })
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(400)
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('tag', 'error')

                    baseCheckTag(res.body.tag, keys=['creator', 'name', 'sortOrder'])

                    expect(res.body.tag.name).to.be.equal('myTag')
                    done()
                })
        })
    })

    describe('DELETE /tag/:id', () => {
        it('Existing tag', (done) => {
            chai.request(app)
                .delete('/tag/1')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(204)
                    done()
                })
        })

        it('Does not existing tag', (done) => {
            chai.request(app)
                .delete('/tag/3')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(404)
                    done()
                })
        })
    })
})