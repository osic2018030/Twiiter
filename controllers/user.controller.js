"use strict";
var bcrypt = require("bcrypt-nodejs");
var User = require("../models/user.model");
var Tweet = require("../models/tweet.model");
var jwt = require("../services/jwt");

function commands(req,res){
    var command = req.body.command;
    var separate = command.split(" ");
    var co = separate[0].toUpperCase();
    var content = "";
    for(let i = 1; i< separate.length; i++){
        content = content + " " + separate[i];
    }
    var content2 = "";
            for(let i = 2; i< separate.length; i++){
                content2= content2 + " " + separate[i];
            }
    
    switch(co){
        case "REGISTER":
            if(separate[1] != null && separate[2] != null &&
                separate[3] != null && separate[4] != null && 
                separate[5] != null ){
                    User.findOne({$or:[{username: separate[3]}, {email:separate[4]}]}, (err, find) =>{
                        if(err){
                            res.status(500).send({message:"Error" + err});
                        }else if(find){
                            res.send({message:"El usuario ya existe"});
                        }else{
                            let user = new User();
                            user.name = separate[1];
                            user.lastname = separate[2];
                            user.username = separate[3];
                            user.email = separate[4];
                            bcrypt.hash(separate[5], null, null , (err, encrypt)=>{
                                if(err){
                                    res.status(500).send({message:"Error" + err});
                                }else if(encrypt){
                                    user.password = encrypt;
                                    user.save((err,userSaved)=>{
                                        if(err){
                                            res.status(500).send({message:"Error"+ err});
                                        }else if(userSaved){
                                            res.send(userSaved);
                                        }else{
                                            res.status(500).send({message:"no se pudo guardar el usuario"})
                                        }
                                    });
                                }
                            });
                        }
                    });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            break;
        case "LOGIN":
            if(separate[1]!= null){
                User.findOne({$or:[{username: separate[1]}, {email:separate[1]}]} ,(err, findUser)=>{
                    if(err){
                        res.status(500).send({message:"error"+err});
                    }else if(findUser){
                        bcrypt.compare(separate[2], findUser.password, (err,check) =>{
                            if(err){
                                res.status(500).send({message:"Error"+ err});
                            }else if(check){
                                res.send({token: jwt.createToken(findUser)});
                            }else{
                                res.status(500).send({message:"Email o usuario o contraseña incorrecta"});
                            }
                        });
                    }else{
                        res.status(404).send({message:"No existe usuario con ese email o username"});
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            
            break;
        case "ADD_TWEET":
            let tweet = new Tweet();
            var userId = req.user.sub;
            tweet.description = content;
            if(content!=""){
                tweet.save((err, tweetSaved)=>{
                    if(err){
                        res.status(500).send({message:"Error" + err})
                    }else if(tweetSaved){
                        User.findByIdAndUpdate(userId, {$push:{tweet:tweetSaved}}, {new:true}, (err, tweetNew)=>{
                            if(err){
                                res.status(500).send({message:"error"+ err});
                            }else if(tweetNew){
                                res.send(tweetNew);
                            }else{
                                res.status(500).send({message:"No se pudo guardar el tweet"});
                            }
                        }).populate("tweet");
                    }else{
                        res.status(404).send({message:"No se guardo el tweet"});
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            break;
        case "DELETE_TWEET":
            var tweetId = separate[1];
            var userId = req.user.sub;
            if(tweetId!=null){
                Tweet.findByIdAndRemove(tweetId, (err, removeTweet)=> {
                    if(err){
                        res,status(500).send({message:"Error"+err});
                    }else if(removeTweet){
                        User.findByIdAndUpdate(userId, {$pull:{tweet:{_id: tweetId}}}, {new:true}, (err, userRemove)=>{
                            if(err){
                                res.status(500).send({message:"Error"+ err});
                            }else if(userRemove){
                                res.send(userRemove);
                            }else{
                                res.status(500).send({message:"No se podu eliminar el mensaje"});
                            }
                        });
                    }else{
                        res.status(500).send({message:"No se pudo eliminar el me"})
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            break;

        case "EDIT_TWEET":
            var tweetId = separate[1];
            if(tweetId!=null){
                Tweet.findByIdAndUpdate(tweetId, {description:content2}, {new:true}, (err, editTweet)=>{
                    if(err){
                        res,status(500).send({message:"Error"+err});
                        console.log(content2);
                    }else if(editTweet){
                        res.send(editTweet);
                        
                    }else{
                        res.status(500).send({message:"No se pudo actualizar el tweet"});
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            break;
        case "VIEW_TWEETS":
            if(separate[1] != null){
                User.findOne({username: separate[1]}, (err, FindU)=>{
                    if(err){
                        res.status(500).send({message:"Error"+ err});
                    }else if(FindU){
                        res.send(FindU);
                    }else{
                        res.status(404).send({message:"No se encontro el usuario"});
                    }
                }).populate("tweet");
            }else{
                Tweet.find({},(err, findT)=>{
                    if(err){
                        res.status(500).send({message:"Error"+ err});
                    }else if(findT){
                        res.send(findT);
                    }else{
                        res.status(404).send({message:"No hay tweets que mostrar"});
                    }
                })
            }
            break;
        case "FOLLOW":
            var userId2 = separate[1];
            var userId = req.user.sub;
            if(userId2!=null){
                User.findOne({username:userId2},(err, findUser)=>{
                    if(err){
                        res.status(500).send({message:"Error"+err});
                    }else if(findUser){
                        User.findOne({ _id: userId, follow:{_id:findUser.id}}, (err2, findUser2)=>{
                            if(err2){
                                res.status(500).send({message:"Error"+err});
                                
                            }else if(findUser2){
                                res.send({message:"No se puede seguir mas de una vez"});
                            }else{
                                User.findByIdAndUpdate(userId, {$push:{follow:findUser.id}}, {new:true}, (err, followage)=>{
                                    if(err){
                                        res.status(500).send({message:"Error"+err});
                                    }else if(followage){
                                        res.send({message:"ya sigues la cuenta"});
                                    }else{
                                        res.status(500).send({message:"No se pudo seguir a la persona"});
                                    }
                                });
                            }
                        });
                    }else{
                        res.status(404).send({message:"No se encontro al usuario"});
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"});
            }
            
            break;
        case "UNFOLLOW":
            var userId2 = separate[1];
            var userId = req.user.sub;
            if(userId2!=null){
                User.findOne({username:userId2},(err, findUser)=>{
                    if(err){
                        res.status(500).send({message:"Error"+err});
                    }else if(findUser){
                        User.findOne({ _id: userId, follow:{_id:findUser.id}}, (err2, findUser2)=>{
                            if(err2){
                                res.status(500).send({message:"Error"+err});
                            }else if(findUser2){
                                User.findByIdAndUpdate(userId, {$pull:{follow:findUser.id}}, {new:true}, (err, unfollowage)=>{
                                    if(err){
                                        res.status(500).send({message:"Error"+err});
                                    }else if(unfollowage){
                                        res.send({message:"ya no sigues la cuenta"});
                                    }else{
                                        res.status(500).send({message:"No se pudo seguir a la persona"});
                                    }
                                });
                            }else{
                                res.send({message:"No sigues a esta persona"});
                            }
                        });
                    }else{
                        res.status(404).send({message:"No se encontro al usuario"});
                    }
                });
            }else{
                res.status(500).send({message:"Faltan parametros"}); 
            }
            
            break;
        case "PROFILE":
            var userId2 = separate[1];
            User.findOne({username:userId2}, {password:0}, (err, findUser)=>{
                if(err){
                    res.status(500).send({message:"Error"+err});
                }else if(findUser){
                    res.send(findUser)
                }else{
                    res.status(404).send({message:"No se encontro el usuario"});
                }
            }).populate("tweet");
            break;
    }
}

module.exports = {
    commands
};