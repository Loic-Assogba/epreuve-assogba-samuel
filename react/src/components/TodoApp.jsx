import { useState } from 'react';
import TodoItem from './TodoItem';

export default function TodoApp() {
    const [tasks, setTasks] = useState([]);
    const [text, setText] = useState('');

    // Ajouter une tâche
    function ajouterTache() {
        if (text.trim() === '') return;

        const nouvelleTache = {
            id: Date.now(),
            text: text,
            completed: false,
        };

        setTasks([...tasks, nouvelleTache]);
        setText('');
    }

    // Supprimer une tâche
    function supprimerTache(id) {
        setTasks(tasks.filter((task) => task.id !== id));
    }

    // Marquer comme terminée
    function terminerTache(id) {
        setTasks(
            tasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }

    // Compter les tâches restantes
    const restantes = tasks.filter((task) => !task.completed).length;

    return (
        <div>
            <h1>Todo Application</h1>

            <input
                type="text"
                placeholder="Ajouter une tâche..."
                value={text}
                onChange={(e) => setText(e.target.value)}
            />

            <button onClick={ajouterTache}>Ajouter</button>

            <h3>Tâches restantes : {restantes}</h3>

            <ul>
                {tasks.map((task) => (
                    <TodoItem
                        key={task.id}
                        task={task}
                        onToggle={terminerTache}
                        onDelete={supprimerTache}
                    />
                ))}
            </ul>
        </div>
    );
}
