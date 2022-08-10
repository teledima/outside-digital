const express = require('express')
const passport = require('passport')
const { userModel, userTagModel } = require('../utils')
const { fullUserSchemaOptional } = require('../schemas')

const router = express.Router()
router.use(passport.authenticate('jwt', { session: false, failureRedirect: '/refresh' }))

router.get('/', async(req, res) => {
    const user = {email: req.user.email, nickname: req.user.nickname, tags: await userTagModel.getTags(req.user.uid)}
    res.status(200).json(user)
})

router.put('/', async(req, res) => {
    const result = fullUserSchemaOptional.validate(req.body)
    if (result.error) {
        res.status(400).send(result.error.message)

    } else {
        const user = await userModel.updateUser(req.body, req.user.uid)
        if  (user.error) {
            res.status(400).json(user)
        } else { 
            res.status(200).json(user)
        }
    }
})

router.delete('/', async(req, res) => {
    if (await userModel.deleteUser(req.user.uid)) {
        res.sendStatus(204)
    } else {
        res.sendStatus(500)
    }
})

module.exports = router