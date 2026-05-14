'use strict';

const { calculate } = require('../numerology/calculator');

function analyze(fullName, birthDate) {
  return calculate(fullName, birthDate);
}

module.exports = { analyze };
