const jwt = require('jsonwebtoken')

module.exports = function(uid) {
    const token = jwt.sign({ uid: uid }, 'secret', { algorithm: 'HS256', expiresIn: '30m' })
    return { token, expire: '1800' }
}
