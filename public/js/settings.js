/* eslint-disable func-names */
/* global io, my, Howl */
const socket = io();
const params = window.location.toString().substring(window.location.toString().indexOf('?'));
const searchParams = new URLSearchParams(params);
const copyBtn = document.querySelector('#copy');
const lobby_code_text = document.getElementById('lobby_code_text');

const pop = new Howl({
    src: ['audio/pop.mp3'],
});

const exit = new Howl({
    src: ['audio/exit.mp3'],
});

function animateCSS(element, animation, selector = true) {
    return new Promise((resolve) => {
        const animationName = `animate__${animation}`;
        const node = selector ? document.querySelector(element) : element;

        node.classList.add('animate__animated', animationName);
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove('animate__animated', animationName);
            resolve('Animation ended');
        }
        node.addEventListener('animationend', handleAnimationEnd, { once: true });
    });
}

function updateSettings(e) {
    e.preventDefault();
    socket.emit('settingsUpdate', {
        rounds: document.querySelector('#rounds').value,
        time: document.querySelector('#time').value,
        customWords: '',
        probability: 0,
        // language: 'portuguese',
    });
}

function putPlayer(player) {
    const div = document.createElement('div');
    const img = document.createElement('img');
    const p = document.createElement('p');
    const text = document.createTextNode(player.name);
    div.id = `mimica-${player.id}`;
    p.appendChild(text);
    p.classList.add('text-center');
    img.src = player.avatar;
    img.alt = player.name;
    img.classList.add('img-fluid', 'rounded-circle');
    div.classList.add('col-4', 'col-sm-3', 'col-md-4', 'col-lg-3');
    img.onload = async () => {
        div.appendChild(img);
        div.appendChild(p);
        document.querySelector('#playersDiv').appendChild(div);
        pop.play();
        // await animateCSS(div, 'fadeInDown', false);
    };
}

function showCanvasArea() {
    document.querySelector('#gameZone').classList.remove('d-none');
    document.querySelector('#settings').remove();
}

socket.on('joinRoom', putPlayer);
socket.on('otherPlayers', (players) => players.forEach((player) => putPlayer(player)));
socket.on('disconnection', async (player) => {
    if (document.querySelector(`#mimica-${player.id}`)) {
        exit.play();
        // await animateCSS(`#mimica-${player.id}`, 'fadeOutUp');
        document.querySelector(`#mimica-${player.id}`).remove();
    }
});
socket.on('startGame', showCanvasArea);

if (searchParams.has('id')) {
    // player
    document.querySelector('#rounds').setAttribute('disabled', true);
    document.querySelector('#time').setAttribute('disabled', true);
    // disable and hide start game button
    document.querySelector('#startGame').setAttribute('disabled', true);
    document.querySelector('#startGame').classList.add('disabled');
    document.querySelector('#startGame').innerHTML = 'Waiting for the host to start';
    // disable language options
    // document.querySelector('#language').setAttribute('disabled', true);
    document.querySelector('#playGame').addEventListener('click', async () => {
        // await animateCSS('#landing>div>div', 'hinge');
        document.querySelector('#landing').remove();
        document.querySelector('#settings').classList.remove('d-none');
        // await animateCSS('#settings div', 'jackInTheBox');
        my.id = socket.id;
        if (searchParams.has('id')) {
            document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${searchParams.get('id')}`;
            putPlayer(my);
        }
        socket.emit('joinRoom', { id: searchParams.get('id'), player: my });
    });
} else {
    // room owner
    document.querySelector('#rounds').addEventListener('input', updateSettings);
    document.querySelector('#time').addEventListener('input', updateSettings);
    // document.querySelector('#customWords').addEventListener('change', updateSettings);
    // document.querySelector('#probability').addEventListener('change', updateSettings);
    // document.querySelector('#language').addEventListener('change', updateSettings);
    document.querySelector('#createRoom').addEventListener('click', async () => {
        // await animateCSS('#landing>div>div', 'hinge');
        document.querySelector('#landing').remove();
        document.querySelector('#settings').classList.remove('d-none');
        // animateCSS('#settings div', 'jackInTheBox');
        // await animateCSS('#settings>div:nth-of-type(2)', 'jackInTheBox');
        my.id = socket.id;
        socket.emit('newPrivateRoom', my);
        socket.on('newPrivateRoom', (data) => {
            document.querySelector('#gameLink').value = `${window.location.protocol}//${window.location.host}/?id=${data.gameID}`;
            lobby_code_text.appendChild(document.createTextNode(data.gameID));
            putPlayer(my);
        });
    });
}

copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('#gameLink').select();
    document.execCommand('copy');
});

document.querySelector('#startGame').addEventListener('click', async () => {
    showCanvasArea();
    socket.emit('startGame');
    socket.emit('getPlayers');
});


const qrUrl = document.querySelector('#gameLink').value;

const qrcode = new QRCode(document.getElementById('qrcode'), {
    text: qrUrl,
    width: 128,
    height: 128,
    colorDark: '#000',
    colorLight: '#fff',
    correctLevel: QRCode.CorrectLevel.H,
});

