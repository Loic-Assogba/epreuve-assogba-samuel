export default function TodoItem({ task, onToggle, onDelete }) {
    return (
        <li>
            <span
                onClick={() => onToggle(task.id)}
                style={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    cursor: 'pointer',
                }}
            >
                {task.text}
            </span>

            <button onClick={() => onDelete(task.id)}>Supprimer</button>
        </li>
    );
}
