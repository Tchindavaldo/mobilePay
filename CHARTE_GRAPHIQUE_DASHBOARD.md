# 🎨 Charte Graphique Dashboard Admin MobilPay

## 🌈 Palette de Couleurs Principale

### Couleurs MobilPay (existantes)
```css
:root {
  /* Rouge principal MobilPay */
  --mobilpay-primary: #dc2626;
  --mobilpay-primary-light: #ef4444;
  --mobilpay-primary-dark: #b91c1c;
  
  /* Succès */
  --mobilpay-success: #22c55e;
  --mobilpay-success-light: #4ade80;
  --mobilpay-success-dark: #16a34a;
  
  /* Danger */
  --mobilpay-danger: #ef4444;
  --mobilpay-warning: #f59e0b;
  
  /* Neutres */
  --mobilpay-gray-50: #f8fafc;
  --mobilpay-gray-100: #f1f5f9;
  --mobilpay-gray-200: #e2e8f0;
  --mobilpay-gray-300: #cbd5e1;
  --mobilpay-gray-400: #94a3b8;
  --mobilpay-gray-500: #64748b;
  --mobilpay-gray-600: #475569;
  --mobilpay-gray-700: #334155;
  --mobilpay-gray-800: #1e293b;
  --mobilpay-gray-900: #0f172a;
}
```

### Couleurs Spécifiques Dashboard
```css
:root {
  /* État des paiements */
  --payment-success: #10b981;
  --payment-pending: #f59e0b;
  --payment-failed: #ef4444;
  --payment-expired: #6b7280;
  
  /* Statuts abonnements */
  --status-active: #22c55e;
  --status-inactive: #94a3b8;
  --status-expired: #ef4444;
  --status-trial: #3b82f6;
  
  /* Analytics */
  --chart-primary: #dc2626;
  --chart-secondary: #3b82f6;
  --chart-success: #22c55e;
  --chart-warning: #f59e0b;
  --chart-danger: #ef4444;
}
```

---

## 🎯 Typographie

### Hiérarchie Typographique
```css
/* Desktop */
.dashboard-title { font-size: 2.5rem; font-weight: 700; color: var(--mobilpay-gray-900); }
.dashboard-subtitle { font-size: 1.25rem; font-weight: 500; color: var(--mobilpay-gray-600); }
.card-title { font-size: 1.125rem; font-weight: 600; color: var(--mobilpay-gray-800); }
.card-subtitle { font-size: 0.875rem; font-weight: 400; color: var(--mobilpay-gray-500); }
.table-header { font-size: 0.875rem; font-weight: 600; color: var(--mobilpay-gray-700); }
.table-cell { font-size: 0.875rem; font-weight: 400; color: var(--mobilpay-gray-600); }
.button-text { font-size: 0.875rem; font-weight: 500; }

/* Mobile */
@media (max-width: 768px) {
  .dashboard-title { font-size: 2rem; }
  .dashboard-subtitle { font-size: 1.125rem; }
  .card-title { font-size: 1rem; }
}
```

### Polices
```css
/* Import Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}
```

---

## 📐 Espacements et Layout

### Système d'Espacement
```css
:root {
  --spacing-xs: 0.25rem;    /* 4px */
  --spacing-sm: 0.5rem;     /* 8px */
  --spacing-md: 1rem;       /* 16px */
  --spacing-lg: 1.5rem;     /* 24px */
  --spacing-xl: 2rem;       /* 32px */
  --spacing-2xl: 3rem;     /* 48px */
  --spacing-3xl: 4rem;     /* 64px */
}
```

### Structure Layout
```css
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-xl);
}

.dashboard-header {
  background: linear-gradient(135deg, var(--mobilpay-primary) 0%, var(--mobilpay-primary-dark) 100%);
  padding: var(--spacing-2xl) var(--spacing-xl);
  border-radius: 16px;
  margin-bottom: var(--spacing-xl);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}
```

---

## 🎨 Composants UI

### Cards
```css
.dashboard-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: var(--spacing-lg);
  border: 1px solid var(--mobilpay-gray-200);
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.card-icon.primary { background: rgba(220, 38, 38, 0.1); color: var(--mobilpay-primary); }
.card-icon.success { background: rgba(34, 197, 94, 0.1); color: var(--mobilpay-success); }
.card-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--mobilpay-warning); }
.card-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--mobilpay-danger); }
```

### Boutons
```css
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.btn-primary {
  background: var(--mobilpay-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--mobilpay-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-secondary {
  background: var(--mobilpay-gray-100);
  color: var(--mobilpay-gray-700);
  border: 1px solid var(--mobilpay-gray-300);
}

.btn-success {
  background: var(--mobilpay-success);
  color: white;
}

.btn-danger {
  background: var(--mobilpay-danger);
  color: white;
}
```

