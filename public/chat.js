var socket = io.connect('http://localhost:3000');
console.log("Socket Data : ", socket, socket.id);
// submit text message without reload/refresh the page

// click on send button for shoot message
$('.reply-send').click(function(){    
    var val = $('.reply-message').val().trim();
    if (val) {
        socket.emit('send_message', val);
        socket.emit('typing_stop');
        $('.reply-message').val('');
        return false;
    }
});

// typing text
$(".reply-message").keydown(function (e) {
    socket.emit('typing', socket.id);
    if (e.keyCode == 13) {
      $('.reply-send').click();
    }
});

// typing messahe handle
socket.on('typing', function(msg) {
    console.log("your ", msg);
    $(".typing-message").html(msg);
});

// Stop Typing
socket.on('typing_stop', function() {
    $(".typing-message").html('');
});

// append text mesage
socket.on('send_message', function(join_msg, msg_type) {
    var msg = ``;
    var date_time = get_date_time();
    if (msg_type == 'sender') { // message type sender
        msg += `<div class="row message-body">
                    <div class="col-sm-12 message-main-sender">
                        <div class="sender">
                            <div class="message-text"> ${join_msg} </div>
                            <span class="message-time pull-right"> ${date_time} </span>
                        </div>
                    </div>
                </div>`;
    } else { // message type receiver
        msg += `<div class="row message-body">
                    <div class="col-sm-12 message-main-receiver">
                        <div class="receiver">
                            <div class="message-text"> ${join_msg} </div>
                            <span class="message-time pull-right"> ${date_time} </span>
                        </div>
                    </div>
                </div>`;
    }

    $('.msg-content-body').append(msg);
});


// append text if someone is online
socket.on('online_users', function(usernamesList, username) {
    if (username) {
        $(".username-heading").html(username);
    }

    var date_time = get_date_time('hour_min');
    if (Object.keys(usernamesList).length > 0) {
        var msg = ``;
        Object.keys(usernamesList).forEach( (element) => {
            let socket_id = element;   
            if (socket_id == socket.id) {
                return true;
            }            

            msg += `<div class="row sideBar-body" id="socketid_${socket_id}">
                        <div class="col-sm-3 col-xs-3 sideBar-avatar">
                            <div class="avatar-icon">
                                <img src="https://bootdey.com/img/Content/avatar/avatar1.png">
                            </div>
                        </div>
                        <div class="col-sm-9 col-xs-9 sideBar-main">
                            <div class="row">
                                <div class="col-sm-8 col-xs-8 sideBar-name">
                                    <span class="name-meta">${usernamesList[element]}
                                    </span>
                                </div>
                                <div class="col-sm-4 col-xs-4 pull-right sideBar-time">
                                    <span class="time-meta pull-right">${date_time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>`;
        });

        $('.user_online_list').html(msg);
    }
});

// ask username
var username = prompt('Please tell me your name');
socket.emit('username', username);

// get current date & time
function get_date_time(type = '') {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; 
    var yyyy = today.getFullYear();
    var hour = today.getHours();
    var am_pm = hour >= 12 ? 'PM' : 'AM';  
    var min = today.getMinutes();
    var sec = today.getSeconds();

    if (dd < 10) {
        dd = '0'+dd;
    } 
    if (mm < 10) {
        mm = '0'+mm;
    }   
    if (hour == 0) {
        hour = 12;
    }

    if (type == 'hour_min') {
        return  hour+':'+min+' '+am_pm;
    }

    today = mm+'-'+dd+'-'+yyyy+' '+hour+':'+min+' '+am_pm;
    return today;
}