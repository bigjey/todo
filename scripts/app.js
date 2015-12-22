'use strict';

var keys = {
  ENTER: 13,
  ESC: 27
};

// TodoList
function TodoList(container){

  this.el = container;

  this.items = [];

  this.globalID = 0;

  this.init();

}

TodoList.prototype.init = function(){
  
  this.list = this.el.querySelector('.todo-list');

  this.main = this.el.querySelector('.main');  
  this.footer = this.el.querySelector('.footer');
  
  this.toggleAllInput = this.el.querySelector('input.toggle-all');
  this.newItemInput = this.el.querySelector('input.new-todo');
  this.todoCount = this.el.querySelector('.todo-count');
  this.clearCompletedButton = this.el.querySelector('button.clear-completed');
  this.filter = this.el.querySelector('.filters');
  this.filters = this.el.querySelector('.filters a');

  this.bindEvents();

  this.fill();

  this.render();

}

TodoList.prototype.findItemById = function(id){
  var searchItem = null;
  var id = parseInt(id);
  for(var i = 0, l = this.items.length; i < l; i++){
    if (this.items[i].id === id){
      searchItem = this.items[i];
      break;
    }
  }
  return searchItem;
}

TodoList.prototype.nextID = function(){
  return ++this.globalID;
}

TodoList.prototype.bindEvents = function(){

  this.newItemInput.addEventListener('keydown', this.newItemHandler.bind(this));
  this.toggleAllInput.addEventListener('change', this.toggleAllHandler.bind(this));
  this.clearCompletedButton.addEventListener('click', this.clearCompletedHandler.bind(this));

  window.addEventListener('load', this.applyFilter.bind(this));
  window.addEventListener('hashchange', this.applyFilter.bind(this));

  this.list.addEventListener('change', this.itemChangeEventHandler.bind(this));
  this.list.addEventListener('click', this.itemClickEventHandler.bind(this));
  this.list.addEventListener('dblclick', this.itemDblclickEventHandler.bind(this));
  this.list.addEventListener('keydown', this.itemKeydownEventHandler.bind(this));
  this.list.addEventListener('blur', this.itemBlurEventHandler.bind(this), true);

}

TodoList.prototype.itemChangeEventHandler = function(e){

  var target = e.target;

  if (helpers.hasClass(target, 'todo-item-toggle')){
    var id = target.getAttribute('data-id');
    var todoItem = this.findItemById(id);

    todoItem.toggle();
  }
  
}

TodoList.prototype.itemClickEventHandler = function(e){

  var target = e.target;

  if (helpers.hasClass(target, 'todo-item-destroy')){
    
    var id = target.getAttribute('data-id');
    var todoItem = this.findItemById(id);

    this.removeItem(todoItem);

    this.render();
    this.save();
  }  
}

TodoList.prototype.itemDblclickEventHandler = function(e){

  var target = e.target;

  if (helpers.hasClass(target, 'todo-item-label')){
    var id = target.getAttribute('data-id');
    var todoItem = this.findItemById(id);

    helpers.addClass(todoItem.element, 'editing');
    todoItem.editInput.focus();
    todoItem.editInput.value = todoItem.title;
  }
  
}

TodoList.prototype.itemKeydownEventHandler = function(e){

  var target = e.target;

  if (helpers.hasClass(target, 'todo-item-edit')){
    
    var id = target.getAttribute('data-id');
    var todoItem = this.findItemById(id);

    if (e.keyCode == keys.ESC){
      helpers.removeClass(todoItem.element, 'editing');
    }
    if (e.keyCode == keys.ENTER){
      
      helpers.removeClass(todoItem.element, 'editing');

      todoItem.title = todoItem.editInput.value;
      todoItem.label.innerHTML = todoItem.title;

      this.save();
    }
  }
  
}

TodoList.prototype.itemBlurEventHandler = function(e){

  var target = e.target;

  if (helpers.hasClass(target, 'todo-item-edit')){
    
    var id = target.getAttribute('data-id');
    var todoItem = this.findItemById(id);

    helpers.removeClass(todoItem.element, 'editing');
  }

}

TodoList.prototype.fill = function(){
  var self = this;
  var items = this.fetch();  
  var maxId = 0;
  if (items){
    items.forEach(function(item){
      if (item.id > maxId) maxId = item.id;
      var todoItem = new TodoItem(item.title, item.done, item.id);
      self.addItem(todoItem);
    })
    
    this.globalID = maxId;
    
  }  
}

