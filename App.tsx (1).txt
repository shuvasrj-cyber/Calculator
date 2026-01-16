
import React, { useState } from 'react';
import { AngleUnit, HistoryItem } from './types';
import { evaluateExpression } from './utils/mathUtils';
import Button from './components/Button';

type CasioMode = 'CALC' | 'HOME' | 'STAT' | 'TABLE' | 'COMPLEX' | 'CATALOG' | 'BASE';

const App: React.FC = () => {
  const [isOn, setIsOn] = useState(true);
  const [display, setDisplay] = useState('0');
  const [inputBuffer, setInputBuffer] = useState('');
  const [mode, setMode] = useState<CasioMode>('HOME');
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);
  const [isSto, setIsSto] = useState(false);
  const [unit, setUnit] = useState<AngleUnit>('deg');
  const [ans, setAns] = useState('0');
  const [variables, setVariables] = useState<Record<string, string>>({
    A: '0', B: '0', C: '0', D: '0', E: '0', F: '0', X: '0', Y: '0', M: '0'
  });
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const togglePower = () => {
    if (!isOn) {
      setIsOn(true);
      setDisplay('WELCOME');
      setTimeout(() => setDisplay('0'), 800);
    } else {
      setIsOn(false);
      setInputBuffer('');
      setIsShift(false);
      setIsAlpha(false);
      setIsSto(false);
    }
  };

  const handleInput = (val: string) => {
    if (!isOn) return;
    if (isShift) { handleShiftInput(val); setIsShift(false); return; }
    if (isSto) { handleStore(val); setIsSto(false); return; }
    if (isAlpha) { handleAlphaInput(val); setIsAlpha(false); return; }
    setInputBuffer(prev => prev === '0' ? val : prev + val);
  };

  const handleStore = (val: string) => {
    const vars: Record<string, string> = { 
        '4': 'A', '5': 'B', '6': 'C', '1': 'D', '2': 'E', '3': 'F',
        '7': 'X', '8': 'Y', '9': 'M'
    };
    const selectedVar = vars[val];
    if (selectedVar) {
      setVariables(prev => ({ ...prev, [selectedVar]: display === 'Error' ? '0' : display }));
      setDisplay(`Stored to ${selectedVar}`);
      setTimeout(() => setDisplay(display), 800);
    }
  };

  const handleFunc = (func: string) => {
    if (!isOn) return;
    if (isShift) { handleShiftInput(func); setIsShift(false); return; }
    const val = `${func}(`;
    setInputBuffer(prev => prev === '0' ? val : prev + val);
  };

  const handleShiftInput = (val: string) => {
    switch(val) {
      case '7': setInputBuffer(p => p + 'π'); break;
      case '8': setInputBuffer(p => p + 'e'); break;
      case 'sin': setInputBuffer(p => p + 'asin('); break;
      case 'cos': setInputBuffer(p => p + 'acos('); break;
      case 'tan': setInputBuffer(p => p + 'atan('); break;
      case '√': setInputBuffer(p => p + '∛('); break;
      case 'int': setInputBuffer(p => p + 'diff('); break;
      case 'AC': togglePower(); break; 
      case 'sum': setInputBuffer(p => p + '!'); break;
      case 'Pol': setInputBuffer(p => p + 'Rec('); break;
      case 'exp': setInputBuffer(p => p + '10^'); break;
      case 'log': setInputBuffer(p => p + 'ln('); break;
      case 'hyp': setInputBuffer(p => p + 'asinh('); break;
      default: setInputBuffer(p => p + val);
    }
  };

  const handleAlphaInput = (val: string) => {
    const vars: Record<string, string> = { 
        '4': 'A', '5': 'B', '6': 'C', '1': 'D', '2': 'E', '3': 'F',
        '7': 'X', '8': 'Y', '9': 'M'
    };
    const selectedVar = vars[val];
    if (selectedVar) setInputBuffer(p => p + variables[selectedVar]);
    else if (val === 'sin') setInputBuffer(p => p + ':');
  };

  const execute = () => {
    if (!isOn || mode === 'CATALOG') return;
    const target = inputBuffer || display;
    if (target === '0' || !target) return;
    const result = evaluateExpression(target, unit, ans);
    if (result !== 'Error') {
      setAns(result);
      setHistory(prev => [{ id: Date.now().toString(), expression: target, result, timestamp: Date.now() }, ...prev]);
      setDisplay(result);
      setInputBuffer('');
    } else {
      setDisplay('Error');
    }
  };

  const renderHomeMenu = () => (
    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#abb59d] h-full overflow-y-auto">
      {[
        { id: 'CALC', icon: 'fa-calculator', label: 'Calc' },
        { id: 'STAT', icon: 'fa-chart-line', label: 'Stat' },
        { id: 'TABLE', icon: 'fa-table-cells', label: 'Table' },
        { id: 'BASE', icon: 'fa-hashtag', label: 'Base' },
        { id: 'CATALOG', icon: 'fa-book-atlas', label: 'Cat' },
        { id: 'COMPLEX', icon: 'fa-atom', label: 'Cplx' },
      ].map(app => (
        <div key={app.id} onClick={() => setMode(app.id as CasioMode)} className="flex flex-col items-center justify-center p-1.5 border border-black/10 hover:bg-black/10 cursor-pointer rounded">
          <i className={`fas ${app.icon} text-base mb-0.5`}></i>
          <span className="text-[7px] font-bold uppercase">{app.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="casio-body">
      <div className="flex justify-between items-start mb-1 px-1 flex-shrink-0">
        <div className="pt-0.5">
          <h1 className="text-white font-black text-xl italic tracking-tighter leading-none opacity-95">CASIO</h1>
          <p className="text-[#888] text-[7px] font-bold mt-0.5 uppercase">ClassWiz <span className="text-blue-500/60">fx-Eng Pro</span></p>
          <p className="text-[#555] text-[5px] font-black mt-0.5 tracking-[0.2em] uppercase">BY SAROJ KUMAR CHAUDHARY</p>
        </div>
        <div className="relative bg-[#1a0a0a] w-20 h-5 rounded border border-black flex gap-1 p-0.5 shadow-inner">
          {[1,2,3].map(i => <div key={i} className="flex-1 bg-gradient-to-b from-[#4a1a1a] to-[#1a0a0a] rounded-sm"></div>)}
        </div>
      </div>

      <div className="casio-screen-bezel flex-shrink-0">
        <div className={`casio-screen transition-colors duration-500 flex flex-col font-mono relative ${!isOn ? 'bg-[#050505]' : 'bg-[#abb59d]'}`}>
          {isOn && (
            <>
              {mode === 'HOME' ? renderHomeMenu() : (
                <div className="flex flex-col h-full lcd-text">
                  <div className="flex justify-between text-[8px] font-bold border-b border-black/10 mb-0.5">
                    <div className="flex gap-1">
                      <span className={isShift ? "bg-black text-[#abb59d] px-1" : "opacity-10"}>S</span>
                      <span className={isAlpha ? "bg-red-900 text-white px-1" : "opacity-10"}>A</span>
                      <span className={isSto ? "bg-blue-900 text-white px-1" : "opacity-10"}>STO</span>
                      <span className="uppercase">{unit}</span>
                    </div>
                    <span>MathI</span>
                  </div>
                  <div className="flex-grow flex flex-col justify-end">
                    <div className="text-[10px] opacity-70 h-4 text-right overflow-hidden whitespace-nowrap">{inputBuffer || ' '}</div>
                    <div className="text-2xl font-bold text-right py-1 tracking-tighter overflow-hidden">{display}</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="casio-grid !mt-1 overflow-y-auto pr-1">
        {/* Row 1 */}
        <Button label="ON" type="shift" onClick={togglePower} className={!isOn ? "animate-pulse !bg-orange-600 shadow-[0_4px_0_#920]" : "!bg-gray-600"} />
        <Button label="SHIFT" type="shift" onClick={() => setIsShift(!isShift)} />
        <Button label="ALPHA" className="bg-[#991b1b]" onClick={() => setIsAlpha(!isAlpha)} />
        <Button label={<span className="italic">f(x)</span>} subLabel="STO" onClick={() => setIsSto(!isSto)} type="op" />
        <Button label="MENU" type="op" onClick={() => setMode('HOME')} />

        {/* NEW EXTRA Row 2: Statistics & Distribution */}
        <Button label="STAT" subLabel="DIST" onClick={() => setMode('STAT')} type="func" />
        <Button label="nCr" subLabel="nPr" onClick={() => handleInput('C')} type="func" />
        <Button label="FACT" subLabel="PRIM" onClick={() => handleInput('!')} type="func" />
        <Button label="VERIF" subLabel="TRUE" onClick={() => handleInput('==')} type="func" />
        <Button label="BASE" subLabel="DEC" onClick={() => setMode('BASE')} type="func" />

        {/* NEW EXTRA Row 3: Vector & Matrix Utilities */}
        <Button label="VCTR" subLabel="DOT" onClick={() => handleInput('dot(')} type="func" />
        <Button label="MAT" subLabel="DET" onClick={() => handleInput('det(')} type="func" />
        <Button label="SOLVE" subLabel="=" onClick={() => handleInput('=')} type="func" />
        <Button label="CALC" subLabel=":" onClick={() => handleInput(':')} type="func" />
        <Button label="ENG" subLabel="←" onClick={() => handleInput('ENG')} type="func" />

        {/* Existing Row 4: Constants */}
        <Button label="CONST" subLabel="CONV" onClick={() => setMode('CATALOG')} type="func" />
        <Button label="hyp" subLabel="h⁻¹" onClick={() => handleFunc('sinh')} type="func" />
        <Button label="QR" subLabel="SET" onClick={() => handleInput('QR')} type="func" />
        <Button label="x!" subLabel="%" onClick={() => handleInput('!')} type="func" />
        <Button label="∫dx" subLabel="d/dx" onClick={() => handleInput('int(')} type="func" />

        {/* Existing Row 5: Prefixes */}
        <Button label="µ" subLabel="n" onClick={() => handleInput('µ')} type="func" />
        <Button label="m" subLabel="p" onClick={() => handleInput('m')} type="func" />
        <Button label="k" subLabel="M" onClick={() => handleInput('k')} type="func" />
        <Button label="G" subLabel="T" onClick={() => handleInput('G')} type="func" />
        <Button label="Σ" subLabel="PROD" onClick={() => handleInput('sum(')} type="func" />

        {/* Existing Row 6: Logic */}
        <Button label="Ran#" subLabel="RanInt" onClick={() => handleInput('Math.random()')} type="func" />
        <Button label="Pol" subLabel="Rec" onClick={() => handleFunc('Pol')} type="func" />
        <Button label="gcd" subLabel="lcm" onClick={() => handleFunc('gcd')} type="func" />
        <Button label="i" subLabel="∠" onClick={() => handleInput('i')} type="func" />
        <Button label="Abs" subLabel="arg" onClick={() => handleFunc('abs')} type="func" />

        {/* Existing Row 7: Power */}
        <Button label="xⁿ" subLabel="ⁿ√" onClick={() => handleInput('^')} type="func" />
        <Button label="√" subLabel="∛" onClick={() => handleFunc('√')} type="func" />
        <Button label="log" subLabel="10ⁿ" onClick={() => handleFunc('log')} type="func" />
        <Button label="ln" subLabel="eⁿ" onClick={() => handleFunc('ln')} type="func" />
        <Button label="sin" subLabel="sin⁻¹" onClick={() => handleFunc('sin')} type="func" />

        {/* Existing Row 8: Trig */}
        <Button label="cos" subLabel="cos⁻¹" onClick={() => handleFunc('cos')} type="func" />
        <Button label="tan" subLabel="tan⁻¹" onClick={() => handleFunc('tan')} type="func" />
        <Button label="(" onClick={() => handleInput('(')} type="func" />
        <Button label=")" onClick={() => handleInput(')')} type="func" />
        <Button label="DEL" type="action" onClick={() => setInputBuffer(d => d.slice(0,-1))} />

        {/* Existing Row 9: Numbers 7-9 */}
        <Button label="7" subLabel="X" subLabelColor="red" onClick={() => handleInput('7')} />
        <Button label="8" subLabel="Y" subLabelColor="red" onClick={() => handleInput('8')} />
        <Button label="9" subLabel="M" subLabelColor="red" onClick={() => handleInput('9')} />
        <Button label="AC" type="action" className="bg-[#cc3300]" onClick={() => { setDisplay('0'); setInputBuffer(''); }} />
        <Button label="×" onClick={() => handleInput('×')} type="op" />

        {/* Existing Row 10: Numbers 4-6 */}
        <Button label="4" subLabel="A" subLabelColor="red" onClick={() => handleInput('4')} />
        <Button label="5" subLabel="B" subLabelColor="red" onClick={() => handleInput('5')} />
        <Button label="6" subLabel="C" subLabelColor="red" onClick={() => handleInput('6')} />
        <Button label="÷" onClick={() => handleInput('÷')} type="op" />
        <Button label="+" onClick={() => handleInput('+')} type="op" />

        {/* Existing Row 11: Numbers 1-3 */}
        <Button label="1" subLabel="D" subLabelColor="red" onClick={() => handleInput('1')} />
        <Button label="2" subLabel="E" subLabelColor="red" onClick={() => handleInput('2')} />
        <Button label="3" subLabel="F" subLabelColor="red" onClick={() => handleInput('3')} />
        <Button label="-" onClick={() => handleInput('-')} type="op" />
        <Button label="Ans" type="action" onClick={() => handleInput('Ans')} />

        {/* Row 12: Bottom Row */}
        <Button label="0" onClick={() => handleInput('0')} />
        <Button label="." subLabel="i" onClick={() => handleInput('.')} />
        <Button label="EXP" subLabel="π" onClick={() => handleInput('x10^')} />
        <Button label="=" type="op" onClick={execute} className="bg-black col-span-2 ring-1 ring-white/20 shadow-[0_4px_0_#000]" />
      </div>

      <div className="mt-auto pt-1 text-center flex-shrink-0">
        <span className="text-[5px] text-[#444] font-bold tracking-widest uppercase opacity-40">Engineering Ultimate Precision Engine v4.5</span>
      </div>
    </div>
  );
};

export default App;
