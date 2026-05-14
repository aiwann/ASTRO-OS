'use strict';

const PYTHAGOREAN = {
  а:1,б:2,в:3,г:4,д:5,е:6,ж:7,з:8,и:9,
  й:1,к:2,л:3,м:4,н:5,о:6,п:7,р:8,с:9,
  т:1,у:2,ф:3,х:4,ц:5,ч:6,ш:7,щ:8,ъ:9,
  ь:2,ю:6,я:1,
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};

const VOWELS_BG = new Set(['а','е','и','о','у','ъ','ю','я','a','e','i','o','u','y']);

function reduce(n, keepMaster = true) {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22 || n === 33)) return n;
    const digits = String(n).split('').map(Number);
    n = digits.reduce((a, b) => a + b, 0);
  }
  return n;
}

function letterValue(ch) {
  return PYTHAGOREAN[ch.toLowerCase()] || 0;
}

function lifePathNumber(birthDate) {
  const digits = birthDate.replace(/\D/g, '').split('').map(Number);
  const sum = digits.reduce((a, b) => a + b, 0);
  return reduce(sum);
}

function destinyNumber(fullName) {
  const letters = fullName.toLowerCase().replace(/\s/g, '').split('');
  const sum = letters.reduce((a, ch) => a + (letterValue(ch) || 0), 0);
  return reduce(sum);
}

function soulUrgeNumber(fullName) {
  const vowels = fullName.toLowerCase().split('').filter(ch => VOWELS_BG.has(ch));
  const sum = vowels.reduce((a, ch) => a + (letterValue(ch) || 0), 0);
  return reduce(sum);
}

function personalityNumber(fullName) {
  const consonants = fullName.toLowerCase().replace(/\s/g, '').split('')
    .filter(ch => letterValue(ch) > 0 && !VOWELS_BG.has(ch));
  const sum = consonants.reduce((a, ch) => a + (letterValue(ch) || 0), 0);
  return reduce(sum);
}

function birthdayNumber(birthDate) {
  const parts = birthDate.split(/[-\/\.]/);
  const day = parseInt(parts[parts.length - 1] || parts[0], 10);
  return reduce(day);
}

function angelNumber(birthDate, fullName) {
  const lp = lifePathNumber(birthDate);
  const dn = destinyNumber(fullName);
  const sum = reduce(lp + dn);
  return {
    primary: sum,
    repeating: String(sum).repeat(3).slice(0, 4),
    lifePathContribution: lp,
    destinyContribution: dn,
  };
}

function karmicLessons(fullName) {
  const present = new Set();
  fullName.toLowerCase().replace(/\s/g, '').split('').forEach(ch => {
    const v = letterValue(ch);
    if (v) present.add(v);
  });
  const missing = [];
  for (let i = 1; i <= 9; i++) {
    if (!present.has(i)) missing.push(i);
  }
  return missing;
}

const NUMBER_MEANINGS = {
  1: { name: 'Лидер', keywords: ['независимост','амбиция','оригиналност','иновация'], challenge: 'Егоизъм и доминиране', gift: 'Лидерство и пионерски дух' },
  2: { name: 'Дипломат', keywords: ['сътрудничество','интуиция','чувствителност','баланс'], challenge: 'Неувереност и зависимост', gift: 'Дипломация и емпатия' },
  3: { name: 'Творец', keywords: ['творчество','изразяване','радост','комуникация'], challenge: 'Разпиляност и повърхностност', gift: 'Творческо изразяване и вдъхновение' },
  4: { name: 'Строител', keywords: ['стабилност','дисциплина','труд','практичност'], challenge: 'Ригидност и ограниченост', gift: 'Надеждност и майсторство' },
  5: { name: 'Авантюрист', keywords: ['свобода','промяна','приключение','адаптивност'], challenge: 'Непостоянство и прекаленост', gift: 'Свобода и универсалност' },
  6: { name: 'Хармонизатор', keywords: ['грижа','отговорност','любов','дом'], challenge: 'Самопожертване и перфекционизъм', gift: 'Любов и хармония' },
  7: { name: 'Мистик', keywords: ['духовност','мъдрост','анализ','самота'], challenge: 'Изолираност и скептицизъм', gift: 'Духовна мъдрост и интуиция' },
  8: { name: 'Изпълнител', keywords: ['власт','успех','материализъм','лидерство'], challenge: 'Алчност и контрол', gift: 'Материален успех и власт' },
  9: { name: 'Хуманист', keywords: ['мъдрост','състрадание','завършване','духовност'], challenge: 'Разочарование и себеотрицание', gift: 'Универсална любов и мъдрост' },
  11: { name: 'Интуитивен', keywords: ['просветление','вдъхновение','идеализъм','чувствителност'], challenge: 'Тревожност и нереалистичност', gift: 'Духовно просветление' },
  22: { name: 'Майстор строител', keywords: ['трансформация','мащаб','практичен идеализъм'], challenge: 'Претоварване и перфекционизъм', gift: 'Строителство на легаси' },
  33: { name: 'Майстор учител', keywords: ['безусловна любов','изцеление','мъдрост'], challenge: 'Себеотрицание', gift: 'Духовно изцеление' },
};

const ANGEL_NUMBER_MEANINGS = {
  111: 'Нов начало. Твоите мисли се проявяват бързо. Внимавай за какво мислиш.',
  222: 'Баланс и хармония. Вярвай на процеса — всичко е наред.',
  333: 'Вселената те подкрепя. Твоите ангели са наоколо.',
  444: 'Основа и стабилност. Ти си защитен и обичан.',
  555: 'Голяма промяна идва. Отвори се за новото.',
  666: 'Хармонизирай мисли и реалност. Фокусирай се на духовното.',
  777: 'Духовно пробуждане. Ти си на правилния път.',
  888: 'Изобилие идва. Финансов и духовен просперитет.',
  999: 'Завършване на цикъл. Пуснете старото, новото чака.',
  1111: 'Портал към пробуждане. Ти си синхронизиран с Вселената.',
  1212: 'Духовна еволюция. Продължавай напред с вяра.',
  1234: 'Напредък стъпка по стъпка. Продължавай на правилния път.',
};

function getAngelMeaning(num) {
  const str = String(num).repeat(4).slice(0, 4);
  return ANGEL_NUMBER_MEANINGS[str]
    || ANGEL_NUMBER_MEANINGS[String(num).repeat(3)]
    || `Числото ${num} носи енергия на ${NUMBER_MEANINGS[num]?.name || 'трансформация'}.`;
}

function calculate(fullName, birthDate) {
  const lifePath    = lifePathNumber(birthDate);
  const destiny     = destinyNumber(fullName);
  const soulUrge    = soulUrgeNumber(fullName);
  const personality = personalityNumber(fullName);
  const birthday    = birthdayNumber(birthDate);
  const angel       = angelNumber(birthDate, fullName);
  const karmic      = karmicLessons(fullName);

  return {
    lifePath,
    destiny,
    soulUrge,
    personality,
    birthday,
    angel,
    karmic,
    meanings: {
      lifePath:    NUMBER_MEANINGS[lifePath],
      destiny:     NUMBER_MEANINGS[destiny],
      soulUrge:    NUMBER_MEANINGS[soulUrge],
      personality: NUMBER_MEANINGS[personality],
    },
    angelMeaning: getAngelMeaning(angel.primary),
  };
}

module.exports = { calculate, lifePathNumber, destinyNumber, soulUrgeNumber, NUMBER_MEANINGS };
