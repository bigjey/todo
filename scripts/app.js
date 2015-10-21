'use strict';

var globalId = 0,
    keys = {
      ENTER: 13,
      ESC: 27
    };


// TodoList
function TodoList(container){
  this.el = container;
  this.items = [];

  this.init();

}

TodoList.prototype.init = function(){

  this.list = this.el.querySelector('.todo-list');

  this.getFromStorage();
  
  this.addAll();

  this.main = this.el.querySelector('.main');
  this.footer = this.el.querySelector('.footer');
  
  this.toggleAllInput = this.el.querySelector('input.toggle-all');
  this.newItemInput = this.el.querySelector('input.new-todo');
  this.todoCount = this.el.querySelector('.todo-count');
  this.clearCompletedButton = this.el.querySelector('button.clear-completed');
  this.filter = this.el.querySelector('.filters');
  this.filters = this.el.querySelector('.filters a');

  this.update();

  this.bindEvents();
}

TodoList.prototype.update = function(){
  
  this.main.style.display = this.items.length ? 'block' : 'none';
  this.footer.style.display = this.items.length ? 'block' : 'none';
  
  this.updateFooter();
  this.checkToggleAllInput();
}

TodoList.prototype.bindEvents = function(){
  this.newItemInput.addEventListener('keydown', this.newItemHandler.bind(this));
  this.toggleAllInput.addEventListener('change', this.toggleAllHandler.bind(this));
  this.clearCompletedButton.addEventListener('click', this.clearCompletedHandler.bind(this));

  window.addEventListener('load', this.applyFilter.bind(this));
  window.addEventListener('hashchange', this.applyFilter.bind(this));
}

TodoList.prototype.applyFilter = function(){
  var hash = window.location.hash || '#/',
      self = this;

  var selected = this.filter.querySelector('a.selected'); 
  if (selected)
    removeClass(selected, 'selected');
  
  var newSelected = this.filter.querySelector('a[href="'+hash+'"]');
  if (newSelected){
    addClass(newSelected, 'selected');
  }

  switch(hash){
    case '#/':
      foreach(self.items, function(item){
        removeClass(item.element, 'hidden');
      })
      break;
    case '#/active':
      foreach(self.items, function(item){
        if (!item.done)
          removeClass(item.element, 'hidden');
        else
          addClass(item.element, 'hidden');
      })
      break;
    case '#/completed':
      foreach(self.items, function(item){
        if (item.done)
          removeClass(item.element, 'hidden');
        else
          addClass(item.element, 'hidden');
      })
      break;
    default:
      console.log('unknown route, use one of #/, #/active, #/completed');
  }

  self.update();
  
}

TodoList.prototype.newItemHandler = function(e){
  var input = e.currentTarget;
  if (e.keyCode == keys.ENTER){
    if (input.value == '') return;
    this.addItem(new TodoItem(input.value));
    this.saveToStorage();
    input.value = '';
    this.update();
    this.saveToStorage();
  }
  this.applyFilter();
}

TodoList.prototype.toggleAllHandler = function(e){
  var input = e.currentTarget,
      newStatus = input.checked;

  foreach(this.items, function(item, i){
    if (!hasClass(item.element, 'hidden')){
      item.setStatus(newStatus);
    }
  })

  this.applyFilter();
}

TodoList.prototype.clearCompletedHandler = function(e){
  var self = this;  
  for(var i = 0; i < self.items.length; i++){
    var item = self.items[i];
    if (item.done){
      self.removeItem(item);
      i--;
    }
  }
}

TodoList.prototype.checkToggleAllInput = function(){
  this.toggleAllInput.checked = this.getDoneCount() == this.getVisibleCount() && this.getVisibleCount() != 0;
}

TodoList.prototype.getDoneCount = function(){
  var count = 0;
  foreach(this.items, function(item, i){
    if (item.done) count++;
  })
  return count;
}

TodoList.prototype.getVisibleCount = function(){
  var count = 0;
  foreach(this.items, function(item, i){
    if (!hasClass(item.element, 'hidden')) count++;
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

  this.listInstance.applyFilter();
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

foreach(document.querySelectorAll('[data-todo-list]'), function(container){
  new TodoList(container);
})