const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { Pool } = require('pg')


const expect = chai.expect
const pool = new Pool()


chai.use(chaiHttp)

describe('User routes', () => {
    let token = null

    before((done) => {
        pool.connect()
            .then(client => client.query('delete from users'))
            .then(pool.end())
            .then(_ => { done() })
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

    before((done) => {
        chai.request(app)
        .post('/signup')
        .send({ email: 'test2@test.ru', password: 'tesDx8dsv', nickname: 'test2'})
        .end((err, res) => { done() })
    })

    describe('GET /user', () => {
        it('Successfull getting user', (done) => {
            chai.request(app)
                .get('/user/')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body).have.all.keys('email', 'nickname', 'tags')
                    expect(res.body.tags).have.length(0)
                    done()
                })
        })
    })

    describe('PUT /user', () => {
        it('Successfull update user (email)', (done) => {
            chai.request(app)
                .put('/user/')
                .send({email: 'test_new@test.ru'})
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)

                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('error', 'user')
                    
                    expect(res.body.error).to.be.null
                    expect(res.body.user).have.all.keys('email', 'nickname')
                    expect(res.body.user.email).to.be.equal('test_new@test.ru')
                    expect(res.body.user.nickname).to.be.equal('test')
                    done()
                })
        })

        it('Successfull update user (nickname)', (done) => {
            chai.request(app)
                .put('/user/')
                .send({nickname: 'testNew'})
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('error', 'user')
                    
                    expect(res.body.error).to.be.null
                    expect(res.body.user).have.all.keys('email', 'nickname')
                    expect(res.body.user.email).to.be.equal('test_new@test.ru')
                    expect(res.body.user.nickname).to.be.equal('testNew')
                    done()
                })
        })

        it('Successfull update user (email, nickname)', (done) => {
            chai.request(app)
                .put('/user/')
                .send({email: 'test@test.ru', nickname: 'test'})
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)
                    
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('error', 'user')
                    
                    expect(res.body.error).to.be.null
                    expect(res.body.user).have.all.keys('email', 'nickname')
                    expect(res.body.user.email).to.be.equal('test@test.ru')
                    expect(res.body.user.nickname).to.be.equal('test')
                    done()
                })
        })

        it('Return unchanged info on empty request', (done) => {
            chai.request(app)
                .put('/user/')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(200)

                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('error', 'user')
                    
                    expect(res.body.error).to.be.null
                    expect(res.body.user).have.all.keys('email', 'nickname')
                    expect(res.body.user.email).to.be.equal('test@test.ru')
                    expect(res.body.user.nickname).to.be.equal('test')
                    done()
                })
        })

        it('Fail update user (email exist)', (done) => {
            chai.request(app)
                .put('/user/')
                .send({email: 'test2@test.ru'})
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(401)
                    
                    expect(res.body).be.a('object')
                    expect(res.body).have.all.keys('error', 'user')
                    
                    expect(res.body.error).to.be.not.null
                    expect(res.body.error).to.be.equal('23505')
                    expect(res.body.user).have.all.keys('email', 'nickname')
                    expect(res.body.user.email).to.be.equal('test@test.ru')
                    expect(res.body.user.nickname).to.be.equal('test')
                    done()
                })
        })
    })

    describe('DELETE /user', () => {
        it('Successful delete user', (done) => {
            chai.request(app)
                .delete('/user')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(204)
                    done()
                })
        })

        it('Fail to retry delete user', (done) => {
            chai.request(app)
                .delete('/user')
                .set('Authorization', `Bearer ${token}`)
                .end((err, res) => {
                    expect(res).have.status(403)
                    done()
                })
        })
    })
})