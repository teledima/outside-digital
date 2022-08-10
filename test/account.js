const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const { Pool } = require('pg')


const expect = chai.expect
const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
})


chai.use(chaiHttp)

describe('Account routes', () => {
    before((done) => {
        pool.connect()
            .then(client => client.query('delete from users'))
            .then(pool.end())
            .then(done())
    })

    describe('POST /signup', () => {
        it('Successful creating account and returning new jwt token', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: 'test@test.ru', password: 'testD32cvx', nickname: 'test' })
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('token', 'expire')
                    done()
                })
        })

        it('Fail to create same user', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: 'test@test.ru', password: 'testD32cvx', nickname: 'test' })
                .end((err, res) => {
                    expect(res).have.status(500)
                    expect(res.text).to.be.not.empty
                    done()
                })
        })

        it('Fail body validation (email)', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: 'test@test', password: 'testD32cvx', nickname: 'test' })
                .end((err, res) => {
                    expect(res).have.status(400)
                    expect(res.text).to.be.not.empty
                    done()
                })
        })

        it('Fail body validation (password)', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: 'test@test.ru', password: 'testDcvx', nickname: 'test' })
                .end((err, res) => {
                    expect(res).have.status(400)
                    expect(res.text).to.be.not.empty
                    done()
                })
        })

        it('Fail body validation (incorrect nickname)', (done) => {
            chai.request(app)
                .post('/signup')
                .send({ email: 'test@test.ru', password: 'testD32cvx', nickname: 'test$' })
                .end((err, res) => {
                    expect(res).have.status(400)
                    expect(res.text).to.be.not.empty
                    done()
                })
        })
    })

    describe('POST /login', () => {
        it('Successful login', (done) => {
            chai.request(app)
                .post('/login')
                .send({ email: 'test@test.ru', password: 'testD32cvx' })
                .end((err, res) => {
                    expect(res).have.status(200)
                    expect(res.body).to.be.a('object')
                    expect(res.body).have.all.keys('token', 'expire')
                    done()
                })
        })

        it('Incorrect password', (done) => {
            chai.request(app)
                .post('/login')
                .send({ email: 'test@test.ru', password: 'testD32cvsvx' })
                .end((err, res) => {
                    expect(res).have.status(403)
                    expect(res.text).to.be.not.empty
                    done()
                })
        })
    })

    describe('POST /logout', () => {
        it('Successfull logout', (done) => {
            chai.request(app)
                .post('/login')
                .send({ email: 'test@test.ru', password: 'testD32cvx' })
                .end((err, res) => {
                    const token = res.body.token
                    chai.request(app)
                        .post('/logout')
                        .set('authorization', `Bearer ${token}`)
                        .end((err, res) => {
                            expect(res).have.status(204)
                            done()
                        })
                })
        })
    })
})