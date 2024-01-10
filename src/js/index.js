const button = document.getElementById('addButton');
const taskElementsList = document.getElementsByClassName('task');

window.onload = () => {
    initialUISetUp();
    initialStorageSetUp();
};

const initialUISetUp = () => {
    document.getElementById('search').addEventListener('mouseover', () => {
        addClassWithTimeOut('searchLabel', 'hovered', 500)
    });
    document.getElementById('search').addEventListener('mouseout', () => {
        removeClassWithTimeOut('searchLabel', 'hovered', 500)
    });
    document.getElementById('search').addEventListener('keyup', event => {
        searchInputHandler(event)
    });
    document.getElementById('addTaskInput').addEventListener('keyup', (event) => {
        validateField(event)
    });
    document.getElementById('addButton').addEventListener('click', addNewTask);

    restoreTask('taskList', stringConstants.localStorageKey);
    restoreTask('doneTaskList', stringConstants.localStorageDoneKey);
    
    radioHandlerSetUp();
};

const addClassWithTimeOut = (id, className, timeout) => {
    setTimeout(() => {
        document.getElementById(id).classList.add(className)
    }, timeout)
};

const removeClassWithTimeOut = (id, className, timeout) => {
    setTimeout(() => {
        document.getElementById(id).classList.remove(className)
    }, timeout)
};

const addClassWithoutTimeout = (id, className) => {
    document.getElementById(id).classList.add(className)
};

const removeClassWithoutTimeout = (id, className) => {
    document.getElementById(id).classList.remove(className)
};

const validateField = (event) => {
    if(event.target.value.length > 0){
        enableAddTaskButton();
    } else {
        disableAddTaskButton();
    }

    if(event.key === 'Enter' || event.keyCode === 13){
        addNewTask();
    }
};

const disableAddTaskButton = () => {
    removeClassWithTimeOut('addButton', 'valid');
    button.setAttribute('disabled', '')
};

const enableAddTaskButton = () => {
    addClassWithoutTimeout('addButton', 'valid');
    button.removeAttribute('disabled')
};

const addNewTask = () => {
    const inputElement = document.getElementById('addTaskInput');
    const taskWrapper = document.createElement('div');
    const id = generateId();
    taskWrapper.innerHTML = getTaskTemplate(inputElement.value, id).trim();
    document.getElementById('taskList').append(taskWrapper.firstChild);
    addTaskToStorage({id: id, value: inputElement.value}, stringConstants.localStorageKey);
    inputElement.value = '';
    disableAddTaskButton();
    document.getElementById(id).addEventListener('click', event => onRadioClick(event))
};

const restoreTask = (element, key) => {
    const taskList = getTasksFromStorage(key);
    // console.log("taskList --->", taskList)
    const taskListTemplates = taskList.map(task => getTaskTemplate(task.value, task.id).trim());
    const documentFragment = document.createDocumentFragment();
    const taskWrapper = document.createElement('div');
    for(const task of taskListTemplates){
        taskWrapper.innerHTML = task;
        documentFragment.append(taskWrapper.firstChild)
    };
    document.getElementById(element).append(documentFragment);
};

const changeTaskStatus = (id) => {
  const taskElement = document.getElementById(id);
  const storageKey = getTaskStorageLocation(id);
  taskElement.remove();
  if(storageKey === stringConstants.localStorageKey){
    document.getElementById('doneTaskList').append(taskElement)
  } else {
    document.getElementById('taskList').append(taskElement)
  };
  removeTaskFromStorage(id, storageKey)
};

const onRadioClick = (event) => {
    const taskElement = event.target.closest('.task.plainTask');
    if(taskElement){
        changeTaskStatus(taskElement.getAttribute('id'))
    }
};

const radioHandlerSetUp = () => {
    const radioButtons = document.getElementsByClassName('radio');
    for(const radio of radioButtons){
        radio.removeEventListener('click', event => onRadioClick(event));
        radio.addEventListener('click', event => onRadioClick(event))
    }
}

const getTaskTemplate = (value, id) => {
    return `<div class="task plainTask" id="${id}">
                <div class="taskName">
                    <div class="radioCheck radio">
                        <img src="./src/images/check.png" width="15">   
                    </div>
                    <span class="taskTitle">${value}</span>
                </div>
            </div>`
};

const generateId = (idLength) => {
    // let result = '';
    // const charachter = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890';
    // for(let i = 0; i < idLength; i++){
    //     result += charachter.charAt(Math.floor(Math.random() * charachter.length))
    // };
    // return result
    const id = (~~(Math.random()*1e8)).toString(16)
    return id
};

const searchInputHandler = (event) => {
    if(event.target.value.length > 0){
        filterTasks(event.target.value);
    } else {
        clearFiltration();
    }
};

const filterTasks = text => {
    for(const taskElement of taskElementsList){
        const taskTitle = taskElement.getElementsByClassName('taskTitle')[0];
        if(!taskTitle || !taskTitle.innerHTML.includes(text)){
            taskElement.classList.add('hidden')
        }
    }
};

const clearFiltration = () => {
    for(const taskElement of taskElementsList){
        taskElement.classList.remove('hidden')
    }  
};


// LOCAL STORAGE ==================

const stringConstants = {
    localStorageKey: 'taskList',
    localStorageDoneKey: 'doneTasks'
};

const getStorage = key => {
    return localStorage.getItem(key)
};

const storageTemplate = JSON.stringify({taskList: []});

const initialStorageSetUp = () => {
    const initialStorage = getStorage(stringConstants.localStorageKey);
    if(!initialStorage){
        localStorage.setItem(stringConstants.localStorageKey, storageTemplate)
        localStorage.setItem(stringConstants.localStorageDoneKey, storageTemplate)
    }
};

const getTaskStorageLocation = (id) => {
    const activeStorage = getStorage(stringConstants.localStorageKey);

    if (JSON.parse(activeStorage).taskList.find((task) => task.id.localeCompare(id) === 0)) {
        return stringConstants.localStorageKey;
    } else {
        return stringConstants.localStorageDoneKey;
    }
};

const getTasksFromStorage = key => {
    const taskListString = getStorage(key);
    if (!taskListString) {
        initialStorageSetUp();
    }
    return JSON.parse(getStorage(key)).taskList;
};

const addTaskToStorage = (task, key) => {
    const taskListString = getStorage(key);
    const taskList = JSON.parse(taskListString);
    taskList.taskList.push(task);
    localStorage.setItem(key, JSON.stringify(taskList));
};

const removeTaskFromStorage = (id, key) => {
    const taskListString = getStorage(key);
    const taskList = JSON.parse(taskListString);
    const newList = taskList.taskList.filter(task => {
        if(task.id.localeCompare(id) === 0){
            addTaskToStorage(task, key.localeCompare(stringConstants.localStorageKey) === 0 ? stringConstants.localStorageDoneKey : stringConstants.localStorageKey)
        } else {
            return task;
        }
    });
    localStorage.setItem(key, JSON.stringify({taskList: newList}))
};

