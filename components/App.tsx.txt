
import React, { useState, useEffect } from 'react';
import { AngleUnit, HistoryItem } from './types';
import { evaluateExpression, CONSTANTS } from './utils/mathUtils';
import Button from './components/Button';
0
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
    A: '0', B: '0', C: '0', D: '0', E: '0', F: '0'
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
    if (isShift) {
      handleShiftInput(val);
      setIsShift(false);
      return;
    }
    if (isSto) {
      handleStore(val);
      setIsSto(false);
      return;
    }
    if (isAlpha) {
      handleAlphaInput(val);
      setIsAlpha(false);
      return;
    }
    setInputBuffer(prev => prev === '0' ? val : prev + val);
  };

  const handleStore = (val: string) => {
    const vars: Record<string, string> = { '4': 'A', '5': 'B', '6': 'C', '1': 'D', '2': 'E', '3': 'F' };
    const selectedVar = vars[val];
    if (selectedVar) {
      setVariables(prev => ({ ...prev, [selectedVar]: display === 'Error' ? '0' : display }));
      setDisplay(`Stored to ${selectedVar}`);
      setTimeout(() => setDisplay(display), 800);
    }
  };

  const handleFunc = (func: string) => {
    if (!isOn) return;
    if (isShift) {
      handleShiftInput(func);
      setIsShift(false);
      return;
    }
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
      case 'AC': togglePower(); break; // SHIFT + AC = OFF
      case 'sum': setInputBuffer(p => p + '!'); break;
      case 'Pol': setInputBuffer(p => p + 'Rec('); break;
      default: setInputBuffer(p => p + val);
    }
  };

  const handleAlphaInput = (val: string) => {
    const vars: Record<string, string> = { '4': 'A', '5': 'B', '6': 'C', '1': 'D', '2': 'E', '3': 'F' };
    const selectedVar = vars[val];
    if (selectedVar) setInputBuffer(p => p + variables[selectedVar]);
  };

  const execute = () => {
    if (!isOn || mode === 'CATALOG') return;
    if (!inputBuffer && history.length > 0) return;
    const target = inputBuffer || display;
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

  const renderCatalog = () => (
    <div className="bg-[#abb59d] h-full overflow-y-auto p-2 font-mono text-[9px] scrollbar-hide">
      <div className="border-b border-black/30 pb-1 mb-2 font-black uppercase flex justify-between">
        <span>Analysis</span>
        <i className="fas fa-bolt"></i>
      </div>
      {['sum(', 'int(', 'diff(', 'gcd(', 'lcm(', 'floor('].map(f => (
        <div key={f} onClick={() => { setInputBuffer(p => p + f); setMode('CALC'); }} className="py-1 hover:bg-black/10 cursor-pointer rounded px-1 flex justify-between">
          <span>{f.replace('(', '')}</span>
          <span className="opacity-50 text-[7px]">FUNC</span>
        </div>
      ))}
    </div>
  );

  const renderHomeMenu = () => (
    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#abb59d] h-full overflow-y-auto scrollbar-hide">
      {[
        { id: 'CALC', icon: 'fa-calculator', label: 'Calc' },
        { id: 'STAT', icon: 'fa-chart-line', label: 'Stat' },
        { id: 'TABLE', icon: 'fa-table-cells', label: 'Table' },
        { id: 'BASE', icon: 'fa-hashtag', label: 'Base' },
        { id: 'CATALOG', icon: 'fa-book-atlas', label: 'Cat' },
        { id: 'COMPLEX', icon: 'fa-atom', label: 'Cplx' },
      ].map(app => (
        <div key={app.id} onClick={() => setMode(app.id as CasioMode)} className="flex flex-col items-center justify-center p-1.5 rounded border border-black/10 hover:bg-black/10 active:bg-black/20 cursor-pointer transition-all">
          <i className={`fas ${app.icon} text-base mb-0.5`}></i>
          <span className="text-[7px] font-bold uppercase tracking-tighter text-center leading-tight">{app.label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="casio-body">
      <div className="flex justify-between items-start mb-2 px-1">
        <div className="pt-0.5">
          <h1 className="text-white font-black text-xl italic tracking-tighter leading-none opacity-95">CASIO</h1>
          <p className="text-[#888] text-[8px] font-bold mt-0.5 tracking-[0.1em] uppercase">
            ClassWiz <span className="text-blue-500/60">fx-Eng Ultimate</span>
          </p>
          <p className="text-[#555] text-[6px] font-black mt-1 tracking-[0.2em] uppercase leading-none">
            BY SAROJ KUMAR CHAUDHARY
          </p>
        </div>
        <div className="relative bg-[#1a0a0a] w-24 h-6 rounded border border-black flex gap-1 p-0.5 shadow-2xl overflow-hidden group">
          {[1,2,3].map(i => <div key={i} className="flex-1 bg-gradient-to-b from-[#4a1a1a] to-[#1a0a0a] rounded-sm relative"></div>)}
        </div>
      </div>

      <div className="casio-screen-bezel">
        <div className={`casio-screen transition-colors duration-500 flex flex-col font-mono relative ${!isOn ? 'bg-[#050505]' : 'bg-[#abb59d]'}`}>
          {isOn && (
            <>
              {mode === 'HOME' ? renderHomeMenu() : mode === 'CATALOG' ? renderCatalog() : (
                <div className="flex flex-col h-full lcd-text">
                  <div className="flex justify-between items-center text-[8px] font-bold border-b border-black/10 pb-0.5 mb-0.5">
                    <div className="flex gap-1">
                      <span className={isShift ? "bg-black text-[#abb59d] px-1 rounded-sm shadow-sm" : "opacity-10"}>S</span>
                      <span className={isAlpha ? "bg-red-900 text-white px-1 rounded-sm shadow-sm" : "opacity-10"}>A</span>
                      <span className={isSto ? "bg-blue-900 text-white px-1 rounded-sm shadow-sm" : "opacity-10"}>STO</span>
                      <span className="ml-1 uppercase">{unit}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="fas fa-qrcode text-[7px] opacity-40"></i>
                      <span>MathI</span>
                    </div>
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <div className="text-[10px] opacity-70 h-4 overflow-hidden text-right font-semibold italic">
                      {inputBuffer || (history.length > 0 ? history[0].expression : '0')}
                    </div>
                    <div className="text-2xl font-bold tracking-tighter text-right w-full break-all leading-none py-1">
                      {display}
                    </div>
                  </div>
                  <div className="flex justify-between items-end text-[7px] font-black border-t border-black/5 pt-0.5 mt-auto">
                    <span className="tracking-widest opacity-40 uppercase">{mode} MODE</span>
                    <span className="opacity-60 italic">EngV.P.A.M.</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="casio-grid !mt-1">
        {/* MODIFIER ROW */}
        <Button label="ON" type="shift" onClick={togglePower} className={!isOn ? "animate-pulse !bg-orange-600 shadow-[0_4px_0_#992200]" : "!bg-gray-600"} />
        <Button label="SHIFT" type="shift" onClick={() => setIsShift(!isShift)} />
        <Button label="ALPHA" className="bg-[#991b1b] shadow-[0_4px_0_#7f1d1d]" onClick={() => setIsAlpha(!isAlpha)} />
        <Button label={<span className="italic">f(x)</span>} subLabel="STO" onClick={() => setIsSto(!isSto)} type="op" />
        <Button label="MENU" subLabel="OFF" type="op" onClick={() => setMode('HOME')} />

        {/* NEW ADVANCED ROW 1: Suffixes & Engineering */}
        <Button label="µ" subLabel="n" onClick={() => handleInput('µ')} type="func" />
        <Button label="m" subLabel="p" onClick={() => handleInput('m')} type="func" />
        <Button label="k" subLabel="M" onClick={() => handleInput('k')} type="func" />
        <Button label="G" subLabel="T" onClick={() => handleInput('G')} type="func" />
        <Button label="CONST" subLabel="CONV" onClick={() => setMode('CATALOG')} type="func" />

        {/* NEW ADVANCED ROW 2: Stats & Probability */}
        <Button label="nPr" subLabel="P" onClick={() => handleInput('P')} type="func" />
        <Button label="nCr" subLabel="C" onClick={() => handleInput('C')} type="func" />
        <Button label="Pol" subLabel="Rec" onClick={() => handleInput('Pol(')} type="func" />
        <Button label="Ran#" subLabel="RanInt" onClick={() => handleInput('Math.random()')} type="func" />
        <Button label="x!" subLabel="%" onClick={() => handleInput('!')} type="func" />

        {/* ANALYSIS ROW */}
        <Button label="∫dx" subLabel="d/dx" onClick={() => handleInput('int(')} type="func" />
        <Button label="Σ" subLabel="PROD" onClick={() => handleInput('sum(')} type="func" />
        <Button label="Abs" subLabel="Mod" onClick={() => handleFunc('abs')} type="func" />
        <Button label="hyp" subLabel="ENG" onClick={() => handleFunc('sinh')} type="func" />
        <Button label="i" subLabel="∠" onClick={() => handleInput('i')} type="func" />

        {/* BASIC MATH ROW */}
        <Button label={<span className="italic">x</span>} onClick={() => handleInput('x')} type="func" />
        <Button label="√" subLabel="∛" onClick={() => handleFunc('√')} type="func" />
        <Button label="xⁿ" subLabel="ⁿ√" onClick={() => handleInput('^')} type="func" />
        <Button label="log" subLabel="ln" onClick={() => handleFunc('log')} type="func" />
        <Button label="(-)" onClick={() => handleInput('-')} type="func" />

        {/* TRIG ROW */}
        <Button label="sin" subLabel="sin⁻¹" onClick={() => handleFunc('sin')} type="func" />
        <Button label="cos" subLabel="cos⁻¹" onClick={() => handleFunc('cos')} type="func" />
        <Button label="tan" subLabel="tan⁻¹" onClick={() => handleFunc('tan')} type="func" />
        <Button label="(" onClick={() => handleInput('(')} type="func" />
        <Button label=")" onClick={() => handleInput(')')} type="func" />

        {/* NUMBERS 7-9 */}
        <Button label="7" subLabel="DEC" onClick={() => handleInput('7')} />
        <Button label="8" subLabel="HEX" onClick={() => handleInput('8')} />
        <Button label="9" subLabel="BIN" onClick={() => handleInput('9')} />
        <Button label={<i className="fas fa-backspace text-sm"></i>} type="action" onClick={() => setInputBuffer(d => d.slice(0,-1))} />
        <Button label="AC" subLabel="OFF" type="action" className="bg-[#cc3300] shadow-[0_4px_0_#992200]" onClick={() => { setDisplay('0'); setInputBuffer(''); }} />

        {/* NUMBERS 4-6 */}
        <Button label="4" subLabel="A" subLabelColor="red" onClick={() => handleInput('4')} />
        <Button label="5" subLabel="B" subLabelColor="red" onClick={() => handleInput('5')} />
        <Button label="6" subLabel="C" subLabelColor="red" onClick={() => handleInput('6')} />
        <Button label="×" onClick={() => handleInput('×')} type="op" />
        <Button label="÷" onClick={() => handleInput('÷')} type="op" />

        {/* NUMBERS 1-3 */}
        <Button label="1" subLabel="D" subLabelColor="red" onClick={() => handleInput('1')} />
        <Button label="2" subLabel="E" subLabelColor="red" onClick={() => handleInput('2')} />
        <Button label="3" subLabel="F" subLabelColor="red" onClick={() => handleInput('3')} />
        <Button label="+" onClick={() => handleInput('+')} type="op" />
        <Button label="-" onClick={() => handleInput('-')} type="op" />

        {/* BOTTOM ROW */}
        <Button label="0" subLabel="OCT" onClick={() => handleInput('0')} />
        <Button label="." onClick={() => handleInput('.')} />
        <Button label="EXP" subLabel="π" onClick={() => handleInput('x10^')} />
        <Button label="Ans" type="action" onClick={() => handleInput('Ans')} />
        <Button label="=" type="op" onClick={execute} className="bg-[#0a0a0a] ring-1 ring-white/10 shadow-[0_4px_0_#000]" />
      </div>

      <div className="mt-2 text-center text-[#444] text-[6px] font-black tracking-[0.2em] uppercase opacity-30">
        Professional Engineering Standard
      </div>
    </div>
  );
};

export default App;
