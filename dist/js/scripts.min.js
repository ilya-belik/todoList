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

let tasksList;


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

// Creates an html task element
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

// Validating empty tasks
const emptyTaskFieldValidation = () => {
  const tasksItems = document.querySelectorAll(`.task-js`), 
    lastTaskItem = tasksItems[tasksItems.length - 1], // The last element of the task
    lastTaskField = lastTaskItem.querySelector('.field-task-js');

  let validation = true;
 

  /*
  // Removes all empty tasks except the last one
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

  // If the last task is empty
  if(lastTaskField.value.length === 0){

    // Empty task animation
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


// Create a new task
const createNewTask = () => {
  
  // Если последне задание пустое
  if(tasksList.length !== 0){
    const lastTaskFieldCheck = emptyTaskFieldValidation();

    if(!lastTaskFieldCheck)
      return false;
  }
    
  
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


// Renders the task in HTML
const renderTaskInHtml = (task) => {
  tasksContainer.appendChild(task);
};

// Adds disabled attribute to textarea from taskHtmlElement
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

// Delete task
const deleteTask = ({taskHtmlElement, taskKey}) => {
  // Adding a class for animation deletion
  taskHtmlElement.classList.add('delete');

  // Adds the removed property to the element so that the list does not have to be rendered every time
  tasksList[taskKey].removed = true;

  // Resets the text of the task in the tasksList array
  tasksList[taskKey].value = '';
  
  // Delay removal of an element from the DOM for the duration of the animation
  setTimeout(() => {

    //Removes a task element from the DOM
    taskHtmlElement.remove();

  }, 500);
}

// Complete  the task
const completeTask = ({taskHtmlElement, taskKey}) => {

  // Adds a class for the css of the completed assignment
  taskHtmlElement.classList.toggle('complete');

  // Writes the checkbox value (true / false) to tasksList
  tasksList[taskKey].done = !tasksList[taskKey].done;
};

// Save task
const saveTask = ({taskHtmlElement, taskKey}) => {
  const taskValue = taskHtmlElement.querySelector('.field-task-js').value;

  // Writes the text of the task to array tasksList
  tasksList[taskKey].value = taskValue;

  // Removes the class for the styles of the edited task
  taskHtmlElement.classList.remove('active');

  // Adds the disabled attribute to textarea
  disabledTaskField(taskHtmlElement, true);
}

// Edit task
const editTask = ({taskHtmlElement}) => {
  taskHtmlElement.classList.add('active');
  disabledTaskField(taskHtmlElement, false);

  taskHtmlElement.querySelector('.field-task-js').focus();
}

// Rendering tasks statistics
// Called in functions: taskActions, createNewTask
const renderStatistics = () =>{

  // Removes deleted elements from the tasksList array
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

  // If the length of the array with tasks (list) === 0 - render a greeting. If not, deletes
  switch (list.length){
    case 0: 
      taskListIsEmpty(true);
      break;
    
    default: 
      taskListIsEmpty(false);
      break;
  } 
}

// Removing the active class from a task when clicking outside of its limits
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

// The function determines which element was clicked and calls the corresponding callback
const taskActions = (target) => {
  const targetTag = target.tagName.toLowerCase(),
    callbacksList = {
      'edit-task-js': (props) => editTask(props),
      'delete-task-js': (props) => {
        deleteTask(props);
        saveTasksList();
      },
      'save-task-js': (props) => {
        saveTask(props)
        saveTasksList();
      },
      'complete-task-js': (props) => {
        completeTask(props);
        saveTasksList();
      }
    };
  
  // If the tag name does not match the condition, the code is not executed further
  if( targetTag === 'button' ||
      targetTag === 'input' ||
      targetTag === 'form' 
     ){
    
    for(const key in callbacksList){
      const callback = callbacksList[key];
        
      if(target.classList.contains(key)){
        const taskHtmlElement = target.closest('.task-js'),
          taskKey = taskHtmlElement.getAttribute('data-taskkey');
        
        callback({taskHtmlElement, taskKey, target});
      }
        
    }

    // Обновление статистики
    renderStatistics();
  } 
};


// Common  listener on click for parent of tasks
document.body.addEventListener('click', (event) => {
  const target = event.target;

  // Removing the active class from a task when clicking outside of its limits
  resetActiveTask(target)

  taskActions(target);
});

// Common  listener on keyup for parent of tasks
tasksContainer.addEventListener('keyup', (event) => {
  const target = event.target;

  // Resize Textarea
  if(target.classList.contains('field-task-js'))
    resizeTextarea(target);
});



// Displays a notification if the list of tasks is empty
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

// Сhange textarea height to text height
const resizeTextarea = (element) => {
  setTimeout(() => {
    element.style.cssText = "height:auto;";

    const height = element.scrollHeight + 2;

    element.style.cssText = "height:" + height + "px";
  }, 0);
};


// ==============================
// Working with api

// Sends a list of tasks to the API
const saveTasksList = () => {
  const tasksListForSave = tasksList.filter((task) => {
    return task.value.length !== 0;
  });
  
  setCookie('tasksList', JSON.stringify(tasksListForSave));

  // In development
  // fetch("https://work.ilya-belichenko.icu/todo/api", {
  //   method: 'post',
  //   headers: {
  //     "Content-type": "application/json; charset=UTF-8"
  //   },
  //   body: JSON.stringify(tasksListForSave) 
  
  // }).then(response => response.json()) 
  //   .then(res => console.log(res))
  //   .catch(function(err) {
      
  //     console.error(err);
  // });
  // console.log(tasksListForSave);

}

// Creating a cookie with an array of tasks
const renderTasksApi = (() => {
  const savedTaskList = getCookie('tasksList');
  tasksList = savedTaskList ? JSON.parse(savedTaskList) : [];

  if(tasksList.length !== 0){

    const tasksList = JSON.parse(getCookie('tasksList'));
    
    tasksList.forEach((taskData, index) => {

      // Creates HTML task
      const taskHtml = createTaskHtmlElement(taskData, index);
      resizeTextarea(taskHtml.querySelector('.field-task-js'));
  
      // Renders the task in HTML 
      renderTaskInHtml(taskHtml);
    });
  }

  // Rendering statistics
  renderStatistics();

})(); 


// ==============================
// Working with cookies

// Get cookie value

function getCookie(name) {
	let matches = document.cookie.match(
		new RegExp(
			"(?:^|; )" +
			name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") +
			"=([^;]*)"
		)
	);

	// returns a cookie with the specified name, or undefined if nothing was found

	return matches ? decodeURIComponent(matches[1]) : undefined;
}
// getCookie('name')

// Create cookie
function setCookie(name, value, options = {}) {
	options = {
		path: "/",
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie =
		encodeURIComponent(name) + "=" + encodeURIComponent(value);

	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}

	document.cookie = updatedCookie;
}
// setCookie('user', 'John', {secure: true, 'max-age': 3600});