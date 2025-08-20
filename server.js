// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000; // Folosim un port dinamic pentru deploy, 3000 local
const fs = require('fs');
const path = require('path');

// Permite accesul din afara domeniului
app.use(cors());

// Permite serverului să primească date JSON
app.use(express.json());

// Configurează Express pentru a servi fișiere statice din folderul 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Calea către fișierul "baza de date"
const dbPath = path.join(__dirname, 'predictions.json');

// Funcție pentru a citi datele din fișier
const readDB = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Eroare la citirea bazei de date:", err.message);
        return [];
    }
};

// Funcție pentru a scrie datele în fișier
const writeDB = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// Endpoint pentru a primi pronosticuri
app.post('/submit-prediction', (req, res) => {
    const newPrediction = req.body;
    const db = readDB();

    const userExists = db.some(p => p.user.toLowerCase() === newPrediction.user.toLowerCase());
    if (userExists) {
        return res.status(409).json({ message: 'Ai trimis deja un pronostic!' });
    }

    db.push(newPrediction);
    writeDB(db);

    res.status(200).json({ message: 'Pronostic trimis cu succes!' });
});

// Endpoint pentru a afișa clasamentul și pronosticurile
app.get('/leaderboard-data', (req, res) => {
    const db = readDB();
    const realResults = {
        'match1': '', // UTA - Slobozia
        'match2': '', // Metaloglobus - Rapid
        'match3': '', // Botoșani - M Ciuc
        'match4': '', // U Cluj - Dinamo
        'match5': '', // Galați - CFR
        'match6': '', // Craiova - Petrolul
        'match7': '', // FCSB - Argeș
        'match8': ''  // Hermannstadt - Farul
    };

    const leaderboard = db.map(p => {
        let points = 0;
        if (p.match1) points += calculatePoints(p.match1, realResults.match1);
        if (p.match2) points += calculatePoints(p.match2, realResults.match2);
        if (p.match3) points += calculatePoints(p.match3, realResults.match3);
        if (p.match4) points += calculatePoints(p.match4, realResults.match4);
        if (p.match5) points += calculatePoints(p.match5, realResults.match5);
        if (p.match6) points += calculatePoints(p.match6, realResults.match6);
        if (p.match7) points += calculatePoints(p.match7, realResults.match7);
        if (p.match8) points += calculatePoints(p.match8, realResults.match8);
        return { user: p.user, points: points, match1: p.match1, match2: p.match2, match3: p.match3, match4: p.match4, match5: p.match5, match6: p.match6, match7: p.match7, match8: p.match8 };
    });

    res.status(200).json(leaderboard);
});

// Funcție pentru a calcula punctajul
function calculatePoints(prediction, realResult) {
    if (!prediction || !realResult) return 0;
    
    if (prediction === realResult) {
        return 3;
    }

    const [predHome, predAway] = prediction.split('-').map(Number);
    const [realHome, realAway] = realResult.split('-').map(Number);
    
    const predResult = Math.sign(predHome - predAway);
    const realResultSign = Math.sign(realHome - realAway);
    
    if (predResult === realResultSign) {
        return 1;
    }
    
    return 0;
}

// Pornirea serverului
app.listen(port, '0.0.0.0', () => {
    console.log(`Server pornit pe http://localhost:${port}`);
});