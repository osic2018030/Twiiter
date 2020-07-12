'use strict'

var mongoose = require('mongoose');
var port = 3800;
var app = require('./app');

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:27017/Twitter', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false})
.then(()=>{
    console.log('Conexión a la BD correcta');
    app.listen(port, ()=>{
        console.log('Servidor de express corriendo', port); 
        console.log('La mayoria de los comandos estan segun el pdf los unicos que cambian son el register y el view_tweet  el register' + '\n' +'La estructura es del register es register nombre apellido username email password');
        console.log('Para el view_tweet lo unico que cambia es que si no se ingresa un usario mostrara todos los tweets en general');
    });
}).catch( err=>{
    console.log('Error al conectarse', err);
});