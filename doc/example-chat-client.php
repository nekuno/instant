<!DOCTYPE html>
<html>
<head></head>
<body>
<h1>Prueba de chat</h1>

<div style="float:left;height:100%;background-color:#ccc;padding:0 15px;margin:0 10px;">
    <h2>Usuarios</h2>
    <label>Token <input type="text" name="token"/></label>
    <button id="connect">Conectar</button>
    <button id="disconnect" style="display: none;">Desconectar</button>
    <div>
        <span style="color:red" id="error"></span>
        <span style="color:green" id="message"></span>
    </div>
    <ul id="users"></ul>
</div>
<div id="chats"></div>

<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="http://localhost:8008/socket.io/socket.io.js"></script>
<script>

    var connect = $('#connect');
    var disconnect = $('#disconnect');
    var users = $('#users');

    connect.on('click', function(event) {

        connect.remove();
        event.preventDefault();
        var token = $('[name=token]').val();
        var socket = io.connect('http://localhost:8008/chat?token=' + token);

        socket.on('connect',function() {

            disconnect.show();

            socket.on('user', function(user) {
                $('#message').text('Conectado al socket (Usuario ' + user.id + ')');
            });

            socket.on('userStatus', function(user, status) {

                var li = users.find('li[data-user="' + user + '"]');

                if (li.length > 0) {
                    li.find('span').text(status);
                } else {
                    var userHtml = '';
                    userHtml += '<li data-user="' + user + '">';
                    userHtml += '<a href="#" class="iniciar_chat" data-user=' + user + '>';
                    userHtml += 'Usuario ' + user + ' (' + '<span>' + status + '</span>' + ')';
                    userHtml += '</a>';
                    userHtml += '</li>';
                    users.append(userHtml);
                    users.find('li[data-user="' + user + '"]').on('click', function(event) {
                        event.preventDefault();
                        openChat($(this).data('user'));
                    });
                }
            });

            socket.on('updateChat', function(user, message, type) {
                if ($('#chat_panel[data-user="' + user + '"] .chatlog').length == 0) {
                    openChat(user);
                }
                $('#chat_panel[data-user="' + user + '"] .chatlog').append('<hr/>' + type + ': ' + message);
            });

            function sendMessage(user) {
                var message_input = $('#chat_panel[data-user="' + user + '"] .message_input');
                socket.emit('sendMessage', user, message_input.val());
                message_input.val('');
            }

            function openChat(user) {
                var ventana_chat = '';
                ventana_chat += '<div id="chat_panel" data-user="' + user + '">';
                ventana_chat += '<h2>Usuario ' + user + '</h2>';
                ventana_chat += '<div class="chatlog"></div>';
                ventana_chat += '<input type="text" class="message_input"/>';
                ventana_chat += '<button>send</button>';
                ventana_chat += '</div>';
                $('#chats').append(ventana_chat);
                $('#chat_panel[data-user="' + user + '"] .message_input').on('focus', function() {
                    socket.emit('markAsReaded', user, new Date().toISOString());
                });
                $('#chat_panel[data-user="' + user + '"] .message_input').keyup(function(event) {
                    if (event.keyCode == 13) {
                        sendMessage(user);
                    }
                });
                $('#chat_panel[data-user="' + user + '"] button').on('click', function(event) {
                    sendMessage(user);
                });
            }

            disconnect.on('click', function(event) {
                event.preventDefault();
                disconnect.remove();
                socket.disconnect();
                $('#message').text('Desconectado del socket');
                $('#error').text('');
            });

        }).on('error', function() {
            $('#error').text('No se pudo conectar el socket');
        });
    });
</script>
</body>
</html>