var selectedCategory = 'ranks';
var selectedIndex = 1;
var selectedTerm = 'На месяц';
var FOREVER_FACTOR = 5;               // «Навсегда» стоит в 5 раз больше, чем «На месяц»
var categoriesWithTerm = ['ranks', 'other']; // у кейсов и осколков срока действия нет
var lastFocused = null;

var products = {
  ranks: [
    {name: 'Цербер', price: 14}, {name: 'Маркиз', price: 39}, {name: 'Граф', price: 59},
    {name: 'Орион', price: 99}, {name: 'Визирь', price: 149}, {name: 'Феникс', price: 239},
    {name: 'Рыцарь', price: 329}, {name: 'Правитель', price: 529}, {name: 'Властелин', price: 879}, {name: 'Император', price: 1299}
  ],
  cases: [{name: 'Стартовый кейс',price: 19},{name: 'Кейс исследователя',price: 49},{name: 'Кейс героя',price: 99},{name: 'Коллекция сезона',price: 149}],
  shards: [{name: '100 осколков',price: 29},{name: '300 осколков',price: 69},{name: '700 осколков',price: 129},{name: '1500 осколков',price: 249}],
  other: [{name: 'Цветной ник',price: 29},{name: 'Эффект появления',price: 49},{name: 'Набор эмоций',price: 79}]
};

function hasTerm() {
  return categoriesWithTerm.indexOf(selectedCategory) !== -1;
}
function priceFor(item, term) {
  return (hasTerm() && term === 'Навсегда') ? item.price * FOREVER_FACTOR : item.price;
}

function renderProducts(focusIndex) {
  var list = document.getElementById('product-list');
  if (!list) return;
  list.innerHTML = '';
  products[selectedCategory].forEach(function(item, index) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'product-row' + (index === selectedIndex ? ' chosen' : '');
    row.setAttribute('data-index', index);
    row.setAttribute('aria-pressed', index === selectedIndex ? 'true' : 'false');
    row.innerHTML = '<span>' + item.name + '</span><span class="product-price">от ' + item.price + ' ₽ ›</span>';
    list.appendChild(row);
  });
  if (typeof focusIndex === 'number') list.children[focusIndex].focus();

  var product = products[selectedCategory][selectedIndex];
  document.getElementById('preview-name').textContent = product.name;
  document.getElementById('product-name').textContent = product.name;
  var previewImage = document.getElementById('preview-image');
  var isCase = selectedCategory === 'cases';
  previewImage.src = isCase ? 'assets/images/chest.webp' : 'assets/images/player.webp';
  previewImage.width = isCase ? 640 : 850;
  previewImage.height = isCase ? 640 : 1317;
  var details = selectedCategory === 'ranks'
    ? '<li>Название в чате — <span>' + product.name + '</span></li><li>Оформление профиля — <span>цвет и стиль</span></li><li>Дополнительный набор — <span>предметы</span></li><li>Коллекция эффектов — <span>для персонажа</span></li>'
    : '<li>Выбранный набор — <span>' + product.name + '</span></li><li>Описание игровой коллекции</li><li>Содержимое можно посмотреть в каталоге</li>';
  document.getElementById('product-description').innerHTML = '<ul>' + details + '</ul>';

  // срок и цена: блок показывается только там, где срок имеет смысл
  document.getElementById('term-block').hidden = !hasTerm();
  document.querySelectorAll('.term').forEach(function(button) {
    var term = button.getAttribute('data-term');
    var active = term === selectedTerm;
    button.className = 'term' + (active ? ' selected' : '');
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.textContent = term + ' — ' + priceFor(product, term) + ' ₽';
  });
  document.getElementById('choose-product').textContent = 'Выбрать за ' + priceFor(product, selectedTerm) + ' ₽';
}

function setCategory(category) {
  selectedCategory = category;
  selectedIndex = 0;
  document.querySelectorAll('.tab').forEach(function(tab) {
    var active = tab.getAttribute('data-category') === category;
    tab.className = 'tab' + (active ? ' active' : '');
    tab.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  renderProducts();
}

function setTerm(term) {
  selectedTerm = term;
  renderProducts();
}

function openDialog(title, text) {
  lastFocused = document.activeElement;
  document.getElementById('dialog-title').textContent = title;
  document.getElementById('dialog-text').textContent = text;
  document.getElementById('dialog').classList.add('visible');
  document.getElementById('dialog-ok').focus();
}

function closeDialog() {
  var dialog = document.getElementById('dialog');
  if (!dialog.classList.contains('visible')) return;
  dialog.classList.remove('visible');
  if (lastFocused && document.body.contains(lastFocused)) lastFocused.focus();
  lastFocused = null;
}

function selectProduct() {
  var item = products[selectedCategory][selectedIndex];
  var text = 'Вы выбрали «' + item.name + '»';
  if (hasTerm()) text += ', срок: ' + selectedTerm.toLowerCase();
  text += ', стоимость ' + priceFor(item, selectedTerm) + ' ₽. Это демонстрация каталога: оплата и выдача игровых товаров недоступны.';
  openDialog(item.name, text);
}

function showReward(name) {
  openDialog(name, 'Пример награды «' + name + '». Здесь можно изучить оформление коллекции. Получение предметов на игровом сервере не подключено.');
}

function toggleRule(heading) {
  var rule = heading.parentNode;
  var open = rule.classList.toggle('open');
  heading.setAttribute('aria-expanded', open ? 'true' : 'false');
  heading.querySelector('b').textContent = open ? '−' : '+';
}

// один обработчик кликов на весь документ вместо отдельных onclick в разметке
document.addEventListener('click', function(event) {
  var target = event.target;
  var el;
  if (target.id === 'dialog') { closeDialog(); return; }
  if ((el = target.closest('.tab'))) { setCategory(el.getAttribute('data-category')); return; }
  if ((el = target.closest('.product-row'))) {
    selectedIndex = Number(el.getAttribute('data-index'));
    renderProducts(selectedIndex);
    return;
  }
  if ((el = target.closest('.term'))) { setTerm(el.getAttribute('data-term')); return; }
  if (target.closest('#choose-product')) { selectProduct(); return; }
  if ((el = target.closest('[data-reward]'))) { showReward(el.getAttribute('data-reward')); return; }
  if ((el = target.closest('.rule-heading'))) { toggleRule(el); return; }
  if (target.closest('#dialog-close') || target.closest('#dialog-ok')) { closeDialog(); }
});

// Escape закрывает окно, Tab не выходит за его пределы
document.addEventListener('keydown', function(event) {
  var dialog = document.getElementById('dialog');
  if (!dialog.classList.contains('visible')) return;
  if (event.key === 'Escape') { closeDialog(); return; }
  if (event.key === 'Tab') {
    var buttons = dialog.querySelectorAll('button');
    var first = buttons[0];
    var last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

renderProducts();
