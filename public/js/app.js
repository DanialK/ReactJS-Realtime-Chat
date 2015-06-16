/**
 * @jsx React.DOM
 */
var socket = io.connect();

var Users = [];
var Messages = [];

var UsersList = React.createClass({
	render: function(){
		var renderUser = function(user, index){
			return <li id={index}> { user} </li>
		};
		return (
			<div class='users'>
				<h3> Online Users </h3>
				<ul>{ this.props.users.map(renderUser)} </ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render: function(){
		return(
			<div class="message-body">
				<div class="user">{this.props.user}</div>
				<div class="message">{this.props.text}</div>
			</div>
		)
	}
});

var MessageList = React.createClass({
	render: function(){
		var renderMessage = function(message){
			return <Message user={message.user} text={message.text} />
		}
		return (
			<div class='messages'>
				<h2> Conversation </h2>
				{ this.props.messages.map(renderMessage)} 
			</div>
		);
	}
});

var MessageForm = React.createClass({

	getInitialState: function(){
		return {text: ''};
	},

	handleSubmit : function(e){
		e.preventDefault();
        if(this.state.text) {
            var message = {
                user: this.props.user,
                text: this.state.text
            }
            this.props.onMessageSubmit(message);
            this.setState({text: ''});
        }
	},

    handleEnter: function(e){
        e.preventDefault();
        if(e.keyCode === 13 && this.state.text && (!e.shiftKey)){

            var message = {
                user: this.props.user,
                text: this.state.text
            }
            this.props.onMessageSubmit(message);
            this.setState({text: ''});
        }
    },

	changeHandler : function(e){
		this.setState({ text : e.target.value });
	},

	render: function(){
		return(
			<div class='message_form'>
				<h3></h3>
				<form onKeyUp={this.handleEnter}>
					<textarea onChange={this.changeHandler} value={this.state.text}></textarea>
				</form>
			</div>
		);
	}
});

var ChangeNameForm = React.createClass({
	getInitialState: function(){
		return {newName: 'Your Name?'};
	},

	onKey : function(e){
		this.setState({ newName : e.target.value });
	},

    oldName: "",

	handleSubmit : function(e){
        e.preventDefault();
        var newName = this.state.newName;
        if(newName !== this.oldName) {
            this.props.onChangeName(newName);
            this.oldName = newName;
        }
	},

    onInit: function(e){
        e.preventDefault();
        if(this.state.newName == "Your Name?") {
            this.setState({newName: ''});
        }
    },

	render: function(){
		return(
			<div class='change_name_form'>
				<h3></h3>
				<form onSubmit={this.handleSubmit}>
					<input onChange={this.onKey} onClick={this.onInit} onBlur={this.handleSubmit} value={this.state.newName} />
				</form>	
			</div>
		);
	}
});

var ChatApp = React.createClass({

	getInitialState: function(){

		socket.on('init', this.initialize);
		socket.on('send:message', this.messageRecieve);
		socket.on('user:join', this.userJoined);
		socket.on('user:left', this.userLeft);
		socket.on('change:name', this.userChangedName);

		return {users: [], messages:[], text: ''};
	},

	initialize: function(data){
		this.setState({ users: data.users, user: data.name+'#'+data.users.length});
	},

	messageRecieve: function(message){

		var decrypted = CryptoJS.AES.decrypt(message.text, "what3ver@#$%^*donE", {format: JsonFormatter});
        message.text = decrypted.toString(CryptoJS.enc.Utf8);

		this.state.messages.push(message);
		this.setState();
	},

	userJoined: function(data){
		this.state.users.push(data.name);
		this.state.messages.push({
			user: 'APLICATION BOT',
			text : data.name +' Joined'
		});
		this.setState();
	},

	userLeft: function(data){
		var index = this.state.users.indexOf(data.name);
		this.state.users.splice(index, 1);
		this.state.messages.push({
			user: 'APPLICATION BOT',
			text : data.name +' Left'
		});
		this.setState();

	},

	userChangedName : function(data){
		var oldName = data.oldName;
		var newName = data.newName;
		this.state.users.splice(this.state.users.indexOf(oldName), 1, newName);
		this.state.messages.push({
			user: 'APLICATION BOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState();

	},

	handleMessageSubmit : function(message){



		this.state.messages.push(message);
		this.setState();

        var x = CryptoJS.AES.encrypt(message.text, "what3ver@#$%^*donE", {format: JsonFormatter}).toString();
		socket.emit('send:message', {user: message.user, text: x});
	},

	handleChangeName : function(newName){
		var that = this;
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, function(result){
			if(!result){
				alert('There was an error changing your name');
			}else{
				var index = that.state.users.indexOf(oldName);
				that.state.users.splice(index, 1, newName);
                that.state.user = newName;
				that.setState();
			}
		});
	},

	render : function(){
		return (
			<div class="pull-left">
                <div class="pull-left">
				<UsersList users={this.state.users} />
				<MessageList messages={this.state.messages} />
                </div>
                <div class="pull-left">
				<MessageForm onMessageSubmit={this.handleMessageSubmit} user={this.state.user} />
				<ChangeNameForm onChangeName={this.handleChangeName} />
                </div>
			</div>
		);
	}
});

React.renderComponent(<ChatApp/>, document.body);