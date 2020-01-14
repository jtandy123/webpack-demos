import '../styles/addImage.css';
let smallImg = document.createElement('img');
smallImg.src = require('../images/small.png'); // 必须require进来
document.body.appendChild(smallImg);

let bigImg = document.createElement('img');
bigImg.src = require('../images/big.png');
document.body.appendChild(bigImg);
