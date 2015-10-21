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

  this.toggleAllInput = this.el.querySelector('input.toggle-all');
  this.newItemInput = this.el.querySelector('input.new-todo');
  this.todoCount = this.el.querySelector('.todo-count');
  this.clearCompletedButton = this.el.querySelector('button.clear-completed');

  this.update();

  this.bindEvents();
}

TodoList.prototype.update = function(){
  this.updateFooter();
  this.checkToggleAllInput();
}

TodoList.prototype.bindEvents = function(){
  this.newItemInput.addEventListener('keydown', this.newItemHandler.bind(this));
  this.toggleAllInput.addEventListener('change', this.toggleAllHandler.bind(this));
  this.clearCompletedButton.addEventListener('click', this.clearCompletedHandler.bind(this));
}

TodoList.prototype.newItemHandler = function(e){
  var input = e.currentTarget;
  if (e.keyCode == keys.ENTER){
    this.addItem(new TodoItem(input.value));
    this.saveToStorage();
    input.value = '';
    this.update();
    this.saveToStorage();
  }
}

TodoList.prototype.toggleAllHandler = function(e){
  var input = e.currentTarget,
      newStatus = input.checked;

  foreach(this.items, function(item, i){
    item.setStatus(newStatus);
  })
}

TodoList.prototype.clearCompletedHandler = function(e){
  var self = this;
  console.log(self.items.length, self.items);
  foreach(this.items, function(item, i){
    if (item.done){
      self.removeItem(item);
      console.log(self.items.length, i, self.items);
    }
  })
}

TodoList.prototype.checkToggleAllInput = function(){
  this.toggleAllInput.checked = this.getDoneCount() == this.items.length;
}

TodoList.prototype.getDoneCount = function(){
  var count = 0;
  foreach(this.items, function(item, i){
    if (item.done) count++;
  })
  return count;
}

TodoList.prototype.addItem = function(item){
  this.items.push(item);
  this.list.appendChild(item.element);
  item.listInstance = this;
}

TodoList.prototype.removeItem = function(item){
  var index = this.items.indexOf(item);
  console.log(index + ' to remove');
  this.items.splice(index, 1);
  item.element.remove();
  this.update();
  this.saveToStorage();

}

TodoList.prototype.addAll = function(){
  var self = this;
  foreach(this.items, function(el, i){
    self.list.appendChild(el.element);

  })
}

TodoList.prototype.updateFooter = function(){
  var done = this.getDoneCount(),
      left = this.items.length - done;

  this.todoCount.innerHTML = left + ' to go';
  this.todoCount.style.display = left == 0 ? 'none' : 'block';
  this.clearCompletedButton.style.display = done == 0 ? 'none' : 'block';


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
    var todoItem = new TodoItem(item.title, item.done);
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
function TodoItem(title, done){

  this.title = title || 'new todo';
  this.done = done || false;
  this.id = ++globalId;

  this.init();
}

TodoItem.prototype.init = function(){
  this.element = document.createElement('li');

  this.element.innerHTML += this.render();

  this.toggleInput = this.element.querySelector('input.toggle');
  this.editInput = this.element.querySelector('input.edit');
  this.label = this.element.querySelector('.view label');
  this.destroyButton = this.element.querySelector('.destroy');

  this.bindEvents();
}

TodoItem.prototype.bindEvents = function(){
  this.toggleInput.addEventListener('change', this.toggleHandler.bind(this));
  this.destroyButton.addEventListener('click', this.deleteHandler.bind(this));
  this.label.addEventListener('dblclick', this.startEditHandler.bind(this));
  this.editInput.addEventListener('keydown', this.endEditHandler.bind(this));
  this.editInput.addEventListener('blur', this.cancelEditHandler.bind(this));
}

TodoItem.prototype.toggleHandler = function(e){
  this.toggle();
}

TodoItem.prototype.startEditHandler = function(e){
  addClass(this.element, 'editing');
  this.editInput.focus();
  this.editInput.value = this.title;
}

TodoItem.prototype.endEditHandler = function(e){

  if (e.keyCode == keys.ESC){
    removeClass(this.element, 'editing');
  }
  if (e.keyCode == keys.ENTER){
    this.title = this.editInput.value;
    removeClass(this.element, 'editing');
    this.label.innerHTML = this.title;
    this.listInstance.saveToStorage();
  }
}

TodoItem.prototype.cancelEditHandler = function(e){
  removeClass(this.element, 'editing');
}

TodoItem.prototype.deleteHandler = function(e){
  this.listInstance.removeItem(this);
}

TodoItem.prototype.toggle = function(){
  this.setStatus(!this.done);
}

TodoItem.prototype.setStatus = function(newStatus){
  if (this.done == newStatus) return;

  this.done = newStatus;
  this.toggleInput.checked = this.done;

  this.listInstance.update();
  this.listInstance.saveToStorage();
}

TodoItem.prototype.render = function(){
  return "\
    <div class='view'>\
      <input class='toggle' type='checkbox' "+(this.done ? 'checked' : '')+">\
      <label>"+this.title+"</label>\
      <button class='destroy'></button>\
    </div>\
    <input class='edit' value='"+this.title+"'>\
  ";
}

var todoList1 = new TodoList('todoList1');
