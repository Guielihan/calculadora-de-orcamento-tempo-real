// estado da calculadora
let calculatorDisplay = '0';
let previousValue = new Decimal(0);
let operation = null;
let waitingForNewValue = false;

// elementos do DOM
const mainDisplay = document.getElementById('main-display');
const baseValueSpan = document.getElementById('base-value');
const planAdditionSpan = document.getElementById('plan-addition');

// planos
const planBasico = document.getElementById('plan-basico');
const planPremium = document.getElementById('plan-premium');
const planCompleto = document.getElementById('plan-completo');

// botões da calculadora
const btnAC = document.getElementById('btn-ac');
const btnBackspace = document.getElementById('btn-backspace');
const btnPercent = document.getElementById('btn-percent');
const btnDivide = document.getElementById('btn-divide');
const btnMultiply = document.getElementById('btn-multiply');
const btnSubtract = document.getElementById('btn-subtract');
const btnAdd = document.getElementById('btn-add');
const btnEquals = document.getElementById('btn-equals');
const btnComma = document.getElementById('btn-comma');
const btnReset = document.getElementById('btn-reset');

const numberButtons = {
    '0': document.getElementById('btn-0'),
    '1': document.getElementById('btn-1'),
    '2': document.getElementById('btn-2'),
    '3': document.getElementById('btn-3'),
    '4': document.getElementById('btn-4'),
    '5': document.getElementById('btn-5'),
    '6': document.getElementById('btn-6'),
    '7': document.getElementById('btn-7'),
    '8': document.getElementById('btn-8'),
    '9': document.getElementById('btn-9')
};

// acessibilidade: foco visível e rótulos para leitor de tela
const interactiveElements = document.querySelectorAll('button, input[type="checkbox"]');
interactiveElements.forEach(el => el.classList.add('focus-ring'));

const ariaMap = {
    'btn-ac': 'Limpar tudo',
    'btn-backspace': 'Apagar último dígito',
    'btn-percent': 'Porcentagem',
    'btn-divide': 'Dividir',
    'btn-multiply': 'Multiplicar',
    'btn-subtract': 'Subtrair',
    'btn-add': 'Somar',
    'btn-equals': 'Igual',
    'btn-comma': 'Adicionar vírgula',
    'btn-reset': 'Resetar calculadora e planos',
    'plan-basico': 'Selecionar plano Básico',
    'plan-premium': 'Selecionar plano Premium',
    'plan-completo': 'Selecionar plano Completo',
    'btn-0': 'Número 0',
    'btn-1': 'Número 1',
    'btn-2': 'Número 2',
    'btn-3': 'Número 3',
    'btn-4': 'Número 4',
    'btn-5': 'Número 5',
    'btn-6': 'Número 6',
    'btn-7': 'Número 7',
    'btn-8': 'Número 8',
    'btn-9': 'Número 9'
};

Object.entries(ariaMap).forEach(([id, label]) => {
    const el = document.getElementById(id);
    if (el) el.setAttribute('aria-label', label);
});

