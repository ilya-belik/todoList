'use strict';

/*
  task = {
    date: '',
    done: '',
    value: '',
    removed: true/false
  }
*/

// HTML tasks container
const tasksContainer = document.querySelector('.tasks-list-js');

let tasksList = [];


// Adds the ability to get the month as text
Date.prototype.monthNames = [
  "January", "February", "March",
  "April", "May", "June",
  "July", "August", "September",
  "October", "November", "December"
];

// Full month name
Date.prototype.getMonthName = function() {
  return this.monthNames[this.getMonth()];
};

// Abbreviated month name
Date.prototype.getShortMonthName = function() {
  return this.getMonthName().substr(0, 3);
};
// ===============================




// Creates a unique id
const randomId = () => {
  let id = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < 20; i++)
    id += possible.charAt(Math.floor(Math.random() * possible.length));

  return id;
};
// ===============================

// Создает html элемент задания
const createTaskHtmlElement = (task, key) => {
  const taskContainer = document.createElement('li'),
        inputId = randomId(),
        taskDone = task.done,
        taskChecked = taskDone ? 'checked' : '';

  taskContainer.classList.add('tasks-list__task', 'task-js', 'zoomIn');
  taskContainer.setAttribute('data-taskKey', `${key}`);

  if(taskDone){
    taskContainer.classList.add('complete');
  }

  const taskLayout = `
    <div class="tasks-list__task-header">
      <div class="tasks-list__task-control-left">
        <div class="tasks-list__complete-checkbox-control">
          <input type="checkbox" id="${inputId}" class="tasks-list__complete-checkbox complete-task-js" ${taskChecked}>
          <label for="${inputId}" class="tasks-list__complete-label"></label>
        </div>
        <div class="tasks-list__date">
          <p>${task.date}</p>
        </div>
      </div>
      <div class="tasks-list__task-control-right">
        <button class="tasks-list__task-edit edit-task-js"></button>
        <button class="tasks-list__task-done-edit save-task-js"></button>
        <button class="tasks-list__task-delete delete-task-js"></button>
      </div>
    </div>
    <div class="tasks-list__task-body">
      <form class="tasks-list__task-form">
        <textarea class="tasks-list__task-field field-task-js" rows="1" disabled>${task.value}</textarea>
      </form>
    </div>
  `;

  taskContainer.innerHTML = taskLayout;

  return taskContainer;
};
// ===============================

// Валидация пустых записей
const emptyTaskFieldValidation = () => {
  const tasksItems = document.querySelectorAll(`.task-js`), // Псоледний элемент задания в 
    lastTaskItem = tasksItems[tasksItems.length - 1],
    lastTaskField = lastTaskItem.querySelector('.field-task-js');

  let validation = true;
 

  /*
  // Удаляет все пустые задания кроме последнего
  tasksItems.forEach((taskItem, index) => {
    const taskField = taskItem.querySelector('.field-task-js');

    if(taskField.value.length === 0 && index !== tasksItems.length - 1){
      deleteTask({
        taskHtmlElement: taskItem,
        taskKey: index
      })
    }
  });
  
  */

  // Если последнее задание  пустое - не рендрит новове
  if(lastTaskField.value.length === 0){

    // Анимация пустого задания 
    lastTaskItem.classList.remove('warning', 'zoomIn');

    setTimeout(() => {
      lastTaskItem.classList.add('warning');
      editTask({
        taskHtmlElement: lastTaskItem
      });
    }, 0);

    validation = false;
  }

  return validation;
}


