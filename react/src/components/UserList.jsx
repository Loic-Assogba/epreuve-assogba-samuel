import { useState, useEffect } from 'react';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchUsers() {
            try {
                const response = await fetch(
                    'https://jsonplaceholder.typicode.com/users'
                );

                if (!response.ok) {
                    throw new Error('Erreur de récupération');
                }

                const data = await response.json();

                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    if (loading) {
        return <p>Chargement des utilisateurs...</p>;
    }

    if (error) {
        return <p>Erreur : {error}</p>;
    }

    return (
        <div>
            <h2>Liste des utilisateurs</h2>

            {users.map((user) => (
                <div key={user.id}>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                    <p>{user.address.city}</p>
                </div>
            ))}
        </div>
    );
}