TodoList.prototype.render = function(){
  
  this.main.style.display = this.items.length ? 'block' : 'none';
  this.footer.style.display = this.items.length ? 'block' : 'none';
  
  this.toggleAllInput.checked = this.getDoneCount() == this.getVisibleCount() && this.getVisibleCount() != 0;
  
  var done = this.getDoneCount();
  var left = this.items.length - done;

  this.todoCount.innerHTML = left + ' to go';
  this.todoCount.style.display = left == 0 ? 'none' : 'block';

  this.clearCompletedButton.style.display = done == 0 ? 'none' : 'block';

}

TodoList.prototype.applyFilter = function(){
  
  var self = this;
  var hash = window.location.hash || '#/';

  var selected = this.filter.querySelector('a.selected'); 
  if (selected)
    helpers.removeClass(selected, 'selected');
  
  var newSelected = this.filter.querySelector('a[href="'+hash+'"]');
  if (newSelected){
    helpers.addClass(newSelected, 'selected');
  }

  switch(hash){
    case '#/':
      self.items.forEach(function(item){
        helpers.removeClass(item.element, 'hidden');
      })
      break;
    case '#/active':
      self.items.forEach(function(item){
        if (!item.done)
          helpers.removeClass(item.element, 'hidden');
        else
          helpers.addClass(item.element, 'hidden');
      })
      break;
    case '#/completed':
      self.items.forEach(function(item){
        if (item.done)
          helpers.removeClass(item.element, 'hidden');
        else
          helpers.addClass(item.element, 'hidden');
      })
      break;
    default:
      console.log('unknown route, use one of #/, #/active, #/completed');
  }

  self.render();
  
}

TodoList.prototype.newItemHandler = function(e){
  var input = e.currentTarget;
  if (e.keyCode == keys.ENTER){
    if (input.value == '') return;
    
    this.addItem(new TodoItem(input.value, false, this.nextID(0)));    
    input.value = '';

    this.render();
    this.save();

    this.applyFilter();
  }
}

TodoList.prototype.toggleAllHandler = function(e){
  var input = e.currentTarget;
  var newStatus = input.checked;


  this.items.forEach(function(item){
    if (!helpers.hasClass(item.element, 'hidden')){
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

  this.render();
  this.save();
}

TodoList.prototype.getDoneCount = function(){
  var count = 0;
  this.items.forEach(function(item){
    if (item.done) count++;
  })
  return count;
}

TodoList.prototype.getVisibleCount = function(){

  var count = 0;  
  this.items.forEach(function(item){
    if (!helpers.hasClass(item.element, 'hidden')) count++;
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

  var li = item.element;
  var ul = li.parentNode;  

  ul.removeChild(li);

}

TodoList.prototype.save = function(){
  localStorage['todos'] = JSON.stringify(this.serialize());
}

TodoList.prototype.fetch = function(){
  
  var self = this;
  var items = [];

  if (typeof localStorage['todos'] !== "undefined")
    items = JSON.parse(localStorage['todos']);

  return items;
}

TodoList.prototype.serialize = function(){
  var items = [];
  this.items.forEach(function(item){
    items.push({
      title: item.title,
      done: item.done,
      id: item.id
    })
  })
  return items;
}


// TodoItem
function TodoItem(title, done, id){

  this.title = title || 'new todo';
  this.done = done || false;  
  this.id = id || 0;

  this.init();
}

TodoItem.prototype.init = function(){
  
  this.element = document.createElement('li');
  this.element.setAttribute('id', 'todo-item-'+this.id);

  this.element.innerHTML += this.getHTML();

  this.toggleInput = this.element.querySelector('input.toggle');
  this.editInput = this.element.querySelector('input.edit');
  this.label = this.element.querySelector('.view label');


}

TodoItem.prototype.toggle = function(){
  this.setStatus(!this.done);
}

TodoItem.prototype.setStatus = function(newStatus){
  if (this.done == newStatus) return;

  this.done = newStatus;
  this.toggleInput.checked = this.done;

  this.listInstance.applyFilter();
  this.listInstance.save();
}

TodoItem.prototype.getHTML = function(){
  return "\
    <div class='view'>\
      <input class='toggle todo-item-toggle' data-id='"+this.id+"' type='checkbox' "+(this.done ? 'checked' : '')+">\
      <label class='todo-item-label' data-id='"+this.id+"'>"+this.title+"</label>\
      <button class='destroy todo-item-destroy' data-id='"+this.id+"'></button>\
    </div>\
    <input class='edit todo-item-edit' data-id='"+this.id+"' value='"+this.title+"'>\
  ";
}


var todos = new TodoList(document.getElementById('todo-app'));