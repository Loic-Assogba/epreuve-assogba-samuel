function stats(nombres) {
    let min = nombres[0];
    let max = nombres[0];
    let somme = 0;

    for (let n of nombres) {
        if (n < min) min = n;
        if (n > max) max = n;

        somme += n;
    }

    return {
        min: min,
        max: max,
        moyenne: somme / nombres.length,
    };
}

console.log(stats([10, 20, 30, 40]));

function stats(nombres) {
    let min = nombres[0];
    let max = nombres[0];
    let somme = 0;

    for (let n of nombres) {
        if (n < min) min = n;
        if (n > max) max = n;

        somme += n;
    }

    return {
        min: min,
        max: max,
        moyenne: somme / nombres.length,
    };
}

console.log(stats([10, 20, 30, 40]));

const users = [
    { nom: 'Ada', age: 17, ville: 'Cotonou' },
    { nom: 'Koffi', age: 25, ville: 'Porto-Novo' },
    { nom: 'Mireille', age: 31, ville: 'Cotonou' },
];

// Afficher les noms
const noms = users.map((user) => user.nom);

console.log(noms);

// Afficher les majeurs de Cotonou
const majeurs = users.filter(
    (user) => user.age >= 18 && user.ville === 'Cotonou'
);

console.log(majeurs);

// Calculer l'âge moyen
const total = users.reduce((somme, user) => somme + user.age, 0);

const moyenne = total / users.length;

console.log(moyenne);

async function recupererUtilisateur() {
    try {
        const response = await fetch(
            'https://jsonplaceholder.typicode.com/users/1'
        );

        if (!response.ok) {
            throw new Error('Erreur de chargement');
        }

        const user = await response.json();

        console.log(user.name);
    } catch (error) {
        console.log(error.message);
    }
}

recupererUtilisateur();
