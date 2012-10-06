var port = process.env.PORT || 5001;

var io = require('socket.io').listen(parseInt(port));

io.set( 'origins', 'salty-crag-5200.herokuapp.com:*' );

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatelog', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatelog', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// private message code from - http://stackoverflow.com/questions/11356001/socket-io-private-message
	socket.on('private', function(data) {        
        io.sockets.sockets[data.to].emit('private', { from: socket.id, to: data.to, msg: data.msg });
   		socket.emit('private', { from: socket.id, to: data.to, msg: data.msg });
   	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatelog', 'SERVER', socket.username + ' has disconnected');
	});
});