// Создать новое задание
const createNewTask = () => {

  // Если последне задание пустое
  if(!emptyTaskFieldValidation())
    return false;
  

  const todayDate = new Date(),
    taskData = {
      date: `${todayDate.getDate()} ${todayDate.getShortMonthName()} ${todayDate.getFullYear()}`,
      done: false,
      value: ''
    },
    taskHtml = createTaskHtmlElement(taskData, tasksList.length);
  
  // Рендерит задание в HTML 
  renderTaskInHtml(taskHtml);

  // Прокручивает страницу к заданию
  window.scrollTo(0, document.body.scrollHeight);

  // Добавляет в массив заданий
  tasksList.push(taskData);
  
  // Рендер статистики заданий
  renderStatistics();
  
  // Дает возможность юзеру сразу редактировать задание
  setTimeout(() => {
    editTask({
      taskHtmlElement: taskHtml
    });
  }, 0);
}

const createTaskBtns = document.querySelectorAll('.create-task-js');
createTaskBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    createNewTask();
  });
});
// ===============================


// Рендерит задание в HTML
const renderTaskInHtml = (task) => {
  tasksContainer.appendChild(task);
};

// Добавляет атрибут disabled к textarea из taskHtmlElement
const disabledTaskField = (taskHtmlElement, state) => {
  const taskField = taskHtmlElement.querySelector('.field-task-js');

  switch (state){
    case true: 
      taskField.setAttribute('disabled', 'disabled');
      break;

    default: 
      taskField.removeAttribute('disabled');
      break;
  }
  
};

// Удалить задание
const deleteTask = ({taskHtmlElement, taskKey}) => {
  // Добавление класса для анимации удаления
  taskHtmlElement.classList.add('delete');

  // Добавляет совйство removed к элементу что бы не рендерить каждый раз список заново
  tasksList[taskKey].removed = true;

  // Сбрасывает значения элемента 
  tasksList[taskKey].value = '';
  
  // Задержка удаления элемента из DOM на время анимации
  setTimeout(() => {
    // Удаляет элемент задания из DOM
    taskHtmlElement.remove();
  }, 500);
}

// Закончить задание
const completeTask = ({taskHtmlElement, taskKey}) => {

  // Добавляет класс для стилей выполненного задания
  taskHtmlElement.classList.toggle('complete');

  // Записыет значение checkbox (true/false) в tasksList
  tasksList[taskKey].done = !tasksList[taskKey].done;
};

// Сохранить задание
const saveTask = ({taskHtmlElement, taskKey}) => {
  const taskValue = taskHtmlElement.querySelector('.field-task-js').value;

  // Записывает текст задания в tasksList
  tasksList[taskKey].value = taskValue;

  // Удаляет класс для стилей редактируемого задания
  taskHtmlElement.classList.remove('active');

  // Добавляет атрибут disabled к textarea
  disabledTaskField(taskHtmlElement, true);
}

// Редактировать задание
const editTask = ({taskHtmlElement}) => {
  taskHtmlElement.classList.add('active');
  disabledTaskField(taskHtmlElement, false);

  taskHtmlElement.querySelector('.field-task-js').focus();
}

// Рендер статистики заданий 
// вызывается в функциях: taskActions, createNewTask
const renderStatistics = () =>{

  // Убирает из массива tasksList удаленные элементы
  const list = tasksList.filter((task) => {
    return !task.removed;
  });

  let scoupe = list.length,
    active = 0,
    successful = 0;
  
  const scoupeElem = document.querySelector('.scoupe-count-tasks-js'),
    activeElem = document.querySelector('.active-count-tasks-js'),
    successfulElem = document.querySelector('.successful-count-tasks-js');

  list.forEach(task => {
    switch (task.done){
      case true: 
        successful++;
        break;
      
      default: 
        active++;
        break;
    }
  });

  scoupeElem.innerHTML = scoupe;
  activeElem.innerHTML = active;
  successfulElem.innerHTML = successful;

  // Если длина массива с заданиями (list) === 0 - рендерить приветствие. Если нет - удаляет 
  switch (list.length){
    case 0: 
      taskListIsEmpty(true);
      break;
    
    default: 
      taskListIsEmpty(false);
      break;
  } 
}

