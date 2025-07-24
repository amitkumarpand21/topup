// Global variables
let currentPage = 1;
let currentFilters = {};
let selectedOrders = [];
let currentOrderId = null;

// API Base URL
const API_BASE = '/api';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');
const adminName = document.getElementById('adminName');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Check if user is already logged in
    checkAuthStatus();
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Filters
    document.getElementById('statusFilter').addEventListener('change', handleFilterChange);
    document.getElementById('gameFilter').addEventListener('change', handleFilterChange);
    document.getElementById('refreshOrders').addEventListener('click', loadOrders);
    
    // Pagination
    document.getElementById('prevPage').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage').addEventListener('click', () => changePage(1));
    
    // Bulk actions
    document.getElementById('bulkComplete').addEventListener('click', () => bulkUpdateOrders('completed'));
    document.getElementById('bulkCancel').addEventListener('click', () => bulkUpdateOrders('cancelled'));
    
    // Select all checkbox
    document.getElementById('selectAll').addEventListener('change', handleSelectAll);
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', closeModals);
    });
    
    // Save order button
    document.getElementById('saveOrder').addEventListener('click', saveOrderChanges);
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/admin/profile`);
        if (response.ok) {
            const admin = await response.json();
            showDashboard(admin);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        showLogin();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showDashboard(data.admin);
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
        showLogin();
    } catch (error) {
        console.error('Logout error:', error);
        showLogin();
    }
}

function showLogin() {
    loginModal.classList.add('show');
    dashboard.style.display = 'none';
    loginError.textContent = '';
    loginForm.reset();
}

function showDashboard(admin) {
    loginModal.classList.remove('show');
    dashboard.style.display = 'grid';
    adminName.textContent = admin.username;
    
    // Load initial data
    loadDashboardStats();
    loadOrders();
}

function showError(message) {
    loginError.textContent = message;
}

// Navigation functions
function handleNavigation(e) {
    e.preventDefault();
    
    const targetSection = e.target.closest('.nav-link').dataset.section;
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    e.target.closest('.nav-link').classList.add('active');
    
    // Show target section
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(targetSection).classList.add('active');
    
    // Load section-specific data
    if (targetSection === 'overview') {
        loadDashboardStats();
    } else if (targetSection === 'orders') {
        loadOrders();
    }
}

// Dashboard stats functions
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE}/admin/dashboard/stats`);
        if (response.ok) {
            const stats = await response.json();
            updateStatsDisplay(stats);
            updateChartsDisplay(stats);
        }
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
    }
}

function updateStatsDisplay(stats) {
    document.getElementById('totalOrders').textContent = stats.total_orders;
    document.getElementById('pendingOrders').textContent = stats.pending_orders;
    document.getElementById('completedOrders').textContent = stats.completed_orders;
    document.getElementById('recentOrders').textContent = stats.recent_orders;
}

function updateChartsDisplay(stats) {
    // Simple text-based charts for now
    const gamesChart = document.getElementById('gamesChart');
    const paymentChart = document.getElementById('paymentChart');
    
    // Games chart
    let gamesHtml = '<div style="text-align: left;">';
    stats.games_stats.forEach(game => {
        const percentage = (game.count / stats.total_orders * 100).toFixed(1);
        gamesHtml += `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${game.game}</span>
                    <span>${game.count} (${percentage}%)</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 5px;">
                    <div style="background: #00ffea; height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    });
    gamesHtml += '</div>';
    gamesChart.innerHTML = gamesHtml;
    
    // Payment chart
    let paymentHtml = '<div style="text-align: left;">';
    stats.payment_stats.forEach(payment => {
        const percentage = (payment.count / stats.total_orders * 100).toFixed(1);
        paymentHtml += `
            <div style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                    <span>${payment.method}</span>
                    <span>${payment.count} (${percentage}%)</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 4px; margin-top: 5px;">
                    <div style="background: #28a745; height: 100%; width: ${percentage}%; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    });
    paymentHtml += '</div>';
    paymentChart.innerHTML = paymentHtml;
}

// Orders management functions
async function loadOrders() {
    try {
        const params = new URLSearchParams({
            page: currentPage,
            per_page: 10,
            ...currentFilters
        });
        
        const response = await fetch(`${API_BASE}/orders?${params}`);
        if (response.ok) {
            const data = await response.json();
            updateOrdersTable(data.orders);
            updatePagination(data);
        }
    } catch (error) {
        console.error('Failed to load orders:', error);
    }
}

function updateOrdersTable(orders) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '';
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="order-checkbox" value="${order.id}"></td>
            <td>${order.id}</td>
            <td>${order.game}</td>
            <td>${order.game_id}</td>
            <td>${order.amount}</td>
            <td>${order.payment_method}</td>
            <td>${order.contact}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.created_at).toLocaleDateString()}</td>
            <td>
                <button onclick="editOrder(${order.id})" class="btn-primary" style="padding: 5px 10px; font-size: 12px;">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.order-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedOrders);
    });
}

