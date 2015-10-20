'use strict';

var globalId = 0,
		keys = {
			ENTER: 13,
			ESC: 27
		};

// TodoList
function TodoList(container){
	this.containerId = container;
	this.items = [];
	this.el = document.getElementById(this.containerId);
	this.list = this.el.querySelector('.todo-list');

	this.init();

}

TodoList.prototype.init = function(){
	this.getFromStorage();
	this.addAll();
	this.bindEvents();
}

TodoList.prototype.bindEvents = function(){
	this.el.querySelector('input.new-todo').addEventListener('keydown', this.newItemHandler.bind(this));
}

TodoList.prototype.newItemHandler = function(e){
	var input = e.currentTarget;
	if (e.keyCode == keys.ENTER){
		this.addItem(new TodoItem(input.value));
		this.saveToStorage();
		input.value = '';
	}

}

TodoList.prototype.addItem = function(item){
	this.items.push(item);
	this.list.appendChild(item.element);
	item.listInstance = this;
}

TodoList.prototype.addAll = function(){
	var self = this;
	foreach(this.items, function(el, i){
		self.list.appendChild(el.element);
	})
}

TodoList.prototype.updateStats = function(){

}

TodoList.prototype.saveToStorage = function(){
	localStorage['todos-' + this.containerId] = JSON.stringify(this.toJSON());
}

TodoList.prototype.getFromStorage = function(){
	var self = this,
			items = [];
	if (typeof localStorage['todos-' + this.containerId] !== "undefined")
		items = JSON.parse(localStorage['todos-' + this.containerId]);

	foreach(items, function(item){
		var todoItem = new TodoItem(item.title);
		todoItem.done = item.done;
		todoItem.id = item.id;
		self.addItem(todoItem);
	})
}

TodoList.prototype.toJSON = function(){
	var items = [];
	foreach(this.items, function(item){
		items.push({
			title: item.title,
			done: item.done,
			id: item.id
		})
	})
	return items;
}


// TodoItem
function TodoItem(title){

	this.title = title || 'new todo';
	this.done = false;
	this.id = ++globalId;

	this.init();
}

TodoItem.prototype.init = function(){
	this.element = document.createElement('li');

	this.element.innerHTML += this.render();

	this.input = this.element.querySelector('input.edit');
	this.label = this.element.querySelector('.view label');
	this.destroyButton = this.element.querySelector('.destroy');

	this.bindEvents();
}

TodoItem.prototype.bindEvents = function(){
	this.destroyButton.addEventListener('click', this.deleteHandler.bind(this));
	this.label.addEventListener('dblclick', this.startEditHandler.bind(this));
	this.input.addEventListener('keydown', this.endEditHandler.bind(this));
	this.input.addEventListener('blur', this.cancelEditHandler.bind(this));
}

TodoItem.prototype.startEditHandler = function(e){
	addClass(this.element, 'editing');
	this.input.focus();
	this.input.value = this.title;
}

TodoItem.prototype.endEditHandler = function(e){

	if (e.keyCode == keys.ESC){
		removeClass(this.element, 'editing');
	}
	if (e.keyCode == keys.ENTER){
		this.title = this.input.value;
		removeClass(this.element, 'editing');
		this.label.innerHTML = this.title;
		this.listInstance.saveToStorage();
	}
}

TodoItem.prototype.cancelEditHandler = function(e){
	removeClass(this.element, 'editing');
}

TodoItem.prototype.deleteHandler = function(e){
	this.element.remove();
}

TodoItem.prototype.toggle = function(){
	this.done = !this.done;
	this.listInstance.updateStats();
}

TodoItem.prototype.render = function(){
	return "\
		<div class='view'>\
			<input class='toggle' type='checkbox'>\
			<label>"+this.title+"</label>\
			<button class='destroy'></button>\
		</div>\
		<input class='edit' value='"+this.title+"'>\
	";
}

var todoList1 = new TodoList('todoList1');

/*
todoList1.addItem(new TodoItem('first todo'));
todoList1.addItem(new TodoItem('2 todo'));
todoList1.addItem(new TodoItem('3 todo'));

console.log(todoList1.items);*/
