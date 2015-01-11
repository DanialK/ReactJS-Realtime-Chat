/**
 * @jsx React.DOM
 */
var socket = io.connect();

var Users = [];
var Messages = [];

var UsersList = React.createClass({
	render: function(){
		var renderUser = function(user){
			return <li> { user} </li>
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
			<div class="message">
				<strong>{this.props.user}</strong> :
				{this.props.text}		
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
				<h2> Conversation: </h2>
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
		var message = {
			user : this.props.user,
			text : this.state.text
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler : function(e){
		this.setState({ text : e.target.value });
	},

	render: function(){
		return(
			<div class='message_form'>
				<h3>Write New Message</h3>
				<form onSubmit={this.handleSubmit}>
					<input onChange={this.changeHandler} value={this.state.text} />
				</form>
			</div>
		);
	}
});

var ChangeNameForm = React.createClass({
	getInitialState: function(){
		return {newName: ''};
	},

	onKey : function(e){
		this.setState({ newName : e.target.value });
	},

	handleSubmit : function(e){
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render: function(){
		return(
			<div class='change_name_form'>
				<h3> Change Name </h3>
				<form onSubmit={this.handleSubmit}>
					<input onChange={this.onKey} value={this.state.newName} />
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
		this.setState({ users: data.users, user: data.name});
	},

	messageRecieve: function(message){
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
			user: 'APLICATION BOT',
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

		socket.emit('send:message', message);
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
				that.setState();
			}
		});
	},

	render : function(){
		return (
			<div>
				<UsersList users={this.state.users} />
				<MessageList messages={this.state.messages} />
				<MessageForm onMessageSubmit={this.handleMessageSubmit} user={this.state.user} />
				<ChangeNameForm onChangeName={this.handleChangeName} />
			</div>
		);
	}
});

React.renderComponent(<ChatApp/>, document.body);