// helpers de formatação com decimal.js
function formatCurrency(value) {
    const dec = new Decimal(value || 0);
    const parts = dec.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${integerPart},${parts[1]}`;
}

function formatInputString(raw) {
    let displayValue = raw || '0';
    if (!displayValue.includes(',')) {
        const num = displayValue.replace(/\./g, '');
        displayValue = num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    } else {
        const parts = displayValue.split(',');
        const intPart = parts[0].replace(/\./g, '');
        const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        displayValue = `${formattedInt},${parts[1] || ''}`;
    }
    return displayValue || '0';
}

function parseDisplay(value) {
    const sanitized = (value || '0').replace(/\./g, '').replace(',', '.');
    try {
        return new Decimal(sanitized || '0');
    } catch {
        return new Decimal(0);
    }
}

function persistState() {
    localStorage.setItem('calcDisplay', calculatorDisplay);
    localStorage.setItem('planBasico', String(planBasico.checked));
    localStorage.setItem('planPremium', String(planPremium.checked));
    localStorage.setItem('planCompleto', String(planCompleto.checked));
}

function loadState() {
    const savedDisplay = localStorage.getItem('calcDisplay');
    if (savedDisplay) calculatorDisplay = savedDisplay;
    planBasico.checked = localStorage.getItem('planBasico') === 'true';
    planPremium.checked = localStorage.getItem('planPremium') === 'true';
    planCompleto.checked = localStorage.getItem('planCompleto') === 'true';
}

// atualiza total e exibições
function updatePlanTotal() {
    let planTotal = new Decimal(0);
    if (planBasico.checked) planTotal = planTotal.plus(127);
    if (planPremium.checked) planTotal = planTotal.plus(157);
    if (planCompleto.checked) planTotal = planTotal.plus(187);

    const calculatorDecimal = parseDisplay(calculatorDisplay);
    const total = calculatorDecimal.plus(planTotal);

    const formattedInput = formatInputString(calculatorDisplay);
    baseValueSpan.textContent = formattedInput || '0,00';
    planAdditionSpan.textContent = planTotal.gt(0) ? `+ ${formatCurrency(planTotal)}` : '';

    mainDisplay.textContent = `R$ ${formatCurrency(total)}`;
    persistState();
}

function updateCalculatorDisplay() {
    updatePlanTotal();
}

// entrada numérica
function inputNumber(num) {
    if (waitingForNewValue) {
        calculatorDisplay = num;
        waitingForNewValue = false;
    } else {
        let current = calculatorDisplay.replace(/\./g, '');
        if (current.includes(',')) {
            const parts = current.split(',');
            if (parts[1] && parts[1].length >= 2) {
                return; // limita 2 casas decimais
            }
        }
        calculatorDisplay = current === '0' ? num : current + num;
    }
    updateCalculatorDisplay();
}

function inputComma() {
    if (waitingForNewValue) {
        calculatorDisplay = '0,';
        waitingForNewValue = false;
    } else if (!calculatorDisplay.includes(',')) {
        calculatorDisplay = calculatorDisplay.replace(/\./g, '') + ',';
    }
    updateCalculatorDisplay();
}

function handleBackspace() {
    let current = calculatorDisplay.replace(/\./g, '');
    if (current.length > 1) {
        calculatorDisplay = current.slice(0, -1);
    } else {
        calculatorDisplay = '0';
    }
    updateCalculatorDisplay();
}

function handleAC() {
    calculatorDisplay = '0';
    previousValue = new Decimal(0);
    operation = null;
    waitingForNewValue = false;
    planBasico.checked = false;
    planPremium.checked = false;
    planCompleto.checked = false;
    updateCalculatorDisplay();
}

function handlePercent() {
    const num = parseDisplay(calculatorDisplay);
    const result = num.dividedBy(100).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    calculatorDisplay = result.toFixed(2).replace('.', ',');
    waitingForNewValue = true;
    updateCalculatorDisplay();
}

function performOperation() {
    if (!operation) return;

    const current = parseDisplay(calculatorDisplay);
    let result = previousValue;

    if (operation === '+') {
        result = previousValue.plus(current);
    } else if (operation === '-') {
        result = previousValue.minus(current);
    } else if (operation === '×') {
        result = previousValue.times(current);
    } else if (operation === '÷') {
        if (current.isZero()) {
            mainDisplay.textContent = 'Erro (divisão por 0)';
            baseValueSpan.textContent = '0,00';
            planAdditionSpan.textContent = '';
            calculatorDisplay = '0';
            operation = null;
            waitingForNewValue = true;
            persistState();
            return;
        }
        result = previousValue.dividedBy(current);
    }

    result = result.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    calculatorDisplay = result.toFixed(2).replace('.', ',');
    previousValue = result;
    operation = null;
    waitingForNewValue = true;
    updateCalculatorDisplay();
}

function setOperation(op) {
    if (operation && !waitingForNewValue) {
        performOperation();
    }
    previousValue = parseDisplay(calculatorDisplay);
    operation = op;
    waitingForNewValue = true;
}

// teclado
function handleKeyDown(e) {
    const key = e.key;
    if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        inputNumber(key);
        return;
    }
    if (key === ',' || key === '.') {
        e.preventDefault();
        inputComma();
        return;
    }
    if (key === '+' || key === '-') {
        e.preventDefault();
        setOperation(key);
        return;
    }
    if (key === '*' || key.toLowerCase() === 'x') {
        e.preventDefault();
        setOperation('×');
        return;
    }
    if (key === '/' || key === '÷') {
        e.preventDefault();
        setOperation('÷');
        return;
    }
    if (key === 'Enter' || key === '=') {
        e.preventDefault();
        performOperation();
        return;
    }
    if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
    }
    if (key === 'Escape') {
        e.preventDefault();
        handleAC();
        return;
    }
    if (key === '%') {
        e.preventDefault();
        handlePercent();
    }
}

// event listeners
Object.keys(numberButtons).forEach(num => {
    numberButtons[num].addEventListener('click', () => inputNumber(num));
});

btnAC.addEventListener('click', handleAC);
btnBackspace.addEventListener('click', handleBackspace);
btnPercent.addEventListener('click', handlePercent);
btnComma.addEventListener('click', inputComma);
btnEquals.addEventListener('click', performOperation);
btnAdd.addEventListener('click', () => setOperation('+'));
btnSubtract.addEventListener('click', () => setOperation('-'));
btnMultiply.addEventListener('click', () => setOperation('×'));
btnDivide.addEventListener('click', () => setOperation('÷'));
btnReset.addEventListener('click', handleAC);

planBasico.addEventListener('change', updatePlanTotal);
planPremium.addEventListener('change', updatePlanTotal);
planCompleto.addEventListener('change', updatePlanTotal);

document.addEventListener('keydown', handleKeyDown);

// inicializar
loadState();
updateCalculatorDisplay();