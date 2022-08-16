const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { Pool } = require('pg')

const expect = chai.expect
const pool = new Pool()

chai.use(chaiHttp)

describe('User tags routes', () => {
    const checkTags = (body, count) => {
        expect(body).to.be.a('object')
        expect(body).have.all.keys('tags')

        expect(body.tags).to.be.a('array')
        expect(body.tags).have.length(count)
    }
    
    let token = null

    before((beforeDone) => {
        pool.connect((err, client, done) => {
            client.query('delete from users') 
                .then(_ => client.query('alter sequence tags_id_seq restart with 1'))
                .finally(_ => { done(); beforeDone() })
        }) 
    })

    before((done) => {
        chai.request(app)
            .post('/signup')
            .send({ email: 'test1@test.ru', nickname: 'test1', password: 'FFvf4cDvS' })
            .end((err, res) => {
                token = res.body.token
                done()
            })
    })

    before((done) => {
        chai.request(app)
            .post('/signup')
            .send({ email: 'test2@test.ru', nickname: 'test2', password: 'FFvf4cDvS' })
            .end((err, res) => {
                token = res.body.token
                done()
            })
    })

    before((beforeDone) => {
        pool.connect((err, client, done) => {
            client.query('select gen_random_tags($1, $2)', ['test1', 10])
                .then(_ => client.query('select gen_random_tags($1, $2)', ['test2', 10]))
                .finally(_ => { done(); beforeDone() })
        })
    })

    after((done) => {
        pool.end()
            .finally(_ => { done() })
    })

    describe('POST /', () => {
        it('Pass none in body', (done) => {
            chai.request(app)
                .post('/user/tag/')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(400)
                    done()
                })
        })

        it('Pass empty list', (done) => {
            chai.request(app)
                .post('/user/tag/')
                .send({ tags: [] })
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 0)
                    done()
                })
        })

        it('Pass existing tags', (done) => {
            chai.request(app)
                .post('/user/tag/')
                .send({ tags: [10, 11, 12] })
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 3)
                    done()
                })
        })

        it('Pass not-existing tags', (done) => {
            chai.request(app)
                .post('/user/tag/')
                .send({ tags: [13, 40, 100] })
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 3)
                    done()
                })
        })

        it('Pass duplicate tags', (done) => {
            chai.request(app)
                .post('/user/tag/')
                .send({ tags: [10, 11, 12] })
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body, 3)
                    done()
                })
        })
    })

    describe('GET /my', () => {
        it('Get non-empty list', (done) => {
            chai.request(app)
                .get('/user/tag/my')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 3)
                    done()
                })
        })
    })

    describe('DELTE /:id', () => {
        it('Pass non-number id', (done) => {
            chai.request(app)
                .delete('/user/tag/1cvsdvs')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(400)
                    done()
                })
        })

        it('Pass do not binded tag', (done) => {
            chai.request(app)
                .delete('/user/tag/1')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 3)
                    done()
                })
        })

        it('Pass do not existing tag', (done) => {
            chai.request(app)
                .delete('/user/tag/100')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 3)
                    done()
                })
        })

        it('Pass binded tag', (done) => {
            chai.request(app)
                .delete('/user/tag/10')
                .set('authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    checkTags(res.body, 2)
                    done()
                })
        })
    })


})