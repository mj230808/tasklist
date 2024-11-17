document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  const addTaskButton = document.getElementById('addTaskButton');
  const taskList = document.getElementById('taskList');
  const MAX_TASKS = 5;

  let activeTask = null;

  function updateTaskLimit() {
    const taskCount = document.querySelectorAll('.task-item').length;
    if (taskCount >= MAX_TASKS) {
      taskInput.disabled = true;
      addTaskButton.disabled = true;
      taskInput.placeholder = 'Focus only on 5 tasks!';
    } else {
      taskInput.disabled = false;
      addTaskButton.disabled = false;
      taskInput.placeholder = 'Enter a task';
    }
  }

  function startTimer(taskItem) {
    const timerElement = taskItem.querySelector('.task-timer');
    let elapsedTime = parseInt(timerElement.dataset.elapsedTime || '0', 10);
    const startTime = Date.now() - elapsedTime * 1000;

    const interval = setInterval(() => {
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
      const seconds = String(elapsedTime % 60).padStart(2, '0');
      timerElement.textContent = `Time: ${minutes}:${seconds}`;
      timerElement.dataset.elapsedTime = elapsedTime;
    }, 1000);

    taskItem.dataset.timerInterval = interval;
    taskItem.querySelector('.start-task').textContent = 'Pause';
  }

  function stopTimer(taskItem) {
    const interval = taskItem.dataset.timerInterval;
    clearInterval(interval);
    taskItem.querySelector('.start-task').textContent = 'Start';
  }

  function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
      alert('Please enter a task.');
      return;
    }

    if (document.querySelectorAll('.task-item').length >= MAX_TASKS) {
      alert(`You can only add up to ${MAX_TASKS} tasks.`);
      return;
    }

    const listItem = document.createElement('li');
    listItem.className = 'task-item';
    listItem.setAttribute('draggable', 'true');
    listItem.innerHTML = `
      <div class="task-details">
        <span class="task-text">${taskText}</span>
        <span class="task-timer" data-elapsed-time="0">Time: 00:00</span>
      </div>
      <div class="task-actions">
        <button class="start-task">Start</button>
        <button class="done-task">Done</button>
      </div>
    `;

    listItem.querySelector('.start-task').addEventListener('click', () => {
      if (activeTask && activeTask !== listItem) {
        return alert('Please pause or complete the current task first.');
      }

      if (listItem.querySelector('.start-task').textContent === 'Start') {
        activeTask = listItem;
        startTimer(listItem);
        document.querySelectorAll('.task-item:not(.completed):not([draggable="false"])').forEach(item => {
          if (item !== listItem) item.classList.add('disabled');
        });
      } else {
        stopTimer(listItem);
        activeTask = null;
        document.querySelectorAll('.task-item').forEach(item => item.classList.remove('disabled'));
      }
    });

    listItem.querySelector('.done-task').addEventListener('click', () => {
      stopTimer(listItem);
      const elapsedTime = parseInt(listItem.querySelector('.task-timer').dataset.elapsedTime, 10);
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      alert(`Congratulations, you have finished ${taskText}! And it only took ${minutes} minutes and ${seconds} seconds!`);
      listItem.remove();
      activeTask = null;
      document.querySelectorAll('.task-item').forEach(item => item.classList.remove('disabled'));
      updateTaskLimit();
    });

    taskList.appendChild(listItem);
    makeListDraggable();
    taskInput.value = '';
    updateTaskLimit();
  }

  function makeListDraggable() {
    const taskItems = document.querySelectorAll('.task-item:not(.completed)');

    taskItems.forEach(item => {
      item.addEventListener('dragstart', () => {
        item.classList.add('dragging');
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });

    taskList.addEventListener('dragover', e => {
      e.preventDefault();
      const draggingItem = document.querySelector('.dragging');
      const afterElement = getDragAfterElement(taskList, e.clientY);
      if (afterElement == null) {
        taskList.appendChild(draggingItem);
      } else {
        taskList.insertBefore(draggingItem, afterElement);
      }
    });
  }

  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  addTaskButton.addEventListener('click', addTask);

  taskInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  updateTaskLimit();
});
