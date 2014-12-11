/**
 * @jsx React.DOM
 */
var socket = io.connect();

var Users = [];
var Messages = [];

var UsersList = React.createClass({
	render: function(){
		var renderUser = function(user,i){
			return <li key={i}> {user} </li>
		};
		return (
			<div className='users'>
				<h3> Online Users </h3>
				<ul>{ this.props.users.map(renderUser)} </ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render: function(){
		return(
			<div className="message">
				<strong>{this.props.user}</strong> :
				{this.props.text}		
			</div>
		)
	}
});

var MessageList = React.createClass({
	render: function(){
		var renderMessage = function(message,i){
			return <Message user={message.user} text={message.text} key={i} />
		}
		return (
			<div className='messages'>
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
			<div className='message_form'>
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
			<div className='change_name_form'>
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
		Users = data.users;
		this.setState({ users: Users, user: data.name});
	},

	messageRecieve: function(message){
		Messages.push(message);
		this.setState({ messages : Messages });
	},

	userJoined: function(data){
		Users.push(data.name);
		Messages.push({
			user: 'APLICATION BOT',
			text : data.name +' Joined'
		});
		this.setState({ users : Users, messages: Messages});
	},

	userLeft: function(data){
		var index = Users.indexOf(data.name);
		Users.splice(index, 1);
		Messages.push({
			user: 'APLICATION BOT',
			text : data.name +' Left'
		});
		this.setState({ users : Users, messages: Messages});
	},

	userChangedName : function(data){
		var oldName = data.oldName;
		var newName = data.newName;
		Users.splice(Users.indexOf(oldName), 1, newName);
		Messages.push({
			user: 'APLICATION BOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState({ users : Users, messages: Messages});
	},

	handleMessageSubmit : function(message){
		Messages.push(message);
		this.setState({ messages : Messages });
		socket.emit('send:message', message);
	},

	handleChangeName : function(newName){
		var that = this;
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, function(result){
			if(!result){
				alert('There was an error changing your name');
			}else{
				var index = Users.indexOf(oldName);
				Users.splice(index, 1, newName);
				that.setState({users : Users, user: newName});
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

React.render(<ChatApp/>, document.body);
