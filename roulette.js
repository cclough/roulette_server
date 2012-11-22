var port = process.env.PORT || 5001;

var io = require('socket.io').listen(parseInt(port));

io.set( 'origins', 'www.casenexus.com:*' );

// user_ids has the array of connected users with their socket id
var user_ids = {};

io.sockets.on('connection', function (socket) {
	// when the client emits 'adduser', this listens and executes
	socket.on('add_user', function(data) {
		// we store the username in the socket session for this client
		socket.user_id = data.id;
		socket.user_name = data.name;
		// add the client's username to the global list
		user_ids[socket.user_id] = socket.id;		
		// echo to client they've connected
		socket.emit('update_log', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('update_log', 'SERVER', socket.user_name + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('update_users', user_ids);
	});
	
	// private message code from - http://stackoverflow.com/questions/11356001/socket-io-private-message
	// Fixed by Kevin
	socket.on('private', function(data) {
		var my_user_id = socket.user_id;
		var to_user_id = data.to;
		var socket_id = user_ids[to_user_id];
		if (socket_id) {
			var to_socket = io.sockets.sockets[socket_id];
			to_socket.emit('private', { from: my_user_id, to: to_user_id, msg: data.msg });
		}
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the user id from the global user_ids
		delete user_ids[socket.user_id];
		// update list of users in chat, client-side
		io.sockets.emit('update_users', user_ids);
		// echo globally that this client has left
		socket.broadcast.emit('update_log', 'SERVER', socket.user_name + ' has disconnected');		
	});
});
