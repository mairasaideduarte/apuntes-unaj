var express=require('express');
var exphbs=require('express-handlebars');
var app=express();
var puerto=process.env.port||3000;
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb+srv://maira:bob@cluster0-tioej.mongodb.net/test?retryWrites=true&w=majority'
// Database Name
var dbNombre = 'test';
var bd;
 
// Use connect method to connect to the server
var cliente = new MongoClient(url, { useUnifiedTopology: true })

cliente.connect(function (err, client) {
    if (err) {
        console.error(err)
        client.close()
        process.exit(1)
    }

    console.log('Conectado exitosamente!');
    bd = client.db(dbNombre);
    bd.collection('personas');
    bd.collection('comentarios')
    
});

app.use(express.static('public'));

//para ue ande el formulario 
app.use(express.urlencoded());


app.engine('hbs',exphbs());
app.set('view engine','hbs');
app.post('/ingreso_usuarios',function(consulta,respuesta){

    var nombre=consulta.body.nombre;
    var apellido=consulta.body.apellido;
    var pass=consulta.body.pass;
    bd.collection('personas').insertMany([
        {nombre:nombre,apellido:apellido,pass:pass}
    ])
    respuesta.redirect('login.html');
})
app.post('/api/login', async function (consulta, respuesta) {
    var personas = await bd.collection('personas').find().toArray()
    var usuario = personas.find(function (persona) {
        return persona.nombre.toLowerCase() === consulta.body.nombre.toLowerCase()||persona.apellido.toLowerCase() === consulta.body.apellido.toLowerCase()
    })
    if (!usuario || (usuario.pass !== consulta.body.pass)) {
        return respuesta.status(401).send('No autorizado')
    }
    respuesta.send("contenido de la materia")

})

app.post('/ingreso_comentario',function(req,res){

    var nombre=req.body.nombre;
    var apellido=req.body.apellido;
    var texto=req.body.texto;
    bd.collection('comentarios').insertMany([
        {nombre:nombre,apellido:apellido,comentario:texto}
    ])
    res.render('exito',{nombre,apellido,texto});
})

app.post('/ver_comentarios',async function(req,res){
        var comentarios = await bd.collection('comentarios').find().sort({$natural:-1}).toArray()
        
        res.render('comentarios',{comentarios})
       
})


//para que corra el servidor en el puerto 3000
app.listen(puerto,function(){
    console.log("servidor escuchando en el puerto "+puerto);
});