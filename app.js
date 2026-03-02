// 数据存储
let state = {
    tasks: [],
    totalPoints: 0,
    shop: [],
    history: []
};

// 从 localStorage 加载
function loadState() {
    const saved = localStorage.getItem('babyReward');
    if (saved) {
        state = JSON.parse(saved);
    } else {
        // 初始示例数据
        state.tasks = [
            { id: Date.now(), name: '准时起床', points: 2, completed: false },
            { id: Date.now()+1, name: '自己刷牙', points: 1, completed: false },
            { id: Date.now()+2, name: '收拾玩具', points: 1, completed: false }
        ];
        state.totalPoints = 0;
        state.shop = [
            { id: Date.now()+3, name: '小玩具车', points: 10, link: 'https://s.click.taobao.com/xxxx', image: '' },
            { id: Date.now()+4, name: '冰淇淋', points: 5, link: 'https://s.click.taobao.com/yyyy', image: '' }
        ];
        state.history = [];
        saveState();
    }
    updateUI();
}

function saveState() {
    localStorage.setItem('babyReward', JSON.stringify(state));
    updateUI();
}

// 更新所有UI
function updateUI() {
    // 家长端
    document.getElementById('totalPoints').innerText = state.totalPoints;
    renderTaskList();
    renderShopList();
    renderHistory();

    // 孩子端
    document.getElementById('childPoints').innerText = state.totalPoints;
    renderChildTasks();
    renderChildShop();
}

// 家长端任务列表
function renderTaskList() {
    const container = document.getElementById('taskList');
    container.innerHTML = '';
    state.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-points">+${task.points}</span>
            <div class="task-actions">
                ${!task.completed ? `<button onclick="completeTask(${task.id})">✅</button>` : ''}
                <button onclick="deleteTask(${task.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 孩子端任务列表（不可操作，只展示已完成和未完成）
function renderChildTasks() {
    const container = document.getElementById('childTaskList');
    container.innerHTML = '';
    state.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item`;
        div.innerHTML = `
            <span class="task-name">${task.name} ${task.completed ? '✅' : ''}</span>
            <span class="task-points">+${task.points}</span>
        `;
        container.appendChild(div);
    });
}

// 家长端商店
function renderShopList() {
    const container = document.getElementById('shopList');
    container.innerHTML = '';
    state.shop.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <span class="task-points">需要 ${item.points} 积分</span>
            </div>
            <div class="shop-actions">
                <button onclick="deleteShopItem(${item.id})">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });
}

// 孩子端商店（可点击购买）
function renderChildShop() {
    const container = document.getElementById('childShopList');
    container.innerHTML = '';
    state.shop.forEach(item => {
        const canBuy = state.totalPoints >= item.points;
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <span class="task-points">需要 ${item.points} 积分</span>
            </div>
            <button ${!canBuy ? 'disabled' : ''} onclick="buyItem(${item.id})">
                ${canBuy ? '💰 购买' : '❌ 积分不够'}
            </button>
        `;
        container.appendChild(div);
    });
}

// 购买商品（跳转推广链接）
function buyItem(id) {
    const item = state.shop.find(i => i.id === id);
    if (!item) return;
    if (state.totalPoints < item.points) {
        alert('积分不够哦，再努力完成更多任务吧！');
        return;
    }
    if (confirm(`确定用 ${item.points} 积分兑换 ${item.name} 吗？`)) {
        // 扣除积分
        state.totalPoints -= item.points;
        // 记录历史
        state.history.push({
            item: item.name,
            points: item.points,
            date: new Date().toLocaleString()
        });
        saveState();
        // 跳转到推广链接（家长实际购买）
        if (item.link) {
            window.open(item.link, '_blank');
        } else {
            alert('商品链接未设置，家长可自行购买。');
        }
    }
}

// 完成任务（家长操作）
window.completeTask = function(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task && !task.completed) {
        task.completed = true;
        state.totalPoints += task.points;
        saveState();
    }
};

// 删除任务
window.deleteTask = function(id) {
    if (confirm('确定删除该任务吗？')) {
        state.tasks = state.tasks.filter(t => t.id !== id);
        saveState();
    }
};

// 删除商品
window.deleteShopItem = function(id) {
    if (confirm('确定删除该商品吗？')) {
        state.shop = state.shop.filter(i => i.id !== id);
        saveState();
    }
};

// 添加任务弹窗逻辑
const taskModal = document.getElementById('taskModal');
const addTaskBtn = document.getElementById('addTaskBtn');
const closeTaskModal = taskModal.querySelector('.close');
const saveTaskBtn = document.getElementById('saveTaskBtn');

addTaskBtn.onclick = () => {
    taskModal.style.display = 'flex';
    document.getElementById('taskName').value = '';
    document.getElementById('taskPoints').value = '';
};
closeTaskModal.onclick = () => taskModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === taskModal) taskModal.style.display = 'none';
    if (e.target === shopModal) shopModal.style.display = 'none';
};

saveTaskBtn.onclick = () => {
    const name = document.getElementById('taskName').value.trim();
    const points = parseInt(document.getElementById('taskPoints').value);
    if (!name || isNaN(points) || points <= 0) {
        alert('请填写任务名称和有效积分');
        return;
    }
    state.tasks.push({
        id: Date.now(),
        name,
        points,
        completed: false
    });
    saveState();
    taskModal.style.display = 'none';
};

// 添加商品弹窗逻辑
const shopModal = document.getElementById('shopModal');
const addShopBtn = document.getElementById('addShopBtn');
const closeShopModal = shopModal.querySelector('.close');
const saveShopBtn = document.getElementById('saveShopBtn');

addShopBtn.onclick = () => {
    shopModal.style.display = 'flex';
    document.getElementById('shopName').value = '';
    document.getElementById('shopPoints').value = '';
    document.getElementById('shopLink').value = '';
    document.getElementById('shopImage').value = '';
};
closeShopModal.onclick = () => shopModal.style.display = 'none';

saveShopBtn.onclick = () => {
    const name = document.getElementById('shopName').value.trim();
    const points = parseInt(document.getElementById('shopPoints').value);
    const link = document.getElementById('shopLink').value.trim();
    if (!name || isNaN(points) || points <= 0) {
        alert('请填写商品名称和有效积分');
        return;
    }
    state.shop.push({
        id: Date.now(),
        name,
        points,
        link: link || '',
        image: document.getElementById('shopImage').value.trim() || ''
    });
    saveState();
    shopModal.style.display = 'none';
};

// 模式切换
const parentBtn = document.getElementById('parentModeBtn');
const childBtn = document.getElementById('childModeBtn');
const parentView = document.getElementById('parentView');
const childView = document.getElementById('childView');

parentBtn.onclick = () => {
    parentBtn.classList.add('active');
    childBtn.classList.remove('active');
    parentView.classList.add('active');
    childView.classList.remove('active');
};

childBtn.onclick = () => {
    childBtn.classList.add('active');
    parentBtn.classList.remove('active');
    childView.classList.add('active');
    parentView.classList.remove('active');
    // 刷新孩子界面
    renderChildTasks();
    renderChildShop();
};

// 历史记录渲染
function renderHistory() {
    const container = document.getElementById('historyList');
    if (state.history.length === 0) {
        container.innerHTML = '<p style="color: #999;">暂无兑换记录</p>';
        return;
    }
    container.innerHTML = '<ul>' + state.history.map(h => `<li>${h.date} 兑换 ${h.item} 消耗 ${h.points} 积分</li>`).join('') + '</ul>';
}

// 初始化
loadState();