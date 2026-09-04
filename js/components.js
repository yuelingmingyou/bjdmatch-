// UI组件渲染
const Components = {
    // 渲染脸片卡片
    faceCard(face, onEdit, onDelete) {
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${this.escapeHtml(face.name)}</span>
                </div>
                <div class="card-body">
                    <p>👁️ 眼珠: ${face.eyeSize}mm</p>
                    ${face.headSize ? `<p>📏 头围: ${face.headSize}cm</p>` : ''}
                    ${face.brand ? `<p>🏷️ ${this.escapeHtml(face.brand)}</p>` : ''}
                    ${face.note ? `<p>📝 ${this.escapeHtml(face.note)}</p>` : ''}
                </div>
                <div class="card-tags">
                    <span class="tag eye-size">👁️ ${face.eyeSize}mm</span>
                    ${face.headSize ? `<span class="tag head-size">📏 ${face.headSize}cm</span>` : ''}
                </div>
                <div class="card-actions">
                    <button onclick="${onEdit}('${face.id}')" class="btn btn-small btn-secondary">编辑</button>
                    <button onclick="${onDelete}('${face.id}')" class="btn btn-small btn-danger">删除</button>
                </div>
            </div>
        `;
    },
    
    // 渲染前后发卡
    hairCard(hair, onEdit, onDelete) {
        const typeLabels = { front: '前发', back: '后发', set: '套装' };
        const typeClasses = { front: 'type-front', back: 'type-back', set: 'type-set' };
        
        return `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">${this.escapeHtml(hair.name)}</span>
                    <span class="card-type ${typeClasses[hair.type]}">${typeLabels[hair.type]}</span>
                </div>
                <div class="card-body">
                    ${hair.brand ? `<p>🏷️ ${this.escapeHtml(hair.brand)}</p>` : ''}
                    ${hair.headSize ? `<p>📏 参考头围: ${hair.headSize}cm</p>` : ''}
                    ${hair.note ? `<p>📝 ${this.escapeHtml(hair.note)}</p>` : ''}
                </div>
                <div class="card-actions">
                    <button onclick="${onEdit}('${hair.id}')" class="btn btn-small btn-secondary">编辑</button>
                    <button onclick="${onDelete}('${hair.id}')" class="btn btn-small btn-danger">删除</button>
                </div>
            </div>
        `;
    },
    
    // 渲染匹配结果
    matchResultCard(match, face, frontHair, backHair) {
        const statusConfig = {
            perfect: { icon: '✅', label: '完美匹配', class: 'perfect' },
            good: { icon: '🟡', label: '可用需调整', class: 'good' },
            poor: { icon: '🔴', label: '不匹配', class: 'poor' },
            unknown: { icon: '❓', label: '待测试', class: 'unknown' }
        };
        const status = statusConfig[match.result] || statusConfig.unknown;
        
        const parts = [];
        if (frontHair) parts.push(`前发: ${this.escapeHtml(frontHair.name)}`);
        if (backHair) parts.push(`后发: ${this.escapeHtml(backHair.name)}`);
        
        return `
            <div class="match-result-card ${status.class}">
                <div class="result-status">${status.icon}</div>
                <div class="result-info">
                    <h4>${this.escapeHtml(face.name)} + ${parts.join(' + ') || '无配件'}</h4>
                    <p>${status.label}${match.detail ? ' · ' + this.escapeHtml(match.detail) : ''}</p>
                </div>
            </div>
        `;
    },
    
    // 渲染匹配记录项
    matchItem(match, face, frontHair, backHair, onDelete) {
        const statusConfig = {
            perfect: { icon: '✅', color: 'var(--success)' },
            good: { icon: '🟡', color: 'var(--warning)' },
            poor: { icon: '🔴', color: 'var(--danger)' },
            unknown: { icon: '❓', color: 'var(--secondary)' }
        };
        const status = statusConfig[match.result] || statusConfig.unknown;
        
        const parts = [];
        if (frontHair) parts.push(`前:${this.escapeHtml(frontHair.name)}`);
        if (backHair) parts.push(`后:${this.escapeHtml(backHair.name)}`);
        
        return `
            <div class="match-item">
                <div style="color: ${status.color}; font-size: 1.2rem;">${status.icon}</div>
                <div class="match-combo">
                    <strong>${this.escapeHtml(face.name)}</strong>
                    ${parts.length ? '<span class="arrow">→</span>' : ''}
                    <span>${parts.join(' ')}</span>
                    ${match.detail ? `<span style="color: var(--text-light);">(${this.escapeHtml(match.detail)})</span>` : ''}
                </div>
                <button onclick="${onDelete}('${match.id}')" class="btn btn-small btn-danger">删除</button>
            </div>
        `;
    },
    
    // 转义HTML防止XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // 空状态
    emptyState(message) {
        return `<div class="empty-state">${message}</div>`;
    }
};

