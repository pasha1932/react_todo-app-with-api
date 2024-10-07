import React, { FormEvent, useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';
import { Todo } from './types/Todo';
import { Header } from './components/Header/Header';
import { TodoList } from './components/TodoList/TodoList';
import { Footer } from './components/Footer/Footer';
// eslint-disable-next-line max-len
import { ErrorNotification } from './components/ErrorNotification/ErrorNotification';

export enum Status {
  all = 'all',
  active = 'active',
  completed = 'completed',
}

function getVisibleTodos(todos: Todo[], status: Status) {
  const copyTodos = [...todos];

  if (status === Status.active) {
    return copyTodos.filter(todo => !todo.completed);
  }

  if (status === Status.completed) {
    return copyTodos.filter(todo => todo.completed);
  }

  return copyTodos;
}

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusTodo, setStatusTodo] = useState<Status>(Status.all);
  const [textField, setTextField] = useState('');
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isLoading, setIsLoading] = useState(0);

  const field = useRef<HTMLInputElement>(null);
  const todosLength = todos.length;
  const completedTodosId = todos
    .filter(todo => todo.completed)
    .map(el => el.id);
  const visibleTodos = getVisibleTodos(todos, statusTodo);

  useEffect(() => {
    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    field.current?.focus();
  }, [isSubmiting]);

  useEffect(() => {
    window.setTimeout(() => setErrorMessage(''), 3000);
  }, [errorMessage]);

  if (!USER_ID) {
    return <UserWarning />;
  }

  const handleTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextField(e.target.value);
    setErrorMessage('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!textField.trim()) {
      setErrorMessage('Title should not be empty');

      return;
    }

    const newTodo: Omit<Todo, 'id'> = {
      userId: USER_ID,
      title: textField,
      completed: false,
    };

    setIsSubmiting(true);
    setTempTodo({
      id: 0,
      userId: USER_ID,
      title: textField,
      completed: false,
    });

    addTodo(newTodo)
      .then(todo => {
        setTodos(currentTodos => [...currentTodos, todo]);
        setTextField('');
      })
      .catch(error => {
        setErrorMessage('Unable to add a todo');
        throw error;
      })
      .finally(() => {
        setIsSubmiting(false);
        setTempTodo(null);
      });
  };

  const handleDelete = (todoId: number) => {
    setIsLoading(todoId);

    deleteTodo(todoId)
      .then(() =>
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        ),
      )
      .catch(error => {
        setTodos(todos);
        setErrorMessage('Unable to delete a todo');
        throw error;
      })
      .finally(() => setIsLoading(0));
  };

  const handleDeleteCompleted = () => {
    Promise.allSettled(completedTodosId.map(todoId => handleDelete(todoId)));
  };

  const handleStatusChange = (updatedTodo: Todo) => {
    setIsLoading(updatedTodo.id);

    return updateTodo({ ...updatedTodo, completed: !updatedTodo.completed })
      .then(() => {
        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === updatedTodo.id
              ? { ...todo, completed: !updatedTodo.completed }
              : todo,
          );
        });
      })
      .catch(error => {
        setErrorMessage('Unable to update a todo');
        throw error;
      })
      .finally(() => {
        setIsLoading(0);
      });
  };

  const handleToggleAll = () => {
    const todosToToggle =
      completedTodosId.length === todos.length
        ? todos
        : todos.filter(todo => !todo.completed);

    Promise.allSettled(todosToToggle.map(todo => handleStatusChange(todo)));
  };

  const handleEditTodo = (updatedTodo: Todo) => {
    setIsLoading(updatedTodo.id);

    return updateTodo(updatedTodo)
      .then(() => {
        setTodos(currentTodos => {
          return currentTodos.map(todo =>
            todo.id === updatedTodo.id ? updatedTodo : todo,
          );
        });
      })
      .catch(error => {
        setErrorMessage('Unable to update a todo');
        throw error;
      })
      .finally(() => {
        setIsLoading(0);
      });
  };

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          textField={textField}
          onTextField={handleTextField}
          onSubmit={handleSubmit}
          isSubmiting={isSubmiting}
          field={field}
          onToggleAll={handleToggleAll}
        />

        <TodoList
          visibleTodos={visibleTodos}
          onDelete={handleDelete}
          isLoading={isLoading}
          tempTodo={tempTodo}
          textField={textField}
          onStatusChange={handleStatusChange}
          onEdit={handleEditTodo}
        />

        {!!todosLength && (
          <Footer
            statusTodo={statusTodo}
            todosLength={todosLength}
            completedTodosLength={completedTodosId.length}
            onStatus={setStatusTodo}
            onDeleteCompleted={handleDeleteCompleted}
          />
        )}
      </div>

      <ErrorNotification
        errorMessage={errorMessage}
        onError={setErrorMessage}
      />
    </div>
  );
};
