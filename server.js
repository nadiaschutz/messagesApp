var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require("http").Server(app);
var io = require('socket.io')(http);
var mongoose = require("mongoose");

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));


mongoose.Promise = Promise;
var dbUrl = 'mongodb+srv://nadia-admin:123qwe@cluster0-rrkea.mongodb.net/test?retryWrites=true&w=majority'

var Message = mongoose.model("message", {
    name: String,
    message: String
});

// var messages = [{
//         name: 'Tim',
//         message: 'Hi'
//     },
//     {
//         name: 'Jane',
//         message: 'Hello'
//     }
// ]

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });

})


// callback hell
// app.post('/messages', (req, res) => {
//     var message = new Message(req.body);

//     message.save((err) => {
//         if (err) {
//             sendStatus(500);
//         } else {
//             Message.findOne({
//                     message: 'badword'
//                 },
//                 (err, censored) => {
//                     if (censored) {
//                         console.log('censored words found', censored);
//                         Message.remove({
//                             _id: censored.id
//                         }, (err) => {
//                             console.log('removed censored message');
//                         });
//                     }
//                 }
//             );
//             io.emit('message', req.body);
//             res.sendStatus(200);
//         }
//     });
// });


// promises
// app.post('/messages', (req, res) => {
//     var message = new Message(req.body);

//     message.save()
//         .then(() => {
//             console.log('saved');
//             return Message.findOne({
//                 message: 'badword'
//             });
//         })
//         .then(censored => {
//             if (censored) {
//                 console.log('censored words found');
//                 return Message.deleteOne({
//                     _id: censored.id
//                 });
//             }
//             io.emit('message', req.body);
//             res.sendStatus(200);
//         })
//         .catch((err) => {
//             res.sendStatus(500);
//             return console.log(err);
//         })
// });

//async/await + try/catch
app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body);
        var saveMessage = await message.save()
        console.log('saved');
        var censored = await Message.findOne({
            message: 'badword'
        });
        if (censored) {
            await Message.deleteOne({
                _id: censored.id
            });
        } else {
            io.emit('message', req.body);
            res.sendStatus(200);
        }
    } catch (error) {
        res.sendStatus(500);
        return console.error(error);
    } finally {
        console.log('message post called') // gets executed regardless if try /catch fail
    }
});





io.on("connection", (socket) => {
    console.log('a user connected');
});

mongoose.connect(dbUrl, {
    useMongoClient: true
}, (err) => {
    console.log('mongo db connection', err);
});

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})