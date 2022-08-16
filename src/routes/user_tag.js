const express = require('express')
const passport = require('passport')
const { userTagModel } = require('../utils')

const router = express.Router()
router.use(passport.authenticate('jwt', { session: false, failureRedirect: '/refresh' }))

router.get('/my', async(req, res) => {
    const tags = await userTagModel.getTags(req.user.uid)
    res.status(200).json({ tags })
})

router.post('/', async(req, res) => {
    if (!req.body.tags) {
        res.sendStatus(400)
    } else {
        const tags = await userTagModel.addUserTags(req.body.tags, req.user.uid)
        res.status(200).json({ tags })
    }
})

router.delete('/:id', async(req, res) => {
    if (!!Number(req.params.id)) {
        const tags = await userTagModel.deleteUserTag(Number(req.params.id), req.user.uid)
        res.status(200).json({ tags })
    } else {
        res.sendStatus(400)
    }
})

module.exports = router
