<?php
$user = $_GET['user'];
?>
<!DOCTYPE html>
<html>
<head>

</head>
<body>
<h1>Prueba de chat</h1>

<div style="float:left;height:100%;background-color:#ccc;padding:0 15px;margin:0 10px;">
    <h2>Usuarios</h2>
    <label>Token <input type="text" name="token" value="1234"/></label>
    <button id="connect">Conectar</button>
    <div>
        <span style="color:red" id="error"></span>
        <span style="color:green" id="message"></span>
    </div>
    <ul>
        <?php
        for ($i = 1; $i <= 4; $i++) {
            if ($i != $user) {
                ?>
                <li>
                    <a href='#' class='iniciar_chat' data-user='<?= $i ?>'>
                        Usuario <?= $i ?>
                        <span id='usuario<?= $i ?>'></span>
                    </a>
                </li>
            <?php
            }
        }
        ?>
    </ul>
</div>
<div id="chats">

</div>

<script src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script src="http://localhost:8008/socket.io/socket.io.js"></script>
<script>

    $('#connect').on('click', function(event) {

        $('#connect').remove();
        event.preventDefault();
        var token = $('[name=token').val();

        var socket = io.connect('http://localhost:8008/chat?token=' + token);

        socket.on('connect',function() {
            $('#message').text('Conectado al socket');
        }).on('error', function() {
            $('#error').text('No se pudo conectar el socket');
        });

        socket.emit("set_online", token);

        <?php for ($i=1;$i<=4;$i++) { ?>
        socket.emit("check_user", <?=$i?>);
        <?php } ?>

        socket.on("user_status", function(target, status) {
            var marca = status == "online" ? "(online)" : "()";
            $("#usuario" + target).html(marca);
        });

        socket.on("update_chat", function(user, message, type) {
            if ($('#chat_panel[data-user="' + user + '"] .chatlog').length == 0) {
                openChat(user);
            }
            $('#chat_panel[data-user="' + user + '"] .chatlog').append("<hr/>" + type + ": " + message);
        });

        function sendMessage(user) {
            message_input = $('#chat_panel[data-user="' + user + '"] .message_input');
            socket.emit("send_message", user, message_input.val());
            message_input.val('');
        }

        function openChat(user) {
            var ventana_chat = '';
            ventana_chat += '<div id="chat_panel" data-user="' + user + '">';
            ventana_chat += '<h2>Usuario ' + user + '</h2>';
            ventana_chat += '<div class="chatlog"></div>';
            ventana_chat += '<input type="text" class="message_input"/>';
            ventana_chat += '<button onclick="sendMessage(' + user + ')">send</button>';
            ventana_chat += '</div>';
            $('#chats').append(ventana_chat);
            $('#chat_panel[data-user="' + user + '"] .message_input').keyup(function(e) {
                if (e.keyCode == 13) {
                    sendMessage(user);
                }
            });
        }

        $('.iniciar_chat').click(function() {
            openChat($(this).data('user'));
        });

    });
</script>
</body>
</html>