// Удаление активного класса у задания при клике вне его пределов
const resetActiveTask = (target) => {
  if(!target.classList.contains('field-task-js')){
    const taskItem = document.querySelector('.task-js.active'); 

    

    if(taskItem){
      const taskKey = taskItem.getAttribute('data-taskkey'),
        props = {
          taskHtmlElement: taskItem,
          taskKey: taskKey
        };
      
      saveTask(props);
      saveTasksList();
    }
  
  }
}

// Функция определяет по какому элементу был клик и вызывает соответствующий callback
const taskActions = (target) => {
  const targetTag = target.tagName.toLowerCase(),
    callbacksList = {
      'edit-task-js': (props) => editTask(props),
      'delete-task-js': (props) => {
        deleteTask(props);
        
        // Сохранение значения tasksList
        saveTasksList();
      },
      'save-task-js': (props) => {
        saveTask(props)
        
        // Сохранение значения tasksList
        saveTasksList();
      },
      'complete-task-js': (props) => {
        completeTask(props);
        
        // Сохранение значения tasksList
        saveTasksList();
      }
    };
  
  // Если имя тега не проходит по условию - код дальше не выполняется
  if( targetTag === 'button' ||
      targetTag === 'input' ||
      targetTag === 'form' 
     ){
    
    for(const key in callbacksList){
      const callback = callbacksList[key];
        
      if(target.classList.contains(key)){
        const taskHtmlElement = target.closest('.task-js'),
          taskKey = taskHtmlElement.getAttribute('data-taskkey');
        
        // console.log(taskKey);

        callback({taskHtmlElement, taskKey, target});
      }
        
    }

    // Обновление статистики
    renderStatistics();
  } 
};


// Общий listener на click для родителя заданий
document.body.addEventListener('click', (event) => {
  const target = event.target;

  // Удаление активного класса у задания при клике вне его пределов
  resetActiveTask(target)

  taskActions(target);
});

// Общий listener на keyup для родителя заданий
tasksContainer.addEventListener('keyup', (event) => {
  const target = event.target;

  // Растягивает Textarea по высоте
  if(target.classList.contains('field-task-js'))
    resizeTextarea(target);
});



// Выводит уведомление если список заданий пуст
const taskListIsEmpty = (state) => {
  if(state){
    const tasksEmtyItem = document.createElement('li');
    tasksEmtyItem.classList.add('todo__empty', 'zoomIn');
    tasksEmtyItem.innerHTML = `
      <h2>
        <strong>Welcome</strong> 👋 <br>
        Create your first task
      </h2>
    `;
    
    renderTaskInHtml(tasksEmtyItem);
  }
  else{
    const tasksEmtyItem = document.querySelector('.todo__empty');

    if(tasksEmtyItem)
      tasksEmtyItem.remove();
  }
  
};

// Растянуть textarea по высоте текста
const resizeTextarea = (element) => {
  setTimeout(() => {
    element.style.cssText = "height:auto;";

    const height = element.scrollHeight + 2;

    element.style.cssText = "height:" + height + "px";
  }, 0);
};


// ==============================
// Работа с api

// Отправляет список заданий на API
const saveTasksList = () => {
  const tasksListForSave = tasksList.filter((task) => {
    return task.value.length !== 0;
  });
  
  console.log(tasksListForSave);
}

// Запрос заданий с API при перезагрузке страницы
const renderTasksApi = (() => {
  fetch('../tasks.json')
  .then((response) => {
    return response.json();
  })
  .then((data) => {

    // Если задания есть в ответе
    if(data.length !== 0){

      tasksList = data;

      tasksList.forEach((taskData, index) => {

        // Создает HTML задания 
        const taskHtml = createTaskHtmlElement(taskData, index);
    
        // Рендерит задание в HTML 
        renderTaskInHtml(taskHtml);

        // Рендер статистики
        renderStatistics();
      });
    }else{

      // Если в ответе заданий нет - рендерит уведимление
      taskListIsEmpty(true);
    }
  });
})(); 