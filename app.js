// ========== 数据存储 ==========
const Storage = {
    KEY: 'bjd_match_data',
    
    load() {
        const data = localStorage.getItem(this.KEY);
        return data ? JSON.parse(data) : { faces: [], hairs: [], matches: [] };
    },
    
    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },
    
    get() {
        return this.load();
    }
};

let data = Storage.get();

// ========== 通用工具 ==========
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('zh-CN');
}

// ========== 标签页切换 ==========
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    if (tabName === 'search') updateSearchOptions();
    if (tabName === 'matches') updateMatchSelects();
}

// ========== 脸片管理 ==========
function addFace() {
    const name = document.getElementById('faceName').value.trim();
    if (!name) return alert('请输入脸片名称');
    
    const face = {
        id: generateId(),
        name,
        brand: document.getElementById('faceBrand').value.trim(),
        headSize: parseFloat(document.getElementById('faceHeadSize').value) || null,
        eyeSize: document.getElementById('faceEyeSize').value.trim(),
        note: document.getElementById('faceNote').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    data.faces.push(face);
    Storage.save(data);
    
    // 清空表单
    document.getElementById('faceName').value = '';
    document.getElementById('faceBrand').value = '';
    document.getElementById('faceHeadSize').value = '';
    document.getElementById('faceEyeSize').value = '';
    document.getElementById('faceNote').value = '';
    
    renderFaces();
    updateMatchSelects();
}

function deleteFace(id) {
    if (!confirm('删除脸片将同时删除相关匹配记录，确定吗？')) return;
    
    data.faces = data.faces.filter(f => f.id !== id);
    data.matches = data.matches.filter(m => m.faceId !== id);
    Storage.save(data);
    
    renderFaces();
    renderMatches();
    updateMatchSelects();
}

function renderFaces() {
    const container = document.getElementById('faceList');
    
    if (data.faces.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="emoji">🎭</span>
                <p>还没有脸片记录，添加第一个吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = data.faces.map(face => `
        <div class="item-card">
            <div class="item-info">
                <h4>${escapeHtml(face.name)}</h4>
                <div class="tags">
                    ${face.brand ? `<span class="tag">${escapeHtml(face.brand)}</span>` : ''}
                    ${face.headSize ? `<span class="tag">头围 ${face.headSize}cm</span>` : ''}
                    ${face.eyeSize ? `<span class="tag">眼珠 ${escapeHtml(face.eyeSize)}</span>` : ''}
                    ${face.note ? `<span class="tag">${escapeHtml(face.note)}</span>` : ''}
                </div>
            </div>
            <button onclick="deleteFace('${face.id}')" class="btn btn-delete btn-small">删除</button>
        </div>
    `).join('');
}

// ========== 发型管理 ==========
function addHair() {
    const name = document.getElementById('hairName').value.trim();
    if (!name) return alert('请输入发型名称');
    
    const hair = {
        id: generateId(),
        name,
        brand: document.getElementById('hairBrand').value.trim(),
        type: document.getElementById('hairType').value,
        color: document.getElementById('hairColor').value.trim(),
        note: document.getElementById('hairNote').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    data.hairs.push(hair);
    Storage.save(data);
    
    document.getElementById('hairName').value = '';
    document.getElementById('hairBrand').value = '';
    document.getElementById('hairColor').value = '';
    document.getElementById('hairNote').value = '';
    
    renderHairs();
    updateMatchSelects();
}

function deleteHair(id) {
    if (!confirm('删除发型将同时删除相关匹配记录，确定吗？')) return;
    
    data.hairs = data.hairs.filter(h => h.id !== id);
    data.matches = data.matches.filter(m => m.hairId !== id);
    Storage.save(data);
    
    renderHairs();
    renderMatches();
    updateMatchSelects();
}

function renderHairs() {
    const container = document.getElementById('hairList');
    
    if (data.hairs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="emoji">💇</span>
                <p>还没有发型记录，添加第一个吧！</p>
            </div>
        `;
        return;
    }
    
    const typeNames = {
        front: '前发',
        back: '后发', 
        set: '套装',
        wig: '全头假发'
    };
    
    container.innerHTML = data.hairs.map(hair => `
        <div class="item-card">
            <div class="item-info">
                <h4>${escapeHtml(hair.name)}</h4>
                <div class="tags">
                    <span class="tag type-${hair.type}">${typeNames[hair.type]}</span>
                    ${hair.brand ? `<span class="tag">${escapeHtml(hair.brand)}</span>` : ''}
                    ${hair.color ? `<span class="tag">${escapeHtml(hair.color)}</span>` : ''}
                    ${hair.note ? `<span class="tag">${escapeHtml(hair.note)}</span>` : ''}
                </div>
            </div>
            <button onclick="deleteHair('${hair.id}')" class="btn btn-delete btn-small">删除</button>
        </div>
    `).join('');
}

// ========== 匹配管理 ==========
function updateMatchSelects() {
    const faceSelect = document.getElementById('matchFace');
    const hairSelect = document.getElementById('matchHair');
    
    const faceHtml = '<option value="">选择脸片...</option>' + 
        data.faces.map(f => `<option value="${f.id}">${escapeHtml(f.name)}${f.headSize ? ` (${f.headSize}cm)` : ''}</option>`).join('');
    
    const hairHtml = '<option value="">选择发型...</option>' + 
        data.hairs.map(h => `<option value="${h.id}">[${{front:'前',back:'后',set:'套',wig:'全'}[h.type]}] ${escapeHtml(h.name)}</option>`).join('');
    
    faceSelect.innerHTML = faceHtml;
    hairSelect.innerHTML = hairHtml;
}

function updateMatchPreview() {
    const faceId = document.getElementById('matchFace').value;
    const hairId = document.getElementById('matchHair').value;
    const preview = document.getElementById('matchPreview');
    
    if (!faceId && !hairId) {
        preview.classList.remove('show');
        return;
    }
    
    const face = data.faces.find(f => f.id === faceId);
    const hair = data.hairs.find(h => h.id === hairId);
    
    preview.innerHTML = `
        <div class="preview-box">
            <div class="preview-item">
                <span class="emoji">🎭</span>
                <div>${face ? escapeHtml(face.name) : '?'}</div>
                ${face?.headSize ? `<small>头围 ${face.headSize}cm</small>` : ''}
            </div>
            <div class="preview-arrow">➕</div>
            <div class="preview-item">
                <span class="emoji">${hair ? (hair.type === 'front' ? '💇‍♀️' : hair.type === 'back' ? '💇‍♂️' : '👑') : '?'}</span>
                <div>${hair ? escapeHtml(hair.name) : '?'}</div>
                ${hair ? `<small>${{front:'前发',back:'后发',set:'套装',wig:'全头'}[hair.type]}</small>` : ''}
            </div>
        </div>
    `;
    preview.classList.add('show');
}

function addMatch() {
    const faceId = document.getElementById('matchFace').value;
    const hairId = document.getElementById('matchHair').value;
    const result = document.getElementById('matchResult').value;
    const detail = document.getElementById('matchDetail').value.trim();
    
    if (!faceId || !hairId) return alert('请选择脸片和发型');
    
    // 检查是否已存在
    const existing = data.matches.find(m => m.faceId === faceId && m.hairId === hairId);
    if (existing) {
        if (!confirm('该组合已有记录，是否覆盖？')) return;
        existing.result = result;
        existing.detail = detail;
        existing.updatedAt = new Date().toISOString();
    } else {
        data.matches.push({
            id: generateId(),
            faceId,
            hairId,
            result,
            detail,
            createdAt: new Date().toISOString()
        });
    }
    
    Storage.save(data);
    
    document.getElementById('matchFace').value = '';
    document.getElementById('matchHair').value = '';
    document.getElementById('matchDetail').value = '';
    document.getElementById('matchPreview').classList.remove('show');
    
    renderMatches();
}

function deleteMatch(id) {
    data.matches = data.matches.filter(m => m.id !== id);
    Storage.save(data);
    renderMatches();
}

function renderMatches() {
    const container = document.getElementById('matchList');
    
    if (data.matches.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="emoji">📝</span>
                <p>还没有匹配记录</p>
            </div>
        `;
        return;
    }
    
    const resultLabels = {
        perfect: { text: '完美匹配', class: 'match-perfect' },
        good: { text: '可以匹配', class: 'match-good' },
        tight: { text: '偏紧', class: 'match-tight' },
        loose: { text: '偏松', class: 'match-loose' },
        no: { text: '无法匹配', class: 'match-no' }
    };
    
    // 按时间倒序
    const sorted = [...data.matches].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    container.innerHTML = sorted.map(m => {
        const face = data.faces.find(f => f.id === m.faceId);
        const hair = data.hairs.find(h => h.id === m.hairId);
        const rl = resultLabels[m.result];
        
        return `
            <div class="item-card">
                <div class="item-info">
                    <h4>${face ? escapeHtml(face.name) : '[已删除]'} + ${hair ? escapeHtml(hair.name) : '[已删除]'}</h4>
                    <div class="tags">
                        <span class="match-tag ${rl.class}">${rl.text}</span>
                        ${m.detail ? `<span class="tag">${escapeHtml(m.detail)}</span>` : ''}
                        <span class="tag">${formatDate(m.createdAt)}</span>
                    </div>
                </div>
                <button onclick="deleteMatch('${m.id}')" class="btn btn-delete btn-small">删除</button>
            </div>
        `;
    }).join('');
}

// ========== 搜索功能 ==========
function updateSearchOptions() {
    const type = document.getElementById('searchType').value;
    const target = document.getElementById('searchTarget');
    
    if (type === 'byFace') {
        target.innerHTML = '<option value="">选择脸片...</option>' +
            data.faces.map(f => `<option value="${f.id}">${escapeHtml(f.name)}${f.headSize ? ` (${f.headSize}cm)` : ''}</option>`).join('');
    } else {
        target.innerHTML = '<option value="">选择发型...</option>' +
            data.hairs.map(h => `<option value="${h.id}">[${{front:'前',back:'后',set:'套',wig:'全'}[h.type]}] ${escapeHtml(h.name)}</option>`).join('');
    }
}

function updateSearch() {
    updateSearchOptions();
    document.getElementById('searchResult').innerHTML = '';
}

// 绑定搜索变化
document.getElementById('searchTarget').addEventListener('change', performSearch);
document.getElementById('showBad').addEventListener('change', performSearch);

function performSearch() {
    const type = document.getElementById('searchType').value;
    const targetId = document.getElementById('searchTarget').value;
    const showBad = document.getElementById('showBad').checked;
    const resultDiv = document.getElementById('searchResult');
    
    if (!targetId) {
        resultDiv.innerHTML = '';
        return;
    }
    
    let matches;
    if (type === 'byFace') {
        matches = data.matches.filter(m => m.faceId === targetId);
    } else {
        matches = data.matches.filter(m => m.hairId === targetId);
    }
    
    if (!showBad) {
        matches = matches.filter(m => m.result !== 'no');
    }
    
    // 排序：完美匹配优先
    const order = { perfect: 0, good: 1, tight: 2, loose: 3, no: 4 };
    matches.sort((a, b) => order[a.result] - order[b.result]);
    
    if (matches.length === 0) {
        resultDiv.innerHTML = `
            <div class="empty-state">
                <span class="emoji">🔍</span>
                <p>暂无匹配记录，去"匹配关系"页面添加吧！</p>
            </div>
        `;
        return;
    }
    
    const resultLabels = {
        perfect: { text: '✅ 完美匹配', class: 'match-perfect' },
        good: { text: '🟡 可以匹配', class: 'match-good' },
        tight: { text: '🔴 偏紧', class: 'match-tight' },
        loose: { text: '🔵 偏松', class: 'match-loose' },
        no: { text: '❌ 无法匹配', class: 'match-no' }
    };
    
    resultDiv.innerHTML = matches.map(m => {
        const face = data.faces.find(f => f.id === m.faceId);
        const hair = data.hairs.find(h => h.id === m.hairId);
        const rl = resultLabels[m.result];
        const isBad = m.result === 'no';
        
        return `
            <div class="result-card ${isBad ? 'bad-match' : ''}">
                <div class="result-header">
                    <span class="result-title">
                        ${type === 'byFace' 
                            ? (hair ? escapeHtml(hair.name) : '[已删除]')
                            : (face ? escapeHtml(face.name) : '[已删除]')
                        }
                    </span>
                    <span class="match-tag ${rl.class}">${rl.text}</span>
                </div>
                <div class="result-detail">
                    ${type === 'byFace' ? `
                        <span>类型: ${{front:'前发',back:'后发',set:'套装',wig:'全头假发'}[hair?.type] || '?'}</span>
                        ${hair?.color ? `<span>颜色: ${escapeHtml(hair.color)}</span>` : ''}
                    ` : `
                        <span>头围: ${face?.headSize ? face.headSize + 'cm' : '未记录'}</span>
                        ${face?.eyeSize ? `<span>眼珠: ${escapeHtml(face.eyeSize)}</span>` : ''}
                    `}
                    ${m.detail ? `<br><span>💡 ${escapeHtml(m.detail)}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// ========== 数据导入导出 ==========
function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bjd_match_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            
            // 验证数据结构
            if (!Array.isArray(imported.faces) || !Array.isArray(imported.hairs) || !Array.isArray(imported.matches)) {
                throw new Error('数据格式不正确');
            }
            
            // 合并或替换
            const mode = confirm('点击"确定"合并数据，"取消"完全替换') ? 'merge' : 'replace';
            
            if (mode === 'replace') {
                data = imported;
            } else {
                // 合并：去重
                const existingFaceIds = new Set(data.faces.map(f => f.id));
                const existingHairIds = new Set(data.hairs.map(h => h.id));
                const existingMatchKeys = new Set(data.matches.map(m => `${m.faceId}-${m.hairId}`));
                
                data.faces.push(...imported.faces.filter(f => !existingFaceIds.has(f.id)));
                data.hairs.push(...imported.hairs.filter(h => !existingHairIds.has(h.id)));
                data.matches.push(...imported.matches.filter(m => !existingMatchKeys.has(`${m.faceId}-${m.hairId}`)));
            }
            
            Storage.save(data);
            renderAll();
            alert('导入成功！');
            
        } catch (err) {
            alert('导入失败: ' + err.message);
        }
        input.value = '';
    };
    reader.readAsText(file);
}

function clearAll() {
    if (!confirm('确定清空所有数据？建议先导出备份！')) return;
    if (!confirm('再次确认：所有脸片、发型、匹配记录将被删除！')) return;
    
    data = { faces: [], hairs: [], matches: [] };
    Storage.save(data);
    renderAll();
}

// ========== 工具函数 ==========
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderAll() {
    renderFaces();
    renderHairs();
    renderMatches();
    updateMatchSelects();
    updateSearchOptions();
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    renderAll();
    
    // 自动保存提示
    window.addEventListener('beforeunload', () => {
        // 数据已实时保存到localStorage，这里可以添加额外逻辑
    });
});

