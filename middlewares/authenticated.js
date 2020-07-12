'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var key = 'contraseña';

exports.ensureAuth = (req, res, next)=>{
    var command = req.body.command;
    var separate = command.split(" ");
    if(separate[0].toUpperCase() == "LOGIN"  || separate[0].toUpperCase() == "REGISTER"){
        next();
    }else{
        if(!req.headers.authorization){
            return res.status(403).send({message: 'Petición sin autenticación'});
        }else{
            var token = req.headers.authorization.replace(/['"]+/g, '');
            try{
                var payload = jwt.decode(token, key);
                if(payload.exp <= moment().unix()){
                    return res.status(401).send({message: 'Token expirado'});
                }
            }catch(ex){
                return res.status(404).send({message: 'Token no valido'})
            }
    
            req.user = payload;
            next();
        }
    }
}