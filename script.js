let schools = [];
let tournament = null;

const schoolNameInput = document.getElementById('schoolNameInput');
const addSchoolBtn = document.getElementById('addSchoolBtn');
const schoolList = document.getElementById('schoolList');
const schoolCount = document.getElementById('schoolCount');
const generateBracketBtn = document.getElementById('generateBracketBtn');
const clearBracketBtn = document.getElementById('clearBracketBtn');
const tournamentBracket = document.getElementById('tournamentBracket');
const bracketContainer = document.getElementById('bracketContainer');

const dummySchools = [
    '서울고등학교', '부산고등학교', '대구고등학교', '인천고등학교',
    '광주고등학교', '대전고등학교', '울산고등학교', '세종고등학교',
    '경기고등학교', '강원고등학교', '충북고등학교', '충남고등학교',
    '전북고등학교', '전남고등학교', '경북고등학교', '경남고등학교'
];

function updateSchoolList() {
    schoolList.innerHTML = '';
    schools.forEach((school, index) => {
        const li = document.createElement('li');
        li.className = 'school-item';
        li.innerHTML = `
            <span class="school-name">${school}</span>
            <button class="delete-btn" onclick="deleteSchool(${index})">삭제</button>
        `;
        schoolList.appendChild(li);
    });
    schoolCount.textContent = schools.length;
    updateButtons();
}

function addSchool() {
    const schoolName = schoolNameInput.value.trim();
    if (schoolName && !schools.includes(schoolName)) {
        schools.push(schoolName);
        schoolNameInput.value = '';
        updateSchoolList();
    } else if (schools.includes(schoolName)) {
        alert('이미 등록된 학교입니다.');
    }
}

function deleteSchool(index) {
    schools.splice(index, 1);
    updateSchoolList();
}

function updateButtons() {
    const schoolsCount = schools.length;
    generateBracketBtn.disabled = schoolsCount < 2;
    
    if (isPowerOfTwo(schoolsCount)) {
        generateBracketBtn.textContent = '대진표 생성';
    } else {
        generateBracketBtn.textContent = `대진표 생성 (${getNextPowerOfTwo(schoolsCount)}강 토너먼트)`;
    }
}

function isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
}

function getNextPowerOfTwo(n) {
    let power = 1;
    while (power < n) {
        power *= 2;
    }
    return power;
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function generateBracket() {
    const shuffledSchools = shuffleArray(schools);
    const bracketSize = getNextPowerOfTwo(schools.length);
    const byeCount = bracketSize - schools.length;
    
    tournament = {
        schools: shuffledSchools,
        bracketSize: bracketSize,
        rounds: []
    };
    
    for (let i = 0; i < byeCount; i++) {
        shuffledSchools.push(null);
    }
    
    createBracketStructure(shuffledSchools);
    displayBracket();
    
    tournamentBracket.classList.add('active');
    clearBracketBtn.disabled = false;
}

function createBracketStructure(participants) {
    const rounds = [];
    let currentRound = [];
    
    for (let i = 0; i < participants.length; i += 2) {
        currentRound.push({
            team1: participants[i],
            team2: participants[i + 1] || null,
            winner: null
        });
    }
    rounds.push(currentRound);
    
    while (currentRound.length > 1) {
        const nextRound = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            nextRound.push({
                team1: null,
                team2: null,
                winner: null
            });
        }
        rounds.push(nextRound);
        currentRound = nextRound;
    }
    
    tournament.rounds = rounds;
}

function displayBracket() {
    bracketContainer.innerHTML = '';
    const bracketWrapper = document.createElement('div');
    bracketWrapper.className = 'bracket-wrapper';
    
    tournament.rounds.forEach((round, roundIndex) => {
        const roundDiv = document.createElement('div');
        roundDiv.className = 'bracket-round';
        
        const roundTitle = document.createElement('div');
        roundTitle.className = 'round-title';
        roundTitle.textContent = getRoundName(roundIndex, tournament.rounds.length);
        roundDiv.appendChild(roundTitle);
        
        round.forEach((match, matchIndex) => {
            const matchDiv = document.createElement('div');
            matchDiv.className = 'match';
            matchDiv.style.marginTop = `${Math.pow(2, roundIndex) * 30}px`;
            
            const team1Div = document.createElement('div');
            team1Div.className = 'match-team';
            team1Div.textContent = match.team1 || (roundIndex === 0 && match.team2 ? 'BYE' : 'TBD');
            
            const team2Div = document.createElement('div');
            team2Div.className = 'match-team';
            team2Div.textContent = match.team2 || (roundIndex === 0 ? 'BYE' : 'TBD');
            
            if (roundIndex === 0) {
                if (match.team1 && !match.team2) {
                    match.winner = match.team1;
                    team1Div.classList.add('winner');
                    if (tournament.rounds[roundIndex + 1]) {
                        const nextMatchIndex = Math.floor(matchIndex / 2);
                        if (matchIndex % 2 === 0) {
                            tournament.rounds[roundIndex + 1][nextMatchIndex].team1 = match.team1;
                        } else {
                            tournament.rounds[roundIndex + 1][nextMatchIndex].team2 = match.team1;
                        }
                    }
                } else if (!match.team1 && match.team2) {
                    match.winner = match.team2;
                    team2Div.classList.add('winner');
                    if (tournament.rounds[roundIndex + 1]) {
                        const nextMatchIndex = Math.floor(matchIndex / 2);
                        if (matchIndex % 2 === 0) {
                            tournament.rounds[roundIndex + 1][nextMatchIndex].team1 = match.team2;
                        } else {
                            tournament.rounds[roundIndex + 1][nextMatchIndex].team2 = match.team2;
                        }
                    }
                }
            }
            
            matchDiv.appendChild(team1Div);
            matchDiv.appendChild(team2Div);
            roundDiv.appendChild(matchDiv);
        });
        
        bracketWrapper.appendChild(roundDiv);
    });
    
    bracketContainer.appendChild(bracketWrapper);
}

function getRoundName(roundIndex, totalRounds) {
    const roundNumber = totalRounds - roundIndex;
    if (roundNumber === 1) return '결승';
    if (roundNumber === 2) return '준결승';
    if (roundNumber === 3) return '준준결승';
    
    const totalTeams = Math.pow(2, roundNumber - 1);
    return `${totalTeams}강`;
}

function clearBracket() {
    tournament = null;
    tournamentBracket.classList.remove('active');
    bracketContainer.innerHTML = '';
    clearBracketBtn.disabled = true;
}

function loadDummyData() {
    schools = dummySchools.slice(0, 8);
    updateSchoolList();
}

addSchoolBtn.addEventListener('click', addSchool);
schoolNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addSchool();
    }
});
generateBracketBtn.addEventListener('click', generateBracket);
clearBracketBtn.addEventListener('click', clearBracket);

window.deleteSchool = deleteSchool;

updateSchoolList();