const express = require('express')
const account = require('./account')
const user = require('./user')
const tag = require('./tag')
const userTag = require('./user_tag')

const router = express.Router()
router.use('/', account)
router.use('/user', user)
router.use('/tag', tag)
router.use('/user/tag', userTag)

router.get('/', (req, res) => {
    res.status(200).send('hello world')
})

module.exports = router
