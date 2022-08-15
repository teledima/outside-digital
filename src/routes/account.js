const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const { createHash } = require('crypto') 
const { fullUserSchema, emailPassUserSchema } = require('../schemas')
const { getJwtToken, userModel } = require('../utils')

const router = express.Router()

/**
 * @swagger
 * /signup:
 *   post: 
 *     summary: Sign up new user
 *     produces:
 *     - application/json
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered
 *         content:
 *           application/json:
 *             $ref: '#/components/schemas/TokenResult'
 *       400:
 *         description: Incorrect body
 */
 router.post('/signup', async(req, res) => {
    const result = fullUserSchema.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const user = await userModel.addUser(req.body)
        if (user.user) {
            const tokenResult = getJwtToken(user.user.uid)
            res.status(200).json(tokenResult)
        } else {
            res.status(500).send(user.error)
        }
    }
})

router.post('/login', async(req, res) => {
    const result = emailPassUserSchema.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)
    } else {
        const user = await userModel.getUser({email: req.body.email})
        if (user) {
            if (user.password === createHash('SHA256').update(req.body.password).digest('hex')) {
                const tokenResult = getJwtToken(user.uid)
                res.status(200).json(tokenResult)
            } else {
                res.sendStatus(403)
            }
        } else {
            res.sendStatus(500)
        }
    }
})

router.get('/refresh', async(req, res) => {
    if (req.headers['authorization']) {
        const payload = jwt.verify(req.headers['authorization'].split(' ')[1], 'secret', { algorithms: ['HS256'], ignoreExpiration: true })

        const user = await userModel.getUser({uid: payload.uid})

        if (user) {
            res.status(200).json(getJwtToken(payload.uid))
        } else {
            res.sendStatus(403)
        }
    } else {
        res.sendStatus(401)
    }
})

router.post('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.sendStatus(204)
})

module.exports = router
