const passportJwt = require('passport-jwt')
const { userModel } = require('../utils')

const JwtStrategy = passportJwt.Strategy,
      ExtractJwt = passportJwt.ExtractJwt

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'secret',
    algorithms: ['HS256']
}

module.exports = new JwtStrategy(opts, async(jwt_payload, done) => {
    const user = await userModel.getUser({uid: jwt_payload.uid, fields:['uid', 'email', 'nickname']})
    
    if (user) {
        return done(null, user)
    } else {
        return done(null, false)
    }
})