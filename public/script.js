// script.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predictionsForm');
    const submitBtn = document.getElementById('submitBtn');
    const leaderboardList = document.getElementById('leaderboardList');
    const predictionsList = document.getElementById('predictionsList');
    
    // Funcție pentru a calcula punctajul și a returna o clasă CSS
    function calculatePointsAndClass(prediction, realResult) {
        let points = 0;
        let className = '';

        if (prediction === realResult) {
            points = 3;
            className = 'correct'; // Clasă pentru scor exact
        } else {
            const [predHome, predAway] = prediction.split('-').map(Number);
            const [realHome, realAway] = realResult.split('-').map(Number);
            
            const predResult = Math.sign(predHome - predAway);
            const realResultSign = Math.sign(realHome - realAway);
            
            if (predResult === realResultSign) {
                points = 1;
                className = 'partial'; // Clasă pentru rezultat corect
            }
        }
        return { points, className };
    }

    // Funcție pentru a afișa clasamentul și pronosticurile
    async function renderData() {
        try {
            const response = await fetch('http://localhost:3000/leaderboard-data');
            const allData = await response.json();
            
            // Calculăm punctajul total și pregătim datele pentru clasament
            const realResults = {
                'match1': '0-0', 
                'match2': '0-2'
            };
            const leaderboard = allData.map(p => {
                let totalPoints = 0;
                totalPoints += calculatePointsAndClass(p.match1, realResults.match1).points;
                totalPoints += calculatePointsAndClass(p.match2, realResults.match2).points;
                return { user: p.user, points: totalPoints };
            });

            // Sortăm clasamentul
            leaderboard.sort((a, b) => b.points - a.points);
            
            // Afișăm clasamentul
            leaderboardList.innerHTML = leaderboard.map(item => `
                <li>
                    <span>${item.user}</span>
                    <span>${item.points} puncte</span>
                </li>
            `).join('');

            // Afișăm pronosticurile cu stilul de culoare
            predictionsList.innerHTML = allData.map(p => {
                const match1Class = calculatePointsAndClass(p.match1, realResults.match1).className;
                const match2Class = calculatePointsAndClass(p.match2, realResults.match2).className;
                return `
                    <li>
                        <span>Nume: ${p.user}</span>
                        <span>UTA - Slobozia: <span class="${match1Class}">${p.match1}</span></span>
						<span>Metaloglobus - Rapid: <span class="${match1Class}">${p.match1}</span></span>
						<span>Botoșani - Miercurea Ciuc: <span class="${match1Class}">${p.match1}</span></span>
						<span>U Cluj - Dinamo: <span class="${match1Class}">${p.match1}</span></span>
						<span>Galați - CFR: <span class="${match1Class}">${p.match1}</span></span>
						<span>Craiova - Petrolul: <span class="${match1Class}">${p.match1}</span></span>
						<span>FCSB - Argeș: <span class="${match1Class}">${p.match1}</span></span>
						<span>Hermannstadt - Farul: <span class="${match1Class}">${p.match1}</span></span>
                    </li>
                `;
            }).join('');

        } catch (error) {
            leaderboardList.innerHTML = '<li>Nu s-au putut încărca pronosticurile.</li>';
            predictionsList.innerHTML = '';
            console.error('Eroare la încărcarea datelor:', error);
        }
    }

    // Acțiune la trimiterea formularului
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userPredictions = {
            user: form.userName.value,
            match1: form.match1.value,
            match2: form.match2.value,
        };
        
        try {
            const response = await fetch('http://localhost:3000/submit-prediction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userPredictions)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                localStorage.setItem('hasPredicted', 'true');
                submitBtn.disabled = true;
                submitBtn.innerText = 'Pronosticuri trimise!';
                form.userName.disabled = true;
                form.match1.disabled = true;
                form.match2.disabled = true;
                
                renderData();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Eroare la trimiterea pronosticului.');
            }
        } catch (error) {
            console.error('Eroare de rețea:', error);
            alert('A apărut o eroare la conectare. Asigură-te că serverul rulează.');
        }
    });

    // La încărcarea paginii
    if (localStorage.getItem('hasPredicted') === 'true') {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Ai trimis deja pronosticurile!';
        form.userName.disabled = true;
        form.match1.disabled = true;
        form.match2.disabled = true;
    }
    renderData();
});