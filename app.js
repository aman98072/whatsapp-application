const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const port = 3000;
const usernamesList = {};

app.use(express.static(path.resolve('./public')));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/views/chat.html'));    
});

io.sockets.on('connection', function(socket) {
    console.log("connection created with socket.io", socket.id);
    socket.on('username', function(username) {
        console.log("username : ", username);
        usernamesList[socket.id] = username;
        console.log(usernamesList);        
        io.emit('send_message', '🔵 ' + username + ' join the chat..', 'receiver');
        io.emit('online_users', usernamesList, username);
    });

    socket.on('send_message', function(message) {
        console.log("My username: ", usernamesList[socket.id]);
        
        // If you want to send to all sockets except yourself use socket.broadcast.emit('event', value)
        socket.broadcast.emit('send_message', '<strong>' + usernamesList[socket.id] + '</strong> : ' + message, 'receiver');

        // If you just want to answer yourself (socket that initiated event) : socket.emit('event', value);
        socket.emit('send_message', '<strong> You </strong> : ' + message, 'sender');
    });

    socket.on('typing', function(socket_id) {        
        socket.broadcast.emit('typing', usernamesList[socket_id] + ' is typing...');
    });

    socket.on('typing_stop', function() {
        socket.broadcast.emit('typing_stop');
    });

    socket.on('disconnect', function(username) {
        console.log("connection disconnected with socket.io", socket.id, usernamesList);
        socket.broadcast.emit('send_message',  '🔴 ' + usernamesList[socket.id] + ' left the chat..', 'receiver');        
        delete usernamesList[socket.id];
        console.log(usernamesList);
        io.emit('online_users', usernamesList);
    });
});

http.listen(port, function() {
    console.log(`listening on ${port}`);
});