### Tableaux
```css
.data-table {
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-header {
  background: var(--mobilpay-gray-50);
  border-bottom: 2px solid var(--mobilpay-gray-200);
}

.table-row {
  border-bottom: 1px solid var(--mobilpay-gray-100);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--mobilpay-gray-50);
}

.table-cell {
  padding: var(--spacing-md);
  text-align: left;
}

.status-badge {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active { background: rgba(34, 197, 94, 0.1); color: var(--status-active); }
.status-expired { background: rgba(239, 68, 68, 0.1); color: var(--status-expired); }
.status-pending { background: rgba(245, 158, 11, 0.1); color: var(--status-pending); }
```

---

## 📊 Graphiques et Analytics

### Style des Graphiques
```css
.chart-container {
  background: white;
  border-radius: 12px;
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--mobilpay-gray-800);
  margin-bottom: var(--spacing-lg);
}

.metric-card {
  text-align: center;
  padding: var(--spacing-lg);
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--mobilpay-gray-900);
  margin-bottom: var(--spacing-sm);
}

.metric-label {
  font-size: 0.875rem;
  color: var(--mobilpay-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: var(--spacing-sm);
}

.metric-change.positive { color: var(--mobilpay-success); }
.metric-change.negative { color: var(--mobilpay-danger); }
```

---

## 🌙 Mode Sombre

### Variables Mode Sombre
```css
[data-theme="dark"] {
  --mobilpay-gray-50: #0f172a;
  --mobilpay-gray-100: #1e293b;
  --mobilpay-gray-200: #334155;
  --mobilpay-gray-300: #475569;
  --mobilpay-gray-400: #64748b;
  --mobilpay-gray-500: #94a3b8;
  --mobilpay-gray-600: #cbd5e1;
  --mobilpay-gray-700: #e2e8f0;
  --mobilpay-gray-800: #f1f5f9;
  --mobilpay-gray-900: #f8fafc;
}

[data-theme="dark"] .dashboard-card {
  background: var(--mobilpay-gray-100);
  border-color: var(--mobilpay-gray-300);
}

[data-theme="dark"] .data-table {
  background: var(--mobilpay-gray-100);
}

[data-theme="dark"] .table-header {
  background: var(--mobilpay-gray-200);
}
```

---

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 640px) {
  .dashboard-container { padding: var(--spacing-md); }
  .dashboard-grid { grid-template-columns: 1fr; gap: var(--spacing-md); }
  .dashboard-header { padding: var(--spacing-lg) var(--spacing-md); }
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1025px) {
  .dashboard-grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 🎯 Animations et Transitions

### Animations Standards
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideIn 0.3s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}
```

---

## 🚀 Icônes et Assets

### Système d'Icônes
```css
/* Utiliser Font Awesome ou Heroicons */
.icon-size-xs { font-size: 0.75rem; }
.icon-size-sm { font-size: 1rem; }
.icon-size-md { font-size: 1.25rem; }
.icon-size-lg { font-size: 1.5rem; }
.icon-size-xl { font-size: 2rem; }

/* Icônes circulaires */
.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mobilpay-gray-100);
  color: var(--mobilpay-gray-600);
}

.icon-circle.primary { background: var(--mobilpay-primary); color: white; }
.icon-circle.success { background: var(--mobilpay-success); color: white; }
.icon-circle.warning { background: var(--mobilpay-warning); color: white; }
.icon-circle.danger { background: var(--mobilpay-danger); color: white; }
```

---

## 📋 Composants Spécifiques Dashboard

### Filtres et Recherche
```css
.filters-container {
  background: white;
  padding: var(--spacing-lg);
  border-radius: 12px;
  margin-bottom: var(--spacing-lg);
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--mobilpay-gray-300);
  border-radius: 8px;
  font-size: 0.875rem;
}

.filter-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--mobilpay-gray-300);
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
}
```

### Modal Paiement
```css
.payment-modal {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  background: var(--mobilpay-primary);
  color: white;
  padding: var(--spacing-lg);
  border-radius: 16px 16px 0 0;
}

.modal-body {
  padding: var(--spacing-xl);
}

.modal-footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--mobilpay-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
}
```

---

## 🎯 Bonnes Pratiques

### Cohérence avec l'App Mobile
1. **Mêmes couleurs** MobilPay (#dc2626)
2. **Mêmes espacements** (système 4px/8px/16px)
3. **Mêmes bordures** (12px radius)
4. **Mêmes transitions** (0.3s ease)
5. **Mode sombre** cohérent

### Accessibilité
- **Contraste WCAG AA** minimum
- **Navigation clavier** complète
- **ARIA labels** sur tous les éléments interactifs
- **Focus states** visibles

### Performance
- **CSS variables** pour thématisation
- **Animations GPU** optimisées
- **Images optimisées** (WebP)
- **Lazy loading** pour tableaux larges

---

Cette charte graphique garantit une **cohérence parfaite** entre le dashboard admin et l'application mobile MobilPay ! 🎨✨
