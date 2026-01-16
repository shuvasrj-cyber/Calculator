
import { AngleUnit } from '../types';

export const CONSTANTS = {
  c: 299792458,
  g: 9.80665,
  h: 6.62607015e-34,
  G: 6.67430e-11,
  Na: 6.02214076e23,
  R: 8.314462618,
  k: 1.380649e-23,
  eps0: 8.854187e-12,
  mu0: 1.256637e-6,
};

export const evaluateExpression = (expr: string, unit: AngleUnit, ans: string = '0'): string => {
  try {
    let processed = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'Math.PI')
      .replace(/e/g, 'Math.E')
      .replace(/Ans/g, `(${ans})`)
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/∛\(/g, 'Math.cbrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/\^/g, '**')
      .replace(/x10\^/g, '*10**')
      // Engineering Suffixes
      .replace(/(\d+)G/g, '$1*1e9')
      .replace(/(\d+)M/g, '$1*1e6')
      .replace(/(\d+)k/g, '$1*1e3')
      .replace(/(\d+)m/g, '$1*1e-3')
      .replace(/(\d+)µ/g, '$1*1e-6')
      .replace(/(\d+)u/g, '$1*1e-6')
      .replace(/\bc\b/g, CONSTANTS.c.toString())
      .replace(/\bg\b/g, CONSTANTS.g.toString())
      .replace(/\bh\b/g, CONSTANTS.h.toString());

    // Numerical Integration: int(expr, lower, upper)
    processed = processed.replace(/int\(([^,]+),([^,]+),([^)]+)\)/g, (_, f, a, b) => {
      const lower = eval(a);
      const upper = eval(b);
      const steps = 500;
      const h = (upper - lower) / steps;
      let sum = 0;
      const func = (val: number) => eval(f.replace(/\bx\b/g, `(${val})`));
      for (let i = 0; i <= steps; i++) {
        const x = lower + i * h;
        const weight = (i === 0 || i === steps) ? 1 : (i % 2 === 1 ? 4 : 2);
        sum += weight * func(x);
      }
      return ((h / 3) * sum).toString();
    });

    // Summation: sum(expr, start, end)
    processed = processed.replace(/sum\(([^,]+),([^,]+),([^)]+)\)/g, (_, f, s, e) => {
      const start = Math.round(eval(s));
      const end = Math.round(eval(e));
      let total = 0;
      for (let x = start; x <= end; x++) {
        total += eval(f.replace(/\bx\b/g, `(${x})`));
      }
      return total.toString();
    });

    // Combinatorics
    processed = processed.replace(/(\d+)P(\d+)/g, (_, n, r) => {
      const num = parseInt(n);
      const den = parseInt(r);
      return (factorial(num) / factorial(num - den)).toString();
    });
    processed = processed.replace(/(\d+)C(\d+)/g, (_, n, r) => {
      const num = parseInt(n);
      const den = parseInt(r);
      return (factorial(num) / (factorial(den) * factorial(num - den))).toString();
    });

    const functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh'];
    functions.forEach(fn => {
      const regex = new RegExp(`\\b${fn}\\(`, 'g');
      if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan'].includes(fn) && unit === 'deg') {
        if (fn.startsWith('a')) {
          processed = processed.replace(regex, `(180/Math.PI)*Math.${fn}(`);
        } else {
          processed = processed.replace(regex, `Math.${fn}((Math.PI/180)*`);
        }
      } else {
        processed = processed.replace(regex, `Math.${fn}(`);
      }
    });

    processed = processed.replace(/diff\(([^,]+),([^)]+)\)/g, (_, funcBody, xVal) => {
      const h = 0.000001;
      const x = parseFloat(xVal);
      const f = (val: number) => eval(funcBody.replace(/\bx\b/g, `(${val})`));
      return ((f(x + h) - f(x - h)) / (2 * h)).toString();
    });

    processed = processed.replace(/(\d+)!/g, (_, n) => factorial(parseInt(n)).toString());

    const result = eval(processed);
    if (isNaN(result) || !isFinite(result)) return "Error";
    if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-12 && result !== 0)) {
      return result.toExponential(8);
    }
    return Number(result.toPrecision(12)).toString();
  } catch (err) {
    return "Error";
  }
};

const factorial = (n: number): number => {
  if (n < 0) return NaN;
  if (n === 0) return 1;
  let f = 1;
  for (let i = 2; i <= n; i++) f *= i;
  return f;
};
