type Props = {
  textField: string;
  onTextField: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmiting: boolean;
  field: React.RefObject<HTMLInputElement>;
  onToggleAll: () => void;
};

export const Header: React.FC<Props> = ({
  textField,
  onTextField,
  onSubmit,
  isSubmiting,
  field,
  onToggleAll,
}) => {
  return (
    <header className="todoapp__header">
      <button
        type="button"
        className="todoapp__toggle-all active"
        data-cy="ToggleAllButton"
        onClick={onToggleAll}
      />

      <form onSubmit={onSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          ref={field}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={textField}
          onChange={onTextField}
          disabled={isSubmiting}
        />
      </form>
    </header>
  );
};
