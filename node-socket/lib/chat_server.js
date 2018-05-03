var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

var assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
  var name = 'Guest' + guestNumber;
  // 把用户昵称和客户端连接ID关联上
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNumber + 1;
};

var joinRoom = (socket, room) => {
  socket.join(room); // 让用户进入房间
  currentRoom[socket.id] = room; // 记录当前房间
  socket.emit('joinResult', { room: room }); // 让用户知道他们进入了新的房间
  socket.broadcast.to(room).emit('message', {
    // 让房间的其他用户知道有新用户进入了房间
    text: nickNames[socket.id] + ' has joined ' + room
  });
  var usersInRoom = io.sockets.clients(room); // 确定有哪些用户在这个房间
  if (usersInRoom.length > 1) {
    // 如果不止一个人在这个房间里，汇总下都有谁
    var usersInRoomSummary = 'Users currently in' + room + ':';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', { text: usersInRoomSummary }); // 将房间里其他用户的汇总发送给这个用户
  }
};

var handleNameChangeAttempts = (socket, nickNames, namesUsed) => {
  // 添加 nameAttempt 事件监听器
  socket.on('nameAttempt', name => {
    console.log('name333', name);
    if (name.indexOf('Guest') == 0) {
      // 昵称不能以 Guest 开头
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest"'
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNameIndex];
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name
        });
      } else {
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use'
        });
      }
    }
  });
};

var handleMessageBroadcasting = socket => {
  socket.on('message', message => {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
};

var handleRoomJoining = socket => {
  socket.on('join', room => {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom);
  });
};

var handleClientDisconnetion = socket => {
  socket.on('disconnect', () => {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
};

exports.listen = server => {
  io = socketio.listen(server); // 启动Socket IO服务器，允许它搭载在已有的HTTP服务器上
  io.set('log level', 1);
  /**
   * 定义每个用户连接的处理逻辑
   */
  io.sockets.on('connection', socket => {
    // 在用户连接上来时赋予一个访客名
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(socket, 'Lobby'); // 在用户连接上来时把他放在聊天室Lobby里
    // 处理用户的消息，更名，以及聊天室的创建和变更
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    // 用户发出请求时，向其提供已经被占用的聊天室列表
    socket.on('rooms', () => {
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    // 定义用户断开连接后的清除逻辑
    handleClientDisconnetion(socket, nickNames, namesUsed);
  });
};
