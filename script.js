document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const employeeId = document.getElementById('employee-id').value;
    console.log(`Username: ${username}, Employee ID: ${employeeId}`); // Debugging line

    if (username && employeeId) {
        document.getElementById('user-info').textContent = `User: ${username}, ID: ${employeeId}`;
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('game-page').style.display = 'block';
        startGame();
    } else {
        alert('Please enter both username and employee ID.');
    }
});

const imagesA = ['imagesA/1.png', 'imagesA/2.png', 'imagesA/3.png', 'imagesA/4.png', 'imagesA/5.png', 'imagesA/6.png'];
const imagesB = ['imagesB/1.png', 'imagesB/2.png', 'imagesB/3.png', 'imagesB/4.png', 'imagesB/5.png', 'imagesB/6.png'];
const images = [...imagesA, ...imagesB];
let timer, score, matchedPairs, firstCard, secondCard, lockBoard;

function startGame() {
    timer = 0;
    score = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    document.getElementById('timer').textContent = timer;
    document.getElementById('score').textContent = score;
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    const cards = images.sort(() => 0.5 - Math.random());
    cards.forEach((image, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;
        card.innerHTML = `
            <div class="front"></div>
            <div class="back" style="background-image: url('${image}')"></div>
        `;
        card.addEventListener('click', flipCard);
        card.addEventListener('touchstart', flipCard); // Add touch event listener
        gameBoard.appendChild(card);
    });
    startTimer();
}

function startTimer() {
    setInterval(() => {
        timer++;
        document.getElementById('timer').textContent = timer;
    }, 1000);
}

function flipCard() {
    if (lockBoard || this === firstCard) return;
    this.classList.add('flip');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const firstImage = firstCard.dataset.image;
    const secondImage = secondCard.dataset.image;
    console.log(`First Image: ${firstImage}, Second Image: ${secondImage}`); // Debugging line
    const isMatch = (firstImage.split('/')[1] === secondImage.split('/')[1]) && (firstImage.split('/')[0] !== secondImage.split('/')[0]);
    console.log(`Is Match: ${isMatch}`); // Debugging line
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    firstCard.removeEventListener('touchstart', flipCard);
    secondCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('touchstart', flipCard);
    matchedPairs++;
    score += 10;
    document.getElementById('score').textContent = score;
    resetBoard();
    if (matchedPairs === images.length / 2) {
        alert('You won!');
        updateLeaderboard();
    }
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 1500);
}

function resetBoard() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

function updateLeaderboard() {
    const username = document.getElementById('username').value;
    const employeeId = document.getElementById('employee-id').value;
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ username, employeeId, score, time: timer });
    leaderboard.sort((a, b) => b.score - a.score || a.time - b.time);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
    displayLoginLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = '';
    leaderboard.slice(0, 5).forEach((entry, index) => {
        const li = document.createElement('li');
        let place = '';
        if (index === 0) place = '1st';
        else if (index === 1) place = '2nd';
        else if (index === 2) place = '3rd';
        else place = `${index + 1}th`;
        li.textContent = `${place}: ${entry.username} (ID: ${entry.employeeId}) - Score: ${entry.score}, Time: ${entry.time}s`;
        leaderboardElement.appendChild(li);
    });
}

function displayLoginLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const loginLeaderboardElement = document.getElementById('login-leaderboard');
    loginLeaderboardElement.innerHTML = '';
    leaderboard.slice(0, 5).forEach((entry, index) => {
        const li = document.createElement('li');
        let place = '';
        if (index === 0) place = '1st';
        else if (index === 1) place = '2nd';
        else if (index === 2) place = '3rd';
        else place = `${index + 1}th`;
        li.textContent = `${place}: ${entry.username} (ID: ${entry.employeeId}) - Score: ${entry.score}, Time: ${entry.time}s`;
        loginLeaderboardElement.appendChild(li);
    });
}

function displayAllRecords() {
    const allRecords = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const allRecordsElement = document.getElementById('all-records');
    allRecordsElement.innerHTML = '';
    allRecords.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.username} (ID: ${entry.employeeId}) - Score: ${entry.score}, Time: ${entry.time}s`;
        allRecordsElement.appendChild(li);
    });
    allRecordsElement.style.display = 'block';
}

function generateExcelFile() {
    const allRecords = JSON.parse(localStorage.getItem('leaderboard')) || [];
    if (allRecords.length === 0) {
        alert('No records found.');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(allRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Records');

    XLSX.writeFile(workbook, 'all_players_records.xlsx');
}

document.getElementById('restart-button').addEventListener('click', () => {
    location.reload(); // Refresh the page
});

document.getElementById('show-all-records-button').addEventListener('click', displayAllRecords);
document.getElementById('generate-excel-button').addEventListener('click', generateExcelFile);
document.getElementById('navigate-button').addEventListener('click', () => {
    window.location.href = 'https://apps.powerapps.com/play/e/default-bc876b21-f134-4c12-a265-8ed26b7f0f3b/a/30c89789-c329-409d-81bb-f30bf40a9fd2?tenantId=bc876b21-f134-4c12-a265-8ed26b7f0f3b&amp;sourcetime=1721631180991&source=teamsLinkUnfurling';
});

// Display the leaderboard on the login page when the page loads
document.addEventListener('DOMContentLoaded', displayLoginLeaderboard);