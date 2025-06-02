const seatingArea = document.getElementById('seatingArea');
const selectSeatBtn = document.getElementById('selectSeatBtn');
const nextBtn = document.getElementById('nextBtn');
const menuBtn = document.getElementById('menuBtn');
const menuSection = document.getElementById('menuSection');
const orderBtn = document.getElementById('orderBtn');
const resultSection = document.getElementById('resultSection');
const homeBtn = document.getElementById('homeBtn');
const cookTimeDisplay = document.getElementById('cookTime');
const waitTimeMessage = document.getElementById('waitTimeMessage');
const finalSummaryList = document.getElementById('finalSummaryList');
const finalTotalPrice = document.getElementById('finalTotalPrice');
const orderDateTime = document.getElementById('orderDateTime');

let seatStatus = JSON.parse(localStorage.getItem('seatStatus')) || {};

const tables = [
  { id: 'T1', seats: 2, cols: 2 },
  { id: 'T2', seats: 2, cols: 2 },
  { id: 'T3', seats: 4, cols: 2 },
  { id: 'T4', seats: 4, cols: 2 },
  { id: 'T5', seats: 6, cols: 3 },
  { id: 'T6', seats: 6, cols: 3 },
];

const prices = { 
  Pizza: 70, Burger: 50, Fries: 100, Pasta: 50, Noodles: 40, MilkShake: 120, 
  Samosa: 10, Sandwiches: 40, FriedChicken: 70, Roll: 50, Donuts: 70, hotdog: 70 
};

function playSound() {
  const clickSound = document.getElementById('clickSound');
  clickSound.currentTime = 0;
  clickSound.play();
}

function createTable(table) {
  const div = document.createElement('div');
  div.className = 'table';
  div.style.gridTemplateColumns = `repeat(${table.cols}, 30px)`;

  const label = document.createElement('div');
  label.className = 'table-label';
  label.innerText = `${table.id} (${table.seats}-seater)`;
  label.style.gridColumn = `span ${table.cols}`;
  div.appendChild(label);

  for (let i = 0; i < table.seats; i++) {
    const seatId = `${table.id}_S${i}`;
    if (!seatStatus[seatId]) seatStatus[seatId] = 'available';

    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.id = seatId;
    updateSeatVisual(seat, seatStatus[seatId]);

    seat.onclick = () => {
      if (seatStatus[seatId] === 'booked') return;
      playSound();
      seatStatus[seatId] = seatStatus[seatId] === 'selected' ? 'available' : 'selected';
      updateSeatVisual(seat, seatStatus[seatId]);
    };

    div.appendChild(seat);
  }
  seatingArea.appendChild(div);
}

function updateSeatVisual(element, status) {
  element.className = 'seat';
  if (status === 'booked') element.classList.add('booked');
  else if (status === 'selected') element.classList.add('selected');
}

selectSeatBtn.onclick = () => {
  playSound();
  selectSeatBtn.style.display = 'none';
  seatingArea.style.display = 'grid';
  nextBtn.style.display = 'inline-block';
  seatingArea.innerHTML = '';
  tables.forEach(createTable);
  waitTimeMessage.style.display = 'none';
  menuBtn.style.display = 'none';
  menuSection.style.display = 'none';
  orderBtn.style.display = 'none';
  resultSection.style.display = 'none';
  homeBtn.style.display = 'none';
};

nextBtn.onclick = () => {
  playSound();
  const selectedSeats = Object.entries(seatStatus).filter(([_, v]) => v === 'selected');
  if (selectedSeats.length === 0) {
    alert('Please select at least one seat!');
    return;
  }

  selectedSeats.forEach(([key]) => {
    seatStatus[key] = 'booked';
  });

  const bookedCount = Object.values(seatStatus).filter((status) => status === 'booked').length;
  const waitingTime = bookedCount * 7;

  localStorage.setItem('seatStatus', JSON.stringify(seatStatus));

  seatingArea.style.display = 'none';
  nextBtn.style.display = 'none';

  waitTimeMessage.style.display = 'block';
  waitTimeMessage.textContent = `Your waiting time is ${waitingTime} minutes. Please check the menu.`;

  menuBtn.style.display = 'inline-block';
};

menuBtn.onclick = () => {
  playSound();
  menuBtn.style.display = 'none';
  menuSection.style.display = 'block';
  waitTimeMessage.style.display = 'none';
  resultSection.style.display = 'none';
  homeBtn.style.display = 'none';
  orderBtn.style.display = 'inline-block';

  // Reset all number inputs to 0
  menuSection.querySelectorAll('input[type="number"]').forEach((input) => input.value = 0);
};

orderBtn.onclick = () => {
  playSound();
  const inputs = Array.from(menuSection.querySelectorAll('input[type="number"]'));
  const selectedItems = inputs
    .filter(input => parseInt(input.value) > 0)
    .map(input => ({
      name: input.dataset.name,
      quantity: parseInt(input.value),
      time: parseInt(input.dataset.time),
      price: prices[input.dataset.name]
    }));

  if (selectedItems.length === 0) {
    alert('Please select at least one item.');
    return;
  }

  const cooks = 3;
  const totalTime = selectedItems.reduce((sum, item) => sum + (item.time * item.quantity), 0);
const cookTime = Math.ceil(totalTime / cooks);



  let total = 0;
  finalSummaryList.innerHTML = '';
  selectedItems.forEach(item => {
    const li = document.createElement('li');
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    li.textContent = `${item.name} x ${item.quantity} = ₹${itemTotal}`;
    finalSummaryList.appendChild(li);
  });

  const now = new Date();
  cookTimeDisplay.textContent = `Estimated cooking time: ${cookTime} minutes`;
  orderDateTime.textContent = `Order placed on: ${now.toLocaleString()}`;
  finalTotalPrice.textContent = total;

  menuSection.style.display = 'none';
  resultSection.style.display = 'block';
  homeBtn.style.display = 'inline-block';
};

homeBtn.onclick = () => {
  playSound();
  resultSection.style.display = 'none';
  homeBtn.style.display = 'none';
  selectSeatBtn.style.display = 'inline-block';
  waitTimeMessage.style.display = 'none';
  menuBtn.style.display = 'none';
  menuSection.style.display = 'none';
  orderBtn.style.display = 'none';

  Object.keys(seatStatus).forEach((key) => {
    if (seatStatus[key] === 'selected') seatStatus[key] = 'available';
  });

  localStorage.setItem('seatStatus', JSON.stringify(seatStatus));
};

window.onbeforeunload = () => {
  localStorage.removeItem('seatStatus');
};
