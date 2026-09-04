const DataStore = {
    KEY: 'bjd_match_data',
    
    getAll() {
        const raw = localStorage.getItem(this.KEY);
        return raw ? JSON.parse(raw) : { faces: [], hairs: [], matches: [] };
    },
    
    save(data) {
        localStorage.setItem(this.KEY, JSON.stringify(data));
    },
    
    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },
    
    // faces
    getFaces() { return this.getAll().faces; },
    getFace(id) { return this.getFaces().find(f => f.id === id); },
    
    saveFace(face) {
        const data = this.getAll();
        if (face.id) {
            const i = data.faces.findIndex(f => f.id === face.id);
            if (i >= 0) data.faces[i] = { ...data.faces[i], ...face, updated: Date.now() };
        } else {
            face.id = this.uid();
            face.created = Date.now();
            data.faces.push(face);
        }
        this.save(data);
        return face;
    },
    
    deleteFace(id) {
        const data = this.getAll();
        data.faces = data.faces.filter(f => f.id !== id);
        data.matches = data.matches.filter(m => m.faceId !== id);
        this.save(data);
    },
    
    // hairs
    getHairs(type) {
        const all = this.getAll().hairs;
        return type && type !== 'all' ? all.filter(h => h.type === type) : all;
    },
    getHair(id) { return this.getHairs().find(h => h.id === id); },
    
    saveHair(hair) {
        const data = this.getAll();
        if (hair.id) {
            const i = data.hairs.findIndex(h => h.id === hair.id);
            if (i >= 0) data.hairs[i] = { ...data.hairs[i], ...hair, updated: Date.now() };
        } else {
            hair.id = this.uid();
            hair.created = Date.now();
            data.hairs.push(hair);
        }
        this.save(data);
        return hair;
    },
    
    deleteHair(id) {
        const data = this.getAll();
        data.hairs = data.hairs.filter(h => h.id !== id);
        data.matches = data.matches.filter(m => m.frontHairId !== id && m.backHairId !== id);
        this.save(data);
    },
    
    // matches
    getMatches() { return this.getAll().matches; },
    
    findMatch(faceId, frontId, backId) {
        return this.getMatches().find(m => 
            m.faceId === faceId && 
            m.frontHairId === (frontId || '') && 
            m.backHairId === (backId || '')
        );
    },
    
    saveMatch(match) {
        const data = this.getAll();
        const existing = this.findMatch(match.faceId, match.frontHairId, match.backHairId);
        if (existing) {
            const i = data.matches.findIndex(m => m.id === existing.id);
            data.matches[i] = { ...existing, ...match, updated: Date.now() };
        } else {
            match.id = this.uid();
            match.created = Date.now();
            data.matches.push(match);
        }
        this.save(data);
        return match;
    },
    
    deleteMatch(id) {
        const data = this.getAll();
        data.matches = data.matches.filter(m => m.id !== id);
        this.save(data);
    },
    
    getMatchesByFace(id) { return this.getMatches().filter(m => m.faceId === id); },
    getMatchesByHair(id) { return this.getMatches().filter(m => m.frontHairId === id || m.backHairId === id); },
    
    // filters
    getEyeSizes() {
        const sizes = new Set();
        this.getFaces().forEach(f => { if (f.eyeSize) sizes.add(parseFloat(f.eyeSize)); });
        return Array.from(sizes).sort((a, b) => a - b);
    },
    
    // import/export
    export() { return JSON.stringify(this.getAll(), null, 2); },
    
    import(json) {
        try {
            const data = JSON.parse(json);
            if (!Array.isArray(data.faces) || !Array.isArray(data.hairs) || !Array.isArray(data.matches)) return false;
            this.save(data);
            return true;
        } catch { return false; }
    },
    
    clear() { localStorage.removeItem(this.KEY); }
};