function updatePagination(data) {
    document.getElementById('pageInfo').textContent = `Page ${data.current_page} of ${data.pages}`;
    document.getElementById('prevPage').disabled = data.current_page <= 1;
    document.getElementById('nextPage').disabled = data.current_page >= data.pages;
}

function handleFilterChange() {
    const statusFilter = document.getElementById('statusFilter').value;
    const gameFilter = document.getElementById('gameFilter').value;
    
    currentFilters = {};
    if (statusFilter) currentFilters.status = statusFilter;
    if (gameFilter) currentFilters.game = gameFilter;
    
    currentPage = 1;
    loadOrders();
}

function changePage(direction) {
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    loadOrders();
}

function handleSelectAll(e) {
    const checkboxes = document.querySelectorAll('.order-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
    updateSelectedOrders();
}

function updateSelectedOrders() {
    selectedOrders = Array.from(document.querySelectorAll('.order-checkbox:checked'))
        .map(checkbox => parseInt(checkbox.value));
}

async function bulkUpdateOrders(status) {
    if (selectedOrders.length === 0) {
        alert('Please select orders to update');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/orders/bulk-update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_ids: selectedOrders,
                status: status
            }),
        });
        
        if (response.ok) {
            loadOrders();
            selectedOrders = [];
            document.getElementById('selectAll').checked = false;
        }
    } catch (error) {
        console.error('Bulk update failed:', error);
    }
}

// Order editing functions
async function editOrder(orderId) {
    currentOrderId = orderId;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${orderId}`);
        if (response.ok) {
            const order = await response.json();
            showOrderModal(order);
        }
    } catch (error) {
        console.error('Failed to load order:', error);
    }
}

function showOrderModal(order) {
    const modal = document.getElementById('orderModal');
    const details = document.getElementById('orderDetails');
    
    details.innerHTML = `
        <div style="margin-bottom: 20px;">
            <strong>Order ID:</strong> ${order.id}<br>
            <strong>Game:</strong> ${order.game}<br>
            <strong>Game ID:</strong> ${order.game_id}<br>
            <strong>Amount:</strong> ${order.amount}<br>
            <strong>Payment Method:</strong> ${order.payment_method}<br>
            <strong>Contact:</strong> ${order.contact}<br>
            <strong>Created:</strong> ${new Date(order.created_at).toLocaleString()}
        </div>
    `;
    
    document.getElementById('orderStatus').value = order.status;
    document.getElementById('orderNotes').value = order.notes || '';
    
    modal.classList.add('show');
}

async function saveOrderChanges() {
    const status = document.getElementById('orderStatus').value;
    const notes = document.getElementById('orderNotes').value;
    
    try {
        const response = await fetch(`${API_BASE}/orders/${currentOrderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status, notes }),
        });
        
        if (response.ok) {
            closeModals();
            loadOrders();
        }
    } catch (error) {
        console.error('Failed to save order:', error);
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

// Utility functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

