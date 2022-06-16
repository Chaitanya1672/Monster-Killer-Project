const ATTACK_VALUE = 10;
const MONSTER_ATTACK_VALUE = 14;
const STRONG_ATTACK_VALUE = 17;
const HEAL_VALUE = 20;

const MODE_ATTACK = 'ATTACK'; // MODE_ATTACK = 0
const MODE_STRONG_ATTACK = 'STRONG_ATTACK'; // MODE_STRONG_ATTACK = 1
const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'PLAYER_STRONG_ATTACK';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';



let battleLog = [];
let lastLoggedEntry;

function getMaxLifeValues() {
    const enteredValue = prompt('Maximum Life for you and Monster.', '100');

    const parsedValue = parseInt(enteredValue);
    if (isNaN(parsedValue) || parsedValue <= 0) {
        throw { message: 'Invali User input , Not a number!' };
    }
    return parsedValue;
}

let chosenMaxLife;

try {
    chosenMaxLife = getMaxLifeValues();
} catch (error) {
    console.log(error);
    chosenMaxLife = 100;
    alert('You entered something wrong, so default value is used -100. ')
}


let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;

adjustHealthBars(chosenMaxLife);

function writeToLog(ev, val, monsterHealth, playerHealth) {
    let logEntry = {
        event: ev,
        value: val,
        finalMonsterHealth: monsterHealth,
        finalPlayerHealth: playerHealth,
    };
    switch (ev) {
        case LOG_EVENT_PLAYER_ATTACK:
            logEntry.target = 'MONSTER';
            break;
        case LOG_EVENT_PLAYER_STRONG_ATTACK:
            logEntry = {
                event: ev,
                value: val,
                target: 'MONSTER',
                finalMonsterHealth: monsterHealth,
                finalPlayerHealth: playerHealth,
            };
            break;
        case LOG_EVENT_MONSTER_ATTACK:
            logEntry = {
                event: ev,
                value: val,
                target: 'PLAYER',
                finalMonsterHealth: monsterHealth,
                finalPlayerHealth: playerHealth,
            };
            break;
        case LOG_EVENT_PLAYER_HEAL:
            logEntry = {
                event: ev,
                value: val,
                target: 'PLAYER',
                finalMonsterHealth: monsterHealth,
                finalPlayerHealth: playerHealth,
            };
            break;
        case LOG_EVENT_GAME_OVER:
            logEntry = {
                event: ev,
                value: val,
                finalMonsterHealth: monsterHealth,
                finalPlayerHealth: playerHealth,
            };
            break;
        default:
            logEntry = {};
    }
    // if (ev === LOG_EVENT_PLAYER_ATTACK) {
    //     logEntry.target = 'MONSTER';
    // } else if (ev === LOG_EVENT_PLAYER_STRONG_ATTACK) {
    //     logEntry = {
    //         event: ev,
    //         value: val,
    //         target: 'MONSTER',
    //         finalMonsterHealth: monsterHealth,
    //         finalPlayerHealth: playerHealth,
    //     };
    // } else if (ev === LOG_EVENT_MONSTER_ATTACK) {
    //     logEntry = {
    //         event: ev,
    //         value: val,
    //         target: 'PLAYER',
    //         finalMonsterHealth: monsterHealth,
    //         finalPlayerHealth: playerHealth,
    //     };
    // } else if (ev === LOG_EVENT_PLAYER_HEAL) {
    //     logEntry = {
    //         event: ev,
    //         value: val,
    //         target: 'PLAYER',
    //         finalMonsterHealth: monsterHealth,
    //         finalPlayerHealth: playerHealth,
    //     };
    // } else if (ev === LOG_EVENT_GAME_OVER) {
    //     logEntry = {
    //         event: ev,
    //         value: val,
    //         finalMonsterHealth: monsterHealth,
    //         finalPlayerHealth: playerHealth,
    //     };
    // }
    battleLog.push(logEntry);
}
function reset() {
    currentMonsterHealth = chosenMaxLife;
    currentPlayerHealth = chosenMaxLife;
    resetGame(chosenMaxLife)
}

function endRound() {
    const initialPlayerHealth = currentPlayerHealth;
    const playerDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= playerDamage;
    writeToLog(LOG_EVENT_MONSTER_ATTACK,
        playerDamage,
        currentMonsterHealth,
        currentPlayerHealth);

    if (currentPlayerHealth <= 0 && hasBonusLife) {
        hasBonusLife = false;
        removeBonusLife();
        currentPlayerHealth = initialPlayerHealth;
        setPlayerHealth(initialPlayerHealth);
        alert('You would be dead but Bonus Life saved you!');
    }
    if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
        alert('You Won!');
        writeToLog(LOG_EVENT_GAME_OVER,
            'Player Won',
            currentMonsterHealth,
            currentPlayerHealth);
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
        alert('You Lost!');
        writeToLog(LOG_EVENT_GAME_OVER,
            'Monster Won',
            currentMonsterHealth,
            currentPlayerHealth);
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth <= 0) {
        alert('You have Draw!');
        writeToLog(LOG_EVENT_GAME_OVER,
            'A Draw',
            currentMonsterHealth,
            currentPlayerHealth);
    }
    if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0
    ) {
        reset();
    }
}

function attackMonster(mode) {
    let maxDamage = mode === MODE_ATTACK ? ATTACK_VALUE : STRONG_ATTACK_VALUE;
    let logEvent = mode === MODE_ATTACK ?
        LOG_EVENT_PLAYER_ATTACK :
        LOG_EVENT_PLAYER_STRONG_ATTACK;
    // if (mode === MODE_ATTACK) {
    //     maxDamage = ATTACK_VALUE;
    //     logEvent = LOG_EVENT_PLAYER_ATTACK;
    // } else if (mode === MODE_STRONG_ATTACK) {
    //     maxDamage = STRONG_ATTACK_VALUE;
    //     logEvent = LOG_EVENT_PLAYER_STRONG_ATTACK;
    // }
    const damage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= damage;
    writeToLog(
        logEvent,
        damage,
        currentMonsterHealth,
        currentPlayerHealth);
    endRound();
}

function attackHandler() {
    attackMonster(MODE_ATTACK);
}

function strongAttackHandler() {
    attackMonster(MODE_STRONG_ATTACK);
}

function healPlayerHandler() {
    let heatValue;
    if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
        alert("You Can't heal more than your max initial health.")
        heatValue = chosenMaxLife - currentPlayerHealth;
    } else {
        heatValue = HEAL_VALUE;
    }
    increasePlayerHealth(HEAL_VALUE);
    currentPlayerHealth += HEAL_VALUE;
    writeToLog(
        LOG_EVENT_PLAYER_HEAL,
        heatValue,
        currentMonsterHealth,
        currentPlayerHealth);
    endRound();
}

function printLogHandler() {
    // for (let i = 0; i < 3; i++) {
    //     console.log('__________');
    // }
    let j = 0;
    while (j < 3) {
        console.log('__________');
        j++;
    }
    // for (let i = 10; i > 0;) {
    //     i--;
    //     console.log(i);
    // }
    // 
    let i = 0;
    for (const logEntry of battleLog) {
        if (!lastLoggedEntry && lastLoggedEntry !== 0 || lastLoggedEntry < i) {
            console.log(`#${i}`);
            for (const key in logEntry) {
                console.log(`${key}=> ${logEntry[key]}`);
            }
            lastLoggedEntry = i;
            break;
        }
        i++;

    }
}



attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healPlayerHandler);
logBtn.addEventListener('click', printLogHandler)