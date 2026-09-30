import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../api';
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  Package,
  Layers,
  Settings,
  Headphones,
  Tag,
  DollarSign,
  TrendingUp,
  Search,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
  FileText,
  Key,
  MessageSquare,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  Pencil,
  MoreVertical,
  Copy,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Boxes,
  History,
  Sparkles,
  Archive,
  CheckSquare,
  Square,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { currentUser, loginUser, logoutUser, addToast, settings, loadSettings, checkAdminQueue, navigate, loadProducts } = useStore();

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('queue'); // 'overview', 'queue', 'orders', 'products', 'coupons', 'tickets', 'settings', 'audit'
  const [stats, setStats] = useState(null);
  const [verificationQueue, setVerificationQueue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Screenshot Zoom Modal
  const [zoomedScreenshot, setZoomedScreenshot] = useState(null);

  // Reject Reason Modal
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('UTR could not be verified in the bank statement.');

  // Manual Delivery Modal
  const [deliveringOrder, setDeliveringOrder] = useState(null);
  const [manualDeliveryText, setManualDeliveryText] = useState('');

  // Ticket Reply Modal
  const [replyingTicket, setReplyingTicket] = useState(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Product & Inventory Management State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStockFilter, setProductStockFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [productStatusFilter, setProductStatusFilter] = useState('all'); // 'all', 'active', 'draft', 'disabled'
  const [productSort, setProductSort] = useState('newest'); // 'newest', 'oldest', 'price_asc', 'price_desc', 'stock_asc', 'stock_desc', 'name_asc'
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [activeMenuProductId, setActiveMenuProductId] = useState(null);
  const [inventorySummary, setInventorySummary] = useState(null);

  // Add / Edit Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productModalMode, setProductModalMode] = useState('create'); // 'create' | 'edit'
  const initialProductFormState = {
    id: '',
    name: '',
    sku: '',
    category_id: 'cat_val',
    price: '',
    original_price: '',
    discount_price: '',
    stock: 1,
    low_stock_threshold: 3,
    delivery_type: 'account',
    product_type: 'account',
    status: 'active',
    is_featured: false,
    badge: '',
    short_desc: '',
    description: '',
    images: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    specs: '{"Rank": "Immortal 1", "Region": "AP / Mumbai"}',
    whats_included: 'Full Account Credentials\nOriginal First Recovery Email\nLifetime Escrow Warranty',
    initial_vault_item: ''
  };
  const [productForm, setProductForm] = useState(initialProductFormState);
  const [savingProduct, setSavingProduct] = useState(false);

  // Product Delete Modal
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // Product Details Modal
  const [detailsProduct, setDetailsProduct] = useState(null);

  // Inventory Management Modal
  const [inventoryModalProduct, setInventoryModalProduct] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [inventoryActiveTab, setInventoryActiveTab] = useState('overview'); // 'overview' | 'adjust' | 'vault' | 'history'
  const [stockAdjustmentForm, setStockAdjustmentForm] = useState({
    type: 'INCREASE',
    quantity: 1,
    reason: 'Restock shipment received'
  });
  const [adjustingStock, setAdjustingStock] = useState(false);
  const [revealedVaultSecrets, setRevealedVaultSecrets] = useState({});
  const [newVaultItemForm, setNewVaultItemForm] = useState({
    title: '',
    account_details: '',
    notes: ''
  });
  const [addingVaultItem, setAddingVaultItem] = useState(false);

  // Bulk Actions
  const [bulkActionModal, setBulkActionModal] = useState(null); // { type: 'delete' | 'category' | 'stock' }
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState('cat_val');
  const [bulkStockTarget, setBulkStockTarget] = useState(1);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setSettingsForm(prev => ({
        ...prev,
        ...settings,
        support_email: settings.support_email || 'iushyt12@gmail.com',
        support_hours: settings.support_hours || '09:00 AM – 11:30 PM IST (7 Days/Week)'
      }));
    }
  }, [settings]);

  // Admin Security / Password Change State Form
  const [adminSecurityForm, setAdminSecurityForm] = useState({
    email: currentUser?.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [updatingCredentials, setUpdatingCredentials] = useState(false);

  const handleUpdateAdminSecurity = async (e) => {
    e.preventDefault();
    if (adminSecurityForm.new_password && adminSecurityForm.new_password !== adminSecurityForm.confirm_password) {
      addToast('New passwords do not match', 'error');
      return;
    }
    try {
      setUpdatingCredentials(true);
      const res = await api.updateAdminSecurity(
        adminSecurityForm.email,
        adminSecurityForm.current_password,
        adminSecurityForm.new_password
      );
      if (res.success) {
        addToast('Admin credentials updated successfully!', 'success');
        if (res.user) {
          loginUser(res.user);
        }
        setAdminSecurityForm({
          email: res.user?.email || adminSecurityForm.email,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        addToast(res.error || 'Failed to update credentials', 'error');
      }
    } catch {
      addToast('Error updating admin credentials', 'error');
    } finally {
      setUpdatingCredentials(false);
    }
  };

  // New Coupon Form
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_value: 500,
    max_uses: 100
  });

  // Order filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  const handleAdminAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.login(adminEmail, adminPassword);
      if (res.success && res.user) {
        if (res.user.role === 'admin') {
          loginUser(res.user);
          addToast('Authenticated as Administrator', 'success');
        } else {
          setAuthError('Access Denied: This account does not have administrator privileges.');
          addToast('Access Denied: Administrator role required', 'error');
        }
      } else {
        setAuthError(res.error || 'Invalid administrator email or password.');
      }
    } catch {
      setAuthError('Unable to connect to authentication server. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAllAdminData();
    }
  }, [activeTab, currentUser]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, queueRes, ordersRes, prodsRes, catsRes, coupsRes, ticksRes, logsRes, invSummaryRes] =
        await Promise.all([
          api.getAdminStats(),
          api.getVerificationQueue(),
          api.getAllOrders(),
          api.getProducts({ include_all: 'true', status: 'all' }),
          api.getCategories(),
          api.getCoupons(),
          api.getAllTickets(),
          api.getAuditLogs(),
          api.getInventorySummary()
        ]);

      if (statsRes?.success) setStats(statsRes.stats);
      if (queueRes?.success) setVerificationQueue(queueRes.queue || []);
      if (ordersRes?.success) setOrders(ordersRes.orders || []);
      if (prodsRes?.success) setProducts(prodsRes.products || []);
      if (catsRes?.success) setCategories(catsRes.categories || []);
      if (coupsRes?.success) setCoupons(coupsRes.coupons || []);
      if (ticksRes?.success) setTickets(ticksRes.tickets || []);
      if (logsRes?.success) setAuditLogs(logsRes.logs || []);
      if (invSummaryRes?.success) setInventorySummary(invSummaryRes.summary);
      checkAdminQueue?.();
    } catch (err) {
      console.error(err);
      addToast('Error fetching administrative data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Payment Verification Confirm
  const handleConfirmPayment = async (orderId) => {
    try {
      const res = await api.verifyPayment(
        orderId,
        'CONFIRM',
        'Verified in official merchant bank ledger.',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Payment CONFIRMED! Digital asset bound & dispatched to vault.', 'success');
        loadAllAdminData();
      } else {
        addToast(res.error || 'Failed to verify payment', 'error');
      }
    } catch {
      addToast('Error during payment confirmation', 'error');
    }
  };

  // Payment Verification Reject
  const handleRejectPayment = async (e) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    try {
      const res = await api.verifyPayment(
        rejectingOrder.order_id,
        'REJECT',
        rejectionReason,
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Payment marked as REJECTED. Customer notified to resubmit.', 'info');
        setRejectingOrder(null);
        loadAllAdminData();
      } else {
        addToast(res.error || 'Failed to reject payment', 'error');
      }
    } catch {
      addToast('Error during payment rejection', 'error');
    }
  };

  // Request Info
  const handleRequestInfo = async (orderId) => {
    try {
      const res = await api.verifyPayment(
        orderId,
        'REQUEST_INFO',
        'Bank inquiry flagged. Verification team reconciling transaction with branch.',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Order marked as PAYMENT_UNDER_REVIEW', 'info');
        loadAllAdminData();
      }
    } catch {
      addToast('Error updating status', 'error');
    }
  };

  // Manual Delivery
  const handleDispatchManualDelivery = async (e) => {
    e.preventDefault();
    if (!deliveringOrder || !manualDeliveryText.trim()) return;

    try {
      const payload = {
        credentials: manualDeliveryText.trim(),
        instructions: 'Please test credentials within 24 hours and confirm access.'
      };
      const res = await api.adminDeliverOrder(
        deliveringOrder.id,
        payload,
        'Manual admin fulfillment',
        'ValorVault Admin'
      );
      if (res.success) {
        addToast('Digital credentials dispatched to customer!', 'success');
        setDeliveringOrder(null);
        setManualDeliveryText('');
        loadAllAdminData();
      }
    } catch {
      addToast('Error dispatching delivery', 'error');
    }
  };

  // Support Reply
  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyingTicket || !ticketReplyText.trim()) return;
    try {
      const res = await api.replyTicket(replyingTicket.id, ticketReplyText.trim(), 'RESOLVED', 'ValorVault Admin');
      if (res.success) {
        addToast('Reply sent and ticket resolved!', 'success');
        setReplyingTicket(null);
        setTicketReplyText('');
        loadAllAdminData();
      }
    } catch {
      addToast('Error sending ticket reply', 'error');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.updateSettings(settingsForm, 'ValorVault Master Admin');
      if (res.success) {
        addToast('Payment and system settings updated!', 'success');
        loadSettings();
      }
    } catch {
      addToast('Error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // --- PRODUCT & INVENTORY MANAGEMENT HANDLERS ---
  const handleOpenAddProduct = () => {
    setProductModalMode('create');
    setProductForm({
      ...initialProductFormState,
      category_id: categories[0]?.id || 'cat_val'
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (p) => {
    setActiveMenuProductId(null);
    let imagesStr = '';
    try {
      const parsed = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      imagesStr = Array.isArray(parsed) ? parsed.join('\n') : (p.images || '');
    } catch {
      imagesStr = p.images || '';
    }

    let specsStr = '';
    try {
      specsStr = typeof p.specs === 'object' ? JSON.stringify(p.specs, null, 2) : (p.specs || '');
    } catch {
      specsStr = p.specs || '';
    }

    let whatsIncludedStr = '';
    try {
      const parsed = typeof p.whats_included === 'string' ? JSON.parse(p.whats_included) : p.whats_included;
      whatsIncludedStr = Array.isArray(parsed) ? parsed.join('\n') : (p.whats_included || '');
    } catch {
      whatsIncludedStr = p.whats_included || '';
    }

    setProductModalMode('edit');
    setProductForm({
      id: p.id,
      name: p.name || '',
      sku: p.sku || '',
      category_id: p.category_id || categories[0]?.id || 'cat_val',
      price: p.price ?? '',
      original_price: p.original_price ?? '',
      discount_price: p.discount_price ?? '',
      stock: p.stock ?? 0,
      low_stock_threshold: p.low_stock_threshold ?? 3,
      delivery_type: p.delivery_type || 'account',
      product_type: p.product_type || 'account',
      status: p.status || 'active',
      is_featured: !!p.is_featured,
      badge: p.badge || '',
      short_desc: p.short_desc || '',
      description: p.description || '',
      images: imagesStr || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      specs: specsStr || '{"Rank": "Immortal 1", "Region": "AP / Mumbai"}',
      whats_included: whatsIncludedStr,
      initial_vault_item: ''
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name?.trim()) {
      addToast('Product name is required', 'error');
      return;
    }
    if (productForm.price === '' || Number(productForm.price) < 0) {
      addToast('Valid price is required', 'error');
      return;
    }
    if (Number(productForm.stock) < 0) {
      addToast('Stock quantity cannot be negative', 'error');
      return;
    }

    try {
      setSavingProduct(true);
      const imagesArr = productForm.images
        ? productForm.images.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
        : ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'];

      let parsedSpecs = {};
      try {
        parsedSpecs = JSON.parse(productForm.specs);
      } catch {
        parsedSpecs = { Details: productForm.specs };
      }

      const whatsIncludedArr = productForm.whats_included
        ? productForm.whats_included.split('\n').map(s => s.trim()).filter(Boolean)
        : ['Full Account Credentials', 'First Recovery Receipt', 'Warranty Certificate'];

      const payload = {
        ...productForm,
        price: Number(productForm.price),
        original_price: productForm.original_price ? Number(productForm.original_price) : null,
        discount_price: productForm.discount_price ? Number(productForm.discount_price) : null,
        stock: Number(productForm.stock),
        low_stock_threshold: Number(productForm.low_stock_threshold) || 3,
        is_featured: productForm.is_featured ? 1 : 0,
        images: imagesArr,
        specs: parsedSpecs,
        whats_included: whatsIncludedArr
      };

      if (productModalMode === 'create') {
        const res = await api.createProduct(payload);
        if (res.success) {
          addToast('Product listing created successfully!', 'success');
          setProductModalOpen(false);
          await loadAllAdminData();
          loadProducts?.();
        } else {
          addToast(res.error || 'Failed to create product', 'error');
        }
      } else {
        const res = await api.updateProduct(productForm.id, payload);
        if (res.success) {
          addToast('Product listing updated successfully!', 'success');
          setProductModalOpen(false);
          await loadAllAdminData();
          loadProducts?.();
        } else {
          addToast(res.error || 'Failed to update product', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      addToast('Error saving product listing', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDuplicateProduct = async (p) => {
    setActiveMenuProductId(null);
    try {
      const res = await api.duplicateProduct(p.id);
      if (res.success) {
        addToast(`Cloned listing as "${res.product?.name || 'Copy'}" (Draft)`, 'success');
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to duplicate product', 'error');
      }
    } catch {
      addToast('Error duplicating product', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setDeletingLoading(true);
      const res = await api.deleteProduct(deletingProduct.id);
      if (res.success) {
        addToast(`Deleted "${deletingProduct.name}" and removed associated vault assets`, 'success');
        setSelectedProductIds(prev => prev.filter(id => id !== deletingProduct.id));
        setDeletingProduct(null);
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to delete product', 'error');
      }
    } catch {
      addToast('Error deleting product', 'error');
    } finally {
      setDeletingLoading(false);
    }
  };

  const handleToggleStatus = async (p, newStatus) => {
    setActiveMenuProductId(null);
    try {
      const res = await api.updateProduct(p.id, { status: newStatus });
      if (res.success) {
        addToast(`Product status changed to "${newStatus}"`, 'success');
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to update status', 'error');
      }
    } catch {
      addToast('Error updating status', 'error');
    }
  };

  const handleToggleFeatured = async (p) => {
    setActiveMenuProductId(null);
    try {
      const newFeatured = p.is_featured ? 0 : 1;
      const res = await api.updateProduct(p.id, { is_featured: newFeatured });
      if (res.success) {
        addToast(newFeatured ? 'Marked as Featured product' : 'Removed from Featured', 'success');
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to update featured flag', 'error');
      }
    } catch {
      addToast('Error updating featured flag', 'error');
    }
  };

  // Dedicated Inventory Management Handlers
  const handleOpenInventory = async (p) => {
    setActiveMenuProductId(null);
    setInventoryModalProduct(p);
    setInventoryActiveTab('overview');
    setStockAdjustmentForm({
      type: 'INCREASE',
      quantity: 1,
      reason: 'Restock shipment received'
    });
    setNewVaultItemForm({
      title: `${p.name} - Asset #${(p.stock || 0) + 1}`,
      account_details: '',
      notes: ''
    });
    setRevealedVaultSecrets({});
    try {
      setInventoryLoading(true);
      const res = await api.getProductInventory(p.id);
      if (res.success) {
        setInventoryData(res);
      } else {
        addToast(res.error || 'Failed to load inventory data', 'error');
      }
    } catch {
      addToast('Error fetching product inventory', 'error');
    } finally {
      setInventoryLoading(false);
    }
  };

  const reloadInventoryData = async (productId) => {
    try {
      const res = await api.getProductInventory(productId);
      if (res.success) {
        setInventoryData(res);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    if (!inventoryModalProduct) return;
    const qty = Number(stockAdjustmentForm.quantity);
    if (!qty || qty <= 0) {
      addToast('Adjustment quantity must be greater than 0', 'error');
      return;
    }
    const currentStock = inventoryData?.product?.stock ?? inventoryModalProduct.stock ?? 0;
    if (stockAdjustmentForm.type === 'DECREASE' && qty > currentStock) {
      addToast(`Cannot deduct ${qty} units. Current stock is only ${currentStock}.`, 'error');
      return;
    }

    try {
      setAdjustingStock(true);
      const res = await api.adjustProductStock(
        inventoryModalProduct.id,
        stockAdjustmentForm.type,
        qty,
        stockAdjustmentForm.reason
      );
      if (res.success) {
        addToast(`Stock updated! New stock: ${res.new_stock}`, 'success');
        await reloadInventoryData(inventoryModalProduct.id);
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to adjust stock', 'error');
      }
    } catch {
      addToast('Error applying stock adjustment', 'error');
    } finally {
      setAdjustingStock(false);
    }
  };

  const handleAddVaultItem = async (e) => {
    e.preventDefault();
    if (!inventoryModalProduct) return;
    if (!newVaultItemForm.account_details?.trim()) {
      addToast('Digital credentials / secret text is required', 'error');
      return;
    }

    try {
      setAddingVaultItem(true);
      const res = await api.addVaultItem(inventoryModalProduct.id, newVaultItemForm);
      if (res.success) {
        addToast('Asset credentials stored in encrypted vault & stock synchronized!', 'success');
        setNewVaultItemForm({
          title: '',
          account_details: '',
          notes: ''
        });
        await reloadInventoryData(inventoryModalProduct.id);
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to add vault item', 'error');
      }
    } catch {
      addToast('Error adding vault asset', 'error');
    } finally {
      setAddingVaultItem(false);
    }
  };

  const handleDeleteVaultItem = async (itemId) => {
    if (!inventoryModalProduct) return;
    if (!window.confirm('Delete this vault credential asset? Stock count will adjust accordingly.')) return;
    try {
      const res = await api.deleteVaultItem(inventoryModalProduct.id, itemId);
      if (res.success) {
        addToast('Vault item removed', 'success');
        await reloadInventoryData(inventoryModalProduct.id);
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Failed to delete vault item', 'error');
      }
    } catch {
      addToast('Error deleting vault asset', 'error');
    }
  };

  // Bulk Actions
  const handleExecuteBulkAction = async (action, payload = {}) => {
    if (!selectedProductIds.length) {
      addToast('No products selected', 'error');
      return;
    }
    try {
      setBulkLoading(true);
      const res = await api.bulkProducts(action, selectedProductIds, payload);
      if (res.success) {
        addToast(`Bulk action executed on ${res.affected_count} products`, 'success');
        setSelectedProductIds([]);
        setBulkActionModal(null);
        await loadAllAdminData();
        loadProducts?.();
      } else {
        addToast(res.error || 'Bulk action failed', 'error');
      }
    } catch {
      addToast('Error executing bulk action', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name?.toLowerCase().includes(q);
      const matchSku = p.sku?.toLowerCase().includes(q);
      const matchCat = p.category_name?.toLowerCase().includes(q) || p.category_id?.toLowerCase().includes(q);
      const matchDesc = p.short_desc?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat && !matchDesc) return false;
    }
    if (productCategoryFilter !== 'all' && p.category_id !== productCategoryFilter) {
      return false;
    }
    const stock = Number(p.stock) || 0;
    if (productStockFilter === 'in_stock' && stock <= 5) return false;
    if (productStockFilter === 'low_stock' && (stock <= 0 || stock > 5)) return false;
    if (productStockFilter === 'out_of_stock' && stock > 0) return false;

    if (productStatusFilter !== 'all' && p.status !== productStatusFilter) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    if (productSort === 'newest') return (b.id || '').localeCompare(a.id || '');
    if (productSort === 'oldest') return (a.id || '').localeCompare(b.id || '');
    if (productSort === 'price_asc') return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (productSort === 'price_desc') return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (productSort === 'stock_asc') return (Number(a.stock) || 0) - (Number(b.stock) || 0);
    if (productSort === 'stock_desc') return (Number(b.stock) || 0) - (Number(a.stock) || 0);
    if (productSort === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    return 0;
  });

  const liveInventoryStats = {
    total_products: products.length,
    total_inventory: products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0),
    low_stock_count: products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= 5).length,
    out_of_stock_count: products.filter(p => Number(p.stock) <= 0).length,
    total_inventory_value: products.reduce((acc, p) => acc + ((Number(p.stock) || 0) * (Number(p.price) || 0)), 0)
  };
  const displayInventoryStats = inventorySummary || liveInventoryStats;

  // Create Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createCoupon(newCoupon);
      if (res.success) {
        addToast('New coupon created!', 'success');
        setShowCouponModal(false);
        loadAllAdminData();
      }
    } catch {
      addToast('Error creating coupon', 'error');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !orderSearch ||
      o.order_number?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="bg-[#09090B] min-h-[90vh] flex items-center justify-center px-4 py-16 text-white selection:bg-[#7C4DFF] selection:text-white font-sans">
        <div className="w-full max-w-md bg-[#121216] border border-[#27272A] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#7C4DFF]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#7C4DFF]/15 text-[#7C4DFF] border border-[#7C4DFF]/30 mb-2 shadow-lg">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
              Admin Access Only
            </h1>
            <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-xs mx-auto">
              This area is restricted to ValorVault administrators. Please enter your authorized credentials to proceed.
            </p>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAdminAuth} className="space-y-4 text-xs relative z-10">
            <div>
              <label className="block text-[#D4D4D8] mb-1.5 font-bold uppercase tracking-wider text-[11px]">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-[#7C4DFF] text-white outline-none transition placeholder-[#52525B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#D4D4D8] mb-1.5 font-bold uppercase tracking-wider text-[11px]">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#18181B] border border-[#27272A] focus:border-[#7C4DFF] text-white outline-none transition placeholder-[#52525B]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#7C4DFF] hover:bg-[#6D3DF5] text-white font-extrabold text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{authLoading ? 'Verifying Credentials...' : 'Authenticate & Unlock Vault'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-[#27272A] relative z-10">
            <button
              type="button"
              onClick={() => navigate('home')}
              className="text-xs text-[#71717A] hover:text-white transition cursor-pointer font-medium"
            >
              ← Return to Public Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F9FC] min-h-screen py-8 text-[#111426]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-3xl border border-[#E7E9F2] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#5B45F5] uppercase tracking-wider">
                VALORVAULT MASTER ADMIN CONSOLE
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#111426] tracking-tight mt-1">
              Command Center
            </h1>
            <p className="text-xs text-[#667085] mt-0.5">
              Payment Verification, Manual Escrow Fulfillment, Inventory Vault & Compliance Desk
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAllAdminData()}
              className="px-4 py-2.5 rounded-xl bg-[#F8F9FC] hover:bg-gray-100 text-[#111426] text-xs font-bold border border-[#E7E9F2] transition shadow-2xs cursor-pointer"
            >
              Refresh Data
            </button>
            <button
              onClick={() => navigate('home')}
              className="px-4 py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              View Storefront
            </button>
            <button
              onClick={() => {
                logoutUser();
                navigate('home');
              }}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold border border-red-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex bg-white rounded-2xl border border-[#E7E9F2] p-1.5 overflow-x-auto gap-1 text-xs font-bold shadow-2xs">
          {[
            { id: 'queue', label: `Payment Queue (${verificationQueue.length})`, icon: ShieldCheck, alert: verificationQueue.length > 0 },
            { id: 'overview', label: 'Metrics Overview', icon: TrendingUp },
            { id: 'orders', label: 'All Orders', icon: Receipt },
            { id: 'products', label: 'Products & Vault', icon: Package },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'tickets', label: 'Support Desk', icon: Headphones },
            { id: 'settings', label: 'Store & Contact Settings', icon: Settings },
            { id: 'audit', label: 'Audit Trail', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3.5 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF0FF] text-[#5B45F5]'
                    : 'text-[#667085] hover:text-[#111426] hover:bg-[#F8F9FC]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-[#FF4655] animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* 1. PAYMENT VERIFICATION QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-[#111426]">Manual Bank Verification Protocol:</span> Review the submitted UTR and transaction screenshot below. Confirm the funds reflect in the official Bank Statement or UPI Merchant App before clicking "Confirm Payment". Digital goods are immediately dispatched upon confirmation.
              </div>
            </div>

            {verificationQueue.length === 0 ? (
              <div className="p-16 text-center rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-[#111426]">Verification Queue is Clear</h3>
                <p className="text-xs text-[#667085]">All submitted UPI and Bank transfer orders have been verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationQueue.map((item) => (
                  <div
                    key={item.payment_id || item.order_id}
                    className="p-6 rounded-3xl bg-white border-2 border-amber-300 space-y-4 shadow-sm"
                  >
                    {/* Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F3F9] text-xs">
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-sm text-[#111426]">
                          {item.order_number}
                        </span>
                        <span className="text-[#667085]">&bull;</span>
                        <span className="text-[#111426] font-semibold">{item.customer_name}</span>
                        <span className="text-[#667085] font-mono text-[11px]">({item.customer_phone})</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                          Method: {item.method}
                        </span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          AWAITING VERIFICATION
                        </span>
                      </div>
                    </div>

                    {/* Body: Order Info + Submitted Screenshot */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                      {/* Left: Financial Details (7 cols) */}
                      <div className="lg:col-span-7 space-y-3">
                        <div className="p-4 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] space-y-1">
                          <span className="text-[10px] text-[#667085] font-bold uppercase">Product Item:</span>
                          <div className="text-sm font-extrabold text-[#111426]">{item.item_name || 'Digital Gaming Package'}</div>
                          <div className="text-[11px] text-[#5B45F5] font-semibold capitalize">Delivery: {item.delivery_type}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2]">
                            <span className="text-[#667085] block text-[11px] font-medium">Expected Amount</span>
                            <span className="font-black text-xl text-[#5B45F5]">
                              ₹{item.total_amount?.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#EEF0FF] border border-[#5B45F5]/30">
                            <span className="text-[#5B45F5] block text-[11px] font-bold">Submitted UTR / Ref ID</span>
                            <span className="font-mono font-black text-base text-[#111426] select-all">
                              {item.utr}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#667085] pt-1">
                          Submitted at: <span className="font-mono font-semibold text-[#111426]">{item.payment_submitted_at}</span>
                        </div>
                      </div>

                      {/* Right: Payment Screenshot Thumbnail (5 cols) */}
                      <div className="lg:col-span-5 space-y-2">
                        <span className="text-[#667085] font-bold block text-[11px]">
                          Payment Screenshot / Receipt:
                        </span>
                        <div
                          onClick={() => setZoomedScreenshot(item.screenshot_url)}
                          className="relative rounded-2xl overflow-hidden border border-[#E7E9F2] h-36 bg-gray-100 cursor-pointer group hover:border-[#5B45F5] transition"
                        >
                          <img
                            src={item.screenshot_url}
                            alt="Screenshot"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition gap-1.5 text-white font-bold text-xs">
                            <Eye className="w-4 h-4" />
                            <span>Click to Inspect Fullscreen</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-3 border-t border-[#F1F3F9] flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[11px] text-[#667085]">
                        Has this UTR matched the merchant bank ledger?
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRequestInfo(item.order_id)}
                          className="px-3.5 py-2 rounded-xl bg-[#F8F9FC] hover:bg-gray-100 border border-[#E7E9F2] text-[#111426] text-xs font-bold transition cursor-pointer"
                        >
                          Request Info
                        </button>

                        <button
                          onClick={() => setRejectingOrder(item)}
                          className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject Payment</span>
                        </button>

                        <button
                          onClick={() => handleConfirmPayment(item.order_id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Confirm Payment & Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. OVERVIEW METRICS */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <span className="text-[#667085] text-xs font-bold uppercase tracking-wider">Today's Revenue</span>
                <div className="text-2xl font-black text-emerald-600">
                  ₹{stats.todayRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#667085]">Bank verified sales today</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <span className="text-[#667085] text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                <div className="text-2xl font-black text-[#111426]">
                  ₹{stats.totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#667085]">Across {stats.totalOrders} total orders</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-amber-300 shadow-xs space-y-1">
                <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">Pending Payments</span>
                <div className="text-2xl font-black text-amber-600">
                  {stats.pendingPayments}
                </div>
                <div className="text-[10px] text-[#667085]">Awaiting UTR match</div>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-blue-200 shadow-xs space-y-1">
                <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">Pending Deliveries</span>
                <div className="text-2xl font-black text-[#5B45F5]">
                  {stats.pendingDeliveries}
                </div>
                <div className="text-[10px] text-[#667085]">Processing order queue</div>
              </div>
            </div>

            {/* Orders Stream */}
            <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
              <h3 className="text-base font-black text-[#111426]">Recent Orders Stream</h3>
              <div className="space-y-2 text-xs">
                {orders.slice(0, 6).map((o) => (
                  <div key={o.id} className="p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2] flex justify-between items-center">
                    <div>
                      <span className="font-extrabold text-[#111426]">{o.order_number}</span>
                      <span className="text-[#667085] ml-2">&bull; {o.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-[#111426]">₹{o.total_amount?.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-[#E7E9F2] text-[#111426]">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. ALL ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search order #, customer..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2 pl-8 text-xs focus:border-[#5B45F5] outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#667085] absolute left-2.5 top-2.5" />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white border border-[#E7E9F2] text-[#111426] rounded-xl px-3 py-2 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="PENDING_PAYMENT">Pending Payment</option>
                  <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAYMENT_REJECTED">Payment Rejected</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#E7E9F2] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#111426]">
                <thead className="bg-[#F8F9FC] text-[#667085] uppercase font-bold text-[10px] border-b border-[#E7E9F2]">
                  <tr>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F9]">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#F8F9FC] transition">
                      <td className="p-4 font-bold text-[#111426]">{o.order_number}</td>
                      <td className="p-4">
                        <div className="font-bold text-[#111426]">{o.customer_name}</div>
                        <div className="text-[10px] text-[#667085]">{o.customer_email}</div>
                      </td>
                      <td className="p-4 font-extrabold text-[#111426]">₹{o.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-medium">{o.payment_method}</td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                          {o.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#667085]">{o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recent'}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => navigate('tracking', { orderId: o.id, orderNumber: o.order_number })}
                          className="text-[#5B45F5] hover:underline text-[11px] font-bold"
                        >
                          Inspect
                        </button>
                        {o.status === 'PROCESSING' && (
                          <button
                            onClick={() => setDeliveringOrder(o)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-bold"
                          >
                            Manual Deliver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. PRODUCTS & INVENTORY VAULT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Header & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E9F2] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#111426]">Products & Vault Stock</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#EEF0FF] text-[#5B45F5] font-extrabold text-[10px]">
                    {products.length} Items
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  Manage digital asset catalog listings, stock allocations, and encrypted vault fulfillment
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadAllAdminData()}
                  className="p-2.5 rounded-xl border border-[#E7E9F2] hover:bg-[#F8F9FC] text-[#667085] hover:text-[#111426] transition cursor-pointer"
                  title="Refresh catalog data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm hover:shadow cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* 1. TOP INVENTORY DASHBOARD SUMMARY STATS */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="p-4 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[#667085]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Listings</span>
                  <Package className="w-4 h-4 text-[#5B45F5]" />
                </div>
                <div className="text-2xl font-black text-[#111426]">{displayInventoryStats.total_products}</div>
                <p className="text-[10px] text-[#667085]">Active & draft items</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[#667085]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Inventory</span>
                  <Boxes className="w-4 h-4 text-[#7C4DFF]" />
                </div>
                <div className="text-2xl font-black text-[#111426]">{displayInventoryStats.total_inventory}</div>
                <p className="text-[10px] text-emerald-600 font-semibold">Available total units</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[#667085]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Low Stock</span>
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-amber-600">{displayInventoryStats.low_stock_count}</div>
                <p className="text-[10px] text-amber-600 font-semibold">Needs restock (1-5)</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-1">
                <div className="flex items-center justify-between text-[#667085]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Out of Stock</span>
                  <XCircle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-2xl font-black text-rose-600">{displayInventoryStats.out_of_stock_count}</div>
                <p className="text-[10px] text-rose-600 font-semibold">Depleted items (0)</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between text-[#667085]">
                  <span className="text-[10px] font-bold uppercase tracking-wider">Vault Stock Value</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-black text-[#111426]">
                  ₹{Math.round(displayInventoryStats.total_inventory_value || 0).toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-[#667085]">Asset retail value</p>
              </div>
            </div>

            {/* 2. SEARCH / FILTER / SORT TOOLBAR */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E7E9F2] shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#98A2B3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title, SKU, category..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] placeholder-[#98A2B3] rounded-xl text-xs focus:border-[#5B45F5] outline-none"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#111426]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Category Filter */}
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-[#F8F9FC] border border-[#E7E9F2] text-[#344054] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#5B45F5] outline-none cursor-pointer"
                  >
                    <option value="all">All Categories ({products.length})</option>
                    {categories.map((c) => {
                      const count = products.filter(p => p.category_id === c.id).length;
                      return (
                        <option key={c.id} value={c.id}>
                          {c.name} ({count})
                        </option>
                      );
                    })}
                  </select>

                  {/* Stock Status Filter */}
                  <select
                    value={productStockFilter}
                    onChange={(e) => setProductStockFilter(e.target.value)}
                    className="bg-[#F8F9FC] border border-[#E7E9F2] text-[#344054] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#5B45F5] outline-none cursor-pointer"
                  >
                    <option value="all">All Stock Statuses</option>
                    <option value="in_stock">In Stock (&gt;5)</option>
                    <option value="low_stock">Low Stock (1-5)</option>
                    <option value="out_of_stock">Out of Stock (0)</option>
                  </select>

                  {/* Product Status Filter */}
                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="bg-[#F8F9FC] border border-[#E7E9F2] text-[#344054] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#5B45F5] outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="disabled">Disabled</option>
                  </select>

                  {/* Sort Filter */}
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                    className="bg-[#F8F9FC] border border-[#E7E9F2] text-[#344054] rounded-xl px-3 py-2 text-xs font-semibold focus:border-[#5B45F5] outline-none cursor-pointer"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="stock_asc">Stock: Low to High</option>
                    <option value="stock_desc">Stock: High to Low</option>
                    <option value="name_asc">Title: A to Z</option>
                  </select>
                </div>
              </div>

              {/* Bulk Action Bar (When items selected) */}
              {selectedProductIds.length > 0 && (
                <div className="bg-[#111426] text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#5B45F5] text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                      {selectedProductIds.length} Selected
                    </span>
                    <span className="text-xs text-[#98A2B3]">
                      of {products.length} products
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      onClick={() => handleExecuteBulkAction('enable')}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => handleExecuteBulkAction('draft')}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Set Draft
                    </button>
                    <button
                      onClick={() => handleExecuteBulkAction('disable')}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Disable
                    </button>
                    <button
                      onClick={() => setBulkActionModal({ type: 'stock' })}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Update Stock...
                    </button>
                    <button
                      onClick={() => setBulkActionModal({ type: 'category' })}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition cursor-pointer"
                    >
                      Change Category...
                    </button>
                    <button
                      onClick={() => setBulkActionModal({ type: 'delete' })}
                      disabled={bulkLoading}
                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="px-2 py-1 text-[#98A2B3] hover:text-white transition font-medium cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Select All Filtered Checkbox row */}
              <div className="flex items-center justify-between text-xs text-[#667085] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none font-semibold">
                  <input
                    type="checkbox"
                    checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProductIds(filteredProducts.map(p => p.id));
                      } else {
                        setSelectedProductIds([]);
                      }
                    }}
                    className="w-4 h-4 rounded-md accent-[#5B45F5] cursor-pointer"
                  />
                  <span>Select All Filtered ({filteredProducts.length})</span>
                </label>
                <span>Showing {filteredProducts.length} of {products.length} products</span>
              </div>
            </div>

            {/* 3. PRODUCT CARDS GRID */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-[#111426]">No products found</h4>
                <p className="text-xs text-[#667085] max-w-sm mx-auto">
                  No listings match your search or filter criteria. Try adjusting your filters or create a new listing.
                </p>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Product</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => {
                  let images = [];
                  try {
                    images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
                  } catch {
                    images = [];
                  }
                  const img = images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`p-5 rounded-3xl bg-white border shadow-xs space-y-3.5 text-xs relative group transition-all duration-150 flex flex-col justify-between ${
                        isSelected ? 'border-[#5B45F5] ring-2 ring-[#5B45F5]/20 bg-[#FBFAFF]' : 'border-[#E7E9F2] hover:border-[#5B45F5]/40'
                      }`}
                    >
                      {/* Checkbox overlay top-left */}
                      <div className="absolute top-7 left-7 z-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            setSelectedProductIds(prev =>
                              prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]
                            );
                          }}
                          className="w-4 h-4 rounded-md accent-[#5B45F5] cursor-pointer bg-white shadow-xs"
                          title="Select for bulk actions"
                        />
                      </div>

                      {/* Status / Featured badges top-right */}
                      <div className="absolute top-7 right-7 z-10 flex items-center gap-1.5">
                        {p.is_featured ? (
                          <span className="bg-[#111426]/90 backdrop-blur-xs text-amber-300 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Featured</span>
                          </span>
                        ) : null}
                        {p.status === 'draft' && (
                          <span className="bg-neutral-800/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-xs">
                            Draft
                          </span>
                        )}
                        {p.status === 'disabled' && (
                          <span className="bg-amber-600/90 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-xs">
                            Disabled
                          </span>
                        )}
                      </div>

                      {/* Card Content Top */}
                      <div className="space-y-3">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-full h-36 sm:h-40 object-cover rounded-2xl border border-[#E7E9F2]"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'; }}
                        />

                        {/* Category & Stock Status Row */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-[#EEF0FF] text-[#5B45F5] uppercase tracking-wide">
                            {p.category_name || categories.find(c => c.id === p.category_id)?.name || 'GAMING'}
                          </span>

                          {p.stock > 5 ? (
                            <span className="text-emerald-600 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Stock: {p.stock}
                            </span>
                          ) : p.stock > 0 ? (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              Stock: {p.stock} (Low)
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              Stock: 0 (Sold Out)
                            </span>
                          )}
                        </div>

                        {/* Title & SKU */}
                        <div>
                          <h4 className="text-base font-extrabold text-[#111426] truncate" title={p.name}>
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-[#667085]">
                            <span className="font-mono bg-[#F8F9FC] px-1.5 py-0.5 rounded border border-[#E7E9F2] text-[#475467]">
                              {p.sku || `#${p.id?.slice(0, 8)}`}
                            </span>
                            {p.short_desc && (
                              <span className="truncate text-[#667085]">{p.short_desc}</span>
                            )}
                          </div>
                        </div>

                        {/* Price & Delivery Line */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#F1F3F9]">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-[#111426] text-base">
                              ₹{Number(p.price || 0).toLocaleString('en-IN')}
                            </span>
                            {p.original_price && Number(p.original_price) > Number(p.price) && (
                              <span className="text-[11px] text-[#98A2B3] line-through font-semibold">
                                ₹{Number(p.original_price).toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#5B45F5] font-semibold capitalize">
                            {p.delivery_type || 'Account'} Delivery
                          </span>
                        </div>
                      </div>

                      {/* Card Action Buttons Bottom */}
                      <div className="pt-2.5 border-t border-[#F1F3F9] flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-[#F8F9FC] hover:bg-[#EEF0FF] text-[#344054] hover:text-[#5B45F5] font-bold text-xs flex items-center justify-center gap-1.5 transition border border-[#E7E9F2] hover:border-[#5B45F5]/30 cursor-pointer"
                          title="Edit product details"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleOpenInventory(p)}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                          title="Manage stock & vault"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                          <span>Manage Stock</span>
                        </button>

                        {/* Dropdown Menu Trigger */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuProductId(activeMenuProductId === p.id ? null : p.id);
                            }}
                            className="w-8 h-8 rounded-xl border border-[#E7E9F2] hover:bg-[#F8F9FC] text-[#667085] hover:text-[#111426] flex items-center justify-center transition cursor-pointer"
                            title="More actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu Popup */}
                          {activeMenuProductId === p.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20 cursor-default"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuProductId(null);
                                }}
                              />
                              <div className="absolute right-0 bottom-full mb-1 w-48 bg-white border border-[#E7E9F2] rounded-2xl shadow-xl py-1.5 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => {
                                    setActiveMenuProductId(null);
                                    setDetailsProduct(p);
                                  }}
                                  className="w-full px-3.5 py-2 text-left hover:bg-[#F8F9FC] text-[#344054] flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#667085]" />
                                  <span>View Details</span>
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="w-full px-3.5 py-2 text-left hover:bg-[#F8F9FC] text-[#344054] flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#667085]" />
                                  <span>Duplicate Product</span>
                                </button>
                                <button
                                  onClick={() => handleToggleFeatured(p)}
                                  className="w-full px-3.5 py-2 text-left hover:bg-[#F8F9FC] text-[#344054] flex items-center gap-2 cursor-pointer font-medium"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>{p.is_featured ? 'Unmark Featured' : 'Mark as Featured'}</span>
                                </button>
                                <div className="border-t border-[#F1F3F9] my-1" />
                                <div className="px-3.5 py-1 text-[10px] font-bold text-[#98A2B3] uppercase tracking-wider">
                                  Status
                                </div>
                                {['active', 'draft', 'disabled'].map(st => (
                                  <button
                                    key={st}
                                    onClick={() => handleToggleStatus(p, st)}
                                    className={`w-full px-3.5 py-1.5 text-left flex items-center justify-between cursor-pointer capitalize font-medium ${
                                      p.status === st ? 'text-[#5B45F5] font-bold bg-[#EEF0FF]/50' : 'text-[#344054] hover:bg-[#F8F9FC]'
                                    }`}
                                  >
                                    <span>{st}</span>
                                    {p.status === st && <Check className="w-3.5 h-3.5" />}
                                  </button>
                                ))}
                                <div className="border-t border-[#F1F3F9] my-1" />
                                <button
                                  onClick={() => {
                                    setActiveMenuProductId(null);
                                    setDeletingProduct(p);
                                  }}
                                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer font-bold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Product</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 5. COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E9F2] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#111426]">Discount Coupons</h3>
                <p className="text-xs text-[#667085]">Manage promotional voucher codes</p>
              </div>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-5 rounded-2xl bg-white border border-[#E7E9F2] shadow-xs space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-[#5B45F5]">{c.code}</span>
                    <span className="text-emerald-600 font-bold text-[10px]">
                      {c.uses_count} / {c.max_uses} used
                    </span>
                  </div>
                  <div className="text-[#111426] font-semibold">
                    Discount: {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value} Flat`}
                  </div>
                  <div className="text-[#667085] text-[11px]">
                    Min Order: ₹{c.min_order_value} &bull; Expiry: {c.expiry_date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. SUPPORT TICKETS */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">Customer Support Inquiries</h3>
              <p className="text-xs text-[#667085]">Review tickets and respond to customer queries</p>
            </div>

            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-5 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-2">
                    <span className="font-extrabold text-[#5B45F5]">{t.ticket_number} &bull; {t.customer_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-[#111426]">
                      {t.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#111426] text-sm">{t.subject}</h4>
                  <p className="text-[#667085] leading-relaxed">{t.message}</p>
                  {t.admin_reply && (
                    <div className="p-3 rounded-xl bg-[#EEF0FF] text-[#111426]">
                      <strong className="text-[#5B45F5]">Admin Reply:</strong> {t.admin_reply}
                    </div>
                  )}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => { setReplyingTicket(t); setTicketReplyText(t.admin_reply || ''); }}
                      className="px-3.5 py-1.5 rounded-xl bg-[#EEF0FF] hover:bg-[#5B45F5] text-[#5B45F5] hover:text-white font-bold text-xs transition cursor-pointer"
                    >
                      Reply to Ticket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. SETTINGS CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">
                Payment Gateway & Settlement Settings
              </h3>
              <p className="text-xs text-[#667085]">
                Configure the official UPI VPA and Bank account that displays on customer checkout pages.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <h4 className="font-extrabold text-[#111426] text-sm">Official UPI Gateway Details</h4>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">UPI ID (VPA) *</label>
                  <input
                    type="text"
                    value={settingsForm.upi_id || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upi_id: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Merchant / Registered Payee Name *</label>
                  <input
                    type="text"
                    value={settingsForm.upi_merchant_name || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upi_merchant_name: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <h4 className="font-extrabold text-[#111426] text-sm">Bank Account Settlement Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={settingsForm.bank_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_name: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      value={settingsForm.bank_account_holder || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_holder: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Account Number</label>
                    <input
                      type="text"
                      value={settingsForm.bank_account_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_account_number: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={settingsForm.bank_ifsc || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, bank_ifsc: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Customer Support & Contact Info */}
              <div className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <div className="border-b border-[#E7E9F2] pb-2">
                  <h4 className="font-extrabold text-[#111426] text-sm">Customer Support & Public Contact Info</h4>
                  <p className="text-[11px] text-[#667085]">
                    Configure the official contact details shown across the website, contact page, and delivery notifications.
                  </p>
                </div>
                
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Official Support Email *</label>
                  <input
                    type="email"
                    value={settingsForm.support_email || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                    placeholder="iushyt12@gmail.com"
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    required
                  />
                  <p className="text-[11px] text-[#667085] mt-1">Customers will see this email on the Contact desk, footer, and support ticket confirmations.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Support Operating Hours</label>
                    <input
                      type="text"
                      value={settingsForm.support_hours || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, support_hours: e.target.value })}
                      placeholder="09:00 AM – 11:30 PM IST (7 Days/Week)"
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Helpline Phone (Optional)</label>
                    <input
                      type="text"
                      value={settingsForm.support_phone || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, support_phone: e.target.value })}
                      placeholder="Leave blank to hide phone"
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Payment Verification Notice</label>
                  <input
                    type="text"
                    value={settingsForm.verification_notice || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, verification_notice: e.target.value })}
                    placeholder="Payments verified within 5-15 mins during 09:00 AM - 11:30 PM IST."
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-extrabold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
              >
                {savingSettings ? 'Saving Settings...' : 'Save All Store & Contact Settings'}
              </button>
            </form>

            {/* Admin Security & Password Change */}
            <div className="pt-6 border-t border-[#E7E9F2]">
              <div className="border-b border-[#E7E9F2] pb-3 mb-4">
                <h3 className="text-lg font-black text-[#111426] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#5B45F5]" />
                  <span>Admin Credentials & Security</span>
                </h3>
                <p className="text-xs text-[#667085]">
                  Update your administrator email address and master password.
                </p>
              </div>

              <form onSubmit={handleUpdateAdminSecurity} className="p-6 rounded-3xl bg-white border border-[#E7E9F2] shadow-xs space-y-4">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Admin Email Address *</label>
                  <input
                    type="email"
                    required
                    value={adminSecurityForm.email}
                    onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, email: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Current Password (Required)</label>
                    <input
                      type="password"
                      required
                      value={adminSecurityForm.current_password}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, current_password: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#667085] font-bold mb-1">New Master Password</label>
                    <input
                      type="password"
                      value={adminSecurityForm.new_password}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, new_password: e.target.value })}
                      placeholder="Leave blank to keep current password"
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>

                {adminSecurityForm.new_password && (
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Confirm New Master Password</label>
                    <input
                      type="password"
                      required
                      value={adminSecurityForm.confirm_password}
                      onChange={(e) => setAdminSecurityForm({ ...adminSecurityForm, confirm_password: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={updatingCredentials}
                  className="px-6 py-3 rounded-xl bg-[#111426] hover:bg-black text-white font-extrabold text-xs transition shadow-md cursor-pointer disabled:opacity-50"
                >
                  {updatingCredentials ? 'Updating Credentials...' : 'Save New Admin Credentials'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 8. AUDIT TRAIL LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="border-b border-[#E7E9F2] pb-3">
              <h3 className="text-lg font-black text-[#111426]">Security Audit Logs</h3>
              <p className="text-xs text-[#667085]">Complete immutable ledger of all administrative and payment actions</p>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-[#E7E9F2] bg-white shadow-xs">
              <table className="w-full text-left text-xs text-[#111426]">
                <thead className="bg-[#F8F9FC] text-[#667085] uppercase font-bold text-[10px] border-b border-[#E7E9F2]">
                  <tr>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F3F9]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#F8F9FC] transition text-[11px]">
                      <td className="p-4 text-[#667085] whitespace-nowrap">{log.created_at}</td>
                      <td className="p-4 text-[#111426] font-bold">{log.actor_name} ({log.actor_role})</td>
                      <td className="p-4 text-[#5B45F5]">{log.entity_type}</td>
                      <td className="p-4 font-black">{log.action}</td>
                      <td className="p-4 text-[#667085] max-w-md truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ZOOMED SCREENSHOT MODAL */}
        {zoomedScreenshot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setZoomedScreenshot(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative max-w-4xl max-h-[90vh] z-10 space-y-3 bg-white p-4 rounded-3xl shadow-2xl border border-[#E7E9F2]">
              <div className="flex justify-between items-center text-[#111426] pb-2 border-b border-[#E7E9F2]">
                <span className="font-extrabold text-xs uppercase">UTR & Receipt Fullscreen Inspector</span>
                <button
                  onClick={() => setZoomedScreenshot(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={zoomedScreenshot}
                alt="Zoomed proof"
                className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* REJECT PAYMENT MODAL */}
        {rejectingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setRejectingOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Reject Payment Verification</h3>
              <p className="text-xs text-[#667085]">
                Provide an explanation to the customer so they can submit the corrected UTR or receipt.
              </p>
              <form onSubmit={handleRejectPayment} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Predefined Reason</label>
                  <select
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                  >
                    <option value="UTR not found in merchant bank account statement.">UTR not found in bank statement.</option>
                    <option value="Amount paid does not match order total amount.">Amount paid mismatch.</option>
                    <option value="Screenshot is blurred or illegible. Please re-upload clear proof.">Screenshot illegible / cropped.</option>
                    <option value="Duplicate UTR number already claimed by another order.">Duplicate UTR reference.</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#667085] font-bold mb-1">Specific Admin Note</label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none resize-none"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectingOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TICKET REPLY MODAL */}
        {replyingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setReplyingTicket(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Reply to Customer Ticket</h3>
              <p className="text-xs text-[#667085]">
                Customer: {replyingTicket.customer_name} &bull; {replyingTicket.subject}
              </p>
              <form onSubmit={handleReplyTicket} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  placeholder="Write your official response..."
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReplyingTicket(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold"
                  >
                    Send Reply & Resolve
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MANUAL DELIVERY MODAL */}
        {deliveringOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setDeliveringOrder(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Dispatch Manual Delivery</h3>
              <p className="text-xs text-[#667085]">
                Order: {deliveringOrder.order_number} &bull; {deliveringOrder.primary_item}
              </p>
              <form onSubmit={handleDispatchManualDelivery} className="space-y-3 text-xs">
                <textarea
                  rows={4}
                  value={manualDeliveryText}
                  onChange={(e) => setManualDeliveryText(e.target.value)}
                  placeholder="Enter username, password, or activation codes..."
                  className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-3 text-xs focus:border-[#5B45F5] outline-none font-mono resize-none"
                  required
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveringOrder(null)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Dispatch to Vault
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 1. PRODUCT ADD / EDIT MODAL */}
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
              onClick={() => !savingProduct && setProductModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-[#E7E9F2] pb-3">
                <div>
                  <h3 className="text-lg font-black text-[#111426]">
                    {productModalMode === 'create' ? 'Create New Product Listing' : `Edit Product: ${productForm.name}`}
                  </h3>
                  <p className="text-xs text-[#667085]">
                    {productModalMode === 'create'
                      ? 'Configure catalog specifications and digital inventory fulfillment'
                      : `Update listing information for SKU ${productForm.sku || productForm.id}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-[#F8F9FC] text-[#667085] hover:text-[#111426] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                {/* Title & SKU */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[#344054] font-bold mb-1">Product Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Valorant Immortal 3 Kuronami Account"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">SKU (Auto or Custom)</label>
                    <input
                      type="text"
                      placeholder="VAL-XXXX"
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value.toUpperCase() })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] font-mono rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Category, Delivery, Type, Status */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Category *</label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Delivery Type *</label>
                    <select
                      value={productForm.delivery_type}
                      onChange={(e) => setProductForm({ ...productForm, delivery_type: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
                      required
                    >
                      <option value="account">Account Credentials</option>
                      <option value="code">Digital Code / Voucher</option>
                      <option value="currency">Currency / Topup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Product Type</label>
                    <select
                      value={productForm.product_type}
                      onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none cursor-pointer"
                    >
                      <option value="account">Account</option>
                      <option value="code">Code / Key</option>
                      <option value="topup">Direct Topup</option>
                      <option value="service">Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Status *</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none cursor-pointer font-bold"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                      <option value="disabled">Disabled (Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Price, Original, Stock, Threshold */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F9FC] p-3 rounded-2xl border border-[#E7E9F2]">
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full bg-white border border-[#E7E9F2] text-[#111426] font-bold rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Original MRP (₹)</label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={productForm.original_price}
                      onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                      className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Stock Units *</label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E7E9F2] text-[#111426] font-bold rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Low Stock Alert</label>
                    <input
                      type="number"
                      value={productForm.low_stock_threshold}
                      onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: Number(e.target.value) })}
                      className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                      min="1"
                    />
                  </div>
                </div>

                {/* Highlights & Promo Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Short Highlights / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Immortal 1 | 45 Skins | Mumbai Server"
                      value={productForm.short_desc}
                      onChange={(e) => setProductForm({ ...productForm, short_desc: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Promotional Badge Tag</label>
                    <input
                      type="text"
                      placeholder="e.g. Hot Deal, Best Seller, Verified"
                      value={productForm.badge}
                      onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>

                {/* Featured toggle */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F8F9FC] border border-[#E7E9F2]">
                  <input
                    type="checkbox"
                    id="featuredCheckbox"
                    checked={productForm.is_featured}
                    onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded-md accent-[#5B45F5] cursor-pointer"
                  />
                  <label htmlFor="featuredCheckbox" className="font-bold text-[#111426] cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Feature this listing on homepage banner & top carousels</span>
                  </label>
                </div>

                {/* Images */}
                <div>
                  <label className="block text-[#344054] font-bold mb-1">
                    Image URL(s) (One URL per line or comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={productForm.images}
                    onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 font-mono text-xs focus:border-[#5B45F5] outline-none"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[#344054] font-bold mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                    placeholder="Provide full details, guarantees, warranty, delivery instructions..."
                  />
                </div>

                {/* Specifications JSON & What's Included */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">Specs (JSON Key-Values)</label>
                    <textarea
                      rows={3}
                      value={productForm.specs}
                      onChange={(e) => setProductForm({ ...productForm, specs: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] font-mono text-xs rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#344054] font-bold mb-1">What's Included (One item per line)</label>
                    <textarea
                      rows={3}
                      value={productForm.whats_included}
                      onChange={(e) => setProductForm({ ...productForm, whats_included: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] text-xs rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                </div>

                {/* Initial Vault Item Credentials (only on Create) */}
                {productModalMode === 'create' && (
                  <div className="p-3.5 rounded-2xl bg-[#EEF0FF]/60 border border-[#5B45F5]/30 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[#5B45F5] font-extrabold">
                      <Key className="w-4 h-4" />
                      <span>Initial Vault Credential / Code (Optional)</span>
                    </div>
                    <p className="text-[11px] text-[#475467]">
                      Paste the encrypted account login credentials or digital code for the first stock item.
                    </p>
                    <textarea
                      rows={2}
                      placeholder="Username:Password or Digital Voucher Code"
                      value={productForm.initial_vault_item}
                      onChange={(e) => setProductForm({ ...productForm, initial_vault_item: e.target.value })}
                      className="w-full bg-white border border-[#E7E9F2] text-[#111426] font-mono text-xs rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                    />
                  </div>
                )}

                {/* Form Buttons */}
                <div className="pt-3 border-t border-[#E7E9F2] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    disabled={savingProduct}
                    className="px-4 py-2.5 rounded-xl border border-[#E7E9F2] text-[#667085] hover:text-[#111426] font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="px-6 py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold transition shadow-sm hover:shadow cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingProduct && <RefreshCw className="w-4 h-4 animate-spin" />}
                    <span>{productModalMode === 'create' ? 'Create Product Listing' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. DEDICATED INVENTORY & DIGITAL VAULT MANAGEMENT MODAL */}
        {inventoryModalProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div
              onClick={() => setInventoryModalProduct(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl z-10 space-y-5 max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-[#E7E9F2] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#5B45F5] flex items-center justify-center font-bold">
                    <Boxes className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-[#111426]">{inventoryModalProduct.name}</h3>
                      <span className="font-mono text-[10px] bg-[#F8F9FC] border border-[#E7E9F2] px-2 py-0.5 rounded text-[#475467]">
                        {inventoryModalProduct.sku || `#${inventoryModalProduct.id?.slice(0, 8)}`}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085]">
                      Manage real-time inventory levels, automated digital vault items, and movement history
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInventoryModalProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F8F9FC] text-[#667085] hover:text-[#111426] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2]">
                  <span className="text-[10px] font-bold text-[#667085] uppercase">Total Listed Stock</span>
                  <div className="text-xl font-black text-[#111426] mt-0.5">
                    {inventoryData?.product?.stock ?? inventoryModalProduct.stock}
                  </div>
                  <span className="text-[10px] text-[#667085]">Units visible on store</span>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Available in Vault</span>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">
                    {inventoryData?.product?.available_vault ?? inventoryData?.vault_items?.filter(v => v.status === 'available')?.length ?? 0}
                  </div>
                  <span className="text-[10px] text-emerald-700">Ready for instant dispatch</span>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] font-bold text-amber-800 uppercase">Reserved in Orders</span>
                  <div className="text-xl font-black text-amber-700 mt-0.5">
                    {inventoryData?.product?.reserved_vault ?? inventoryData?.vault_items?.filter(v => v.status === 'reserved')?.length ?? 0}
                  </div>
                  <span className="text-[10px] text-amber-700">Awaiting verification</span>
                </div>

                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                  <span className="text-[10px] font-bold text-purple-800 uppercase">Total Delivered</span>
                  <div className="text-xl font-black text-purple-700 mt-0.5">
                    {inventoryData?.product?.total_sold ?? 0}
                  </div>
                  <span className="text-[10px] text-purple-700">Fulfilled customer orders</span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#E7E9F2] gap-1 text-xs">
                <button
                  onClick={() => setInventoryActiveTab('overview')}
                  className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                    inventoryActiveTab === 'overview'
                      ? 'border-[#5B45F5] text-[#5B45F5]'
                      : 'border-transparent text-[#667085] hover:text-[#111426]'
                  }`}
                >
                  <Boxes className="w-4 h-4" />
                  <span>Stock Adjustments</span>
                </button>
                <button
                  onClick={() => setInventoryActiveTab('vault')}
                  className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                    inventoryActiveTab === 'vault'
                      ? 'border-[#5B45F5] text-[#5B45F5]'
                      : 'border-transparent text-[#667085] hover:text-[#111426]'
                  }`}
                >
                  <Key className="w-4 h-4" />
                  <span>Digital Vault Items ({inventoryData?.vault_items?.length || 0})</span>
                </button>
                <button
                  onClick={() => setInventoryActiveTab('history')}
                  className={`pb-2.5 px-3 font-extrabold flex items-center gap-1.5 transition cursor-pointer border-b-2 ${
                    inventoryActiveTab === 'history'
                      ? 'border-[#5B45F5] text-[#5B45F5]'
                      : 'border-transparent text-[#667085] hover:text-[#111426]'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Movement Audit ({inventoryData?.adjustments?.length || 0})</span>
                </button>
              </div>

              {/* TAB 1: STOCK ADJUSTMENTS */}
              {inventoryActiveTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div className="p-5 rounded-2xl bg-white border border-[#E7E9F2] space-y-4">
                    <h4 className="font-extrabold text-[#111426] text-sm flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#5B45F5]" />
                      <span>Adjust Physical / Virtual Stock Level</span>
                    </h4>

                    <form onSubmit={handleStockAdjustment} className="space-y-3.5">
                      {/* Action Type buttons */}
                      <div>
                        <label className="block text-[#667085] font-bold mb-1.5">Adjustment Action</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setStockAdjustmentForm({ ...stockAdjustmentForm, type: 'INCREASE' })}
                            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                              stockAdjustmentForm.type === 'INCREASE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'bg-[#F8F9FC] text-[#667085] border-[#E7E9F2] hover:bg-[#EEF0FF]'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Stock (+)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockAdjustmentForm({ ...stockAdjustmentForm, type: 'DECREASE' })}
                            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                              stockAdjustmentForm.type === 'DECREASE'
                                ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-500/20'
                                : 'bg-[#F8F9FC] text-[#667085] border-[#E7E9F2] hover:bg-[#EEF0FF]'
                            }`}
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Deduct Stock (-)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockAdjustmentForm({ ...stockAdjustmentForm, type: 'SET' })}
                            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                              stockAdjustmentForm.type === 'SET'
                                ? 'bg-[#EEF0FF] text-[#5B45F5] border-[#5B45F5]/40 ring-2 ring-[#5B45F5]/20'
                                : 'bg-[#F8F9FC] text-[#667085] border-[#E7E9F2] hover:bg-[#EEF0FF]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Set Exact (=)</span>
                          </button>
                        </div>
                      </div>

                      {/* Quantity & Preset Chips */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[#667085] font-bold">
                            {stockAdjustmentForm.type === 'SET' ? 'New Exact Stock Level' : 'Quantity Units'}
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 5, 10, 25].map(q => (
                              <button
                                key={q}
                                type="button"
                                onClick={() => setStockAdjustmentForm({ ...stockAdjustmentForm, quantity: q })}
                                className="px-2 py-0.5 rounded bg-[#F8F9FC] hover:bg-[#EEF0FF] text-[#5B45F5] font-mono text-[10px] border border-[#E7E9F2] cursor-pointer"
                              >
                                +{q}
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="number"
                          value={stockAdjustmentForm.quantity}
                          onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, quantity: Math.max(0, Number(e.target.value)) })}
                          min="0"
                          className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] font-bold text-sm rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                          required
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="block text-[#667085] font-bold mb-1">Adjustment Reason / Notes</label>
                        <select
                          value={stockAdjustmentForm.reason}
                          onChange={(e) => setStockAdjustmentForm({ ...stockAdjustmentForm, reason: e.target.value })}
                          className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none cursor-pointer"
                        >
                          <option value="Restock shipment received">Restock shipment received</option>
                          <option value="Inventory audit count correction">Inventory audit count correction</option>
                          <option value="Damaged / Invalid account credentials revoked">Damaged / Invalid account credentials revoked</option>
                          <option value="Customer refund / item returned">Customer refund / item returned</option>
                          <option value="Promotional giveaway / test allocation">Promotional giveaway / test allocation</option>
                          <option value="Manual admin correction">Manual admin correction</option>
                        </select>
                      </div>

                      {/* Live Calculation Preview */}
                      <div className="p-3.5 rounded-xl bg-[#F8F9FC] border border-[#E7E9F2] flex items-center justify-between font-mono">
                        <div>
                          <span className="text-[10px] text-[#667085] block">Current Stock</span>
                          <span className="text-base font-bold text-[#111426]">
                            {inventoryData?.product?.stock ?? inventoryModalProduct.stock ?? 0}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-[#667085] block">Change</span>
                          <span className="text-base font-bold text-[#5B45F5]">
                            {stockAdjustmentForm.type === 'INCREASE' && `+${stockAdjustmentForm.quantity}`}
                            {stockAdjustmentForm.type === 'DECREASE' && `-${stockAdjustmentForm.quantity}`}
                            {stockAdjustmentForm.type === 'SET' && `-> ${stockAdjustmentForm.quantity}`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#667085] block">Projected New Stock</span>
                          <span className="text-base font-extrabold text-emerald-600">
                            {(() => {
                              const curr = Number(inventoryData?.product?.stock ?? inventoryModalProduct.stock ?? 0);
                              const q = Number(stockAdjustmentForm.quantity) || 0;
                              if (stockAdjustmentForm.type === 'INCREASE') return curr + q;
                              if (stockAdjustmentForm.type === 'DECREASE') return Math.max(0, curr - q);
                              return q;
                            })()}
                          </span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={adjustingStock}
                        className="w-full py-2.5 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold transition shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {adjustingStock && <RefreshCw className="w-4 h-4 animate-spin" />}
                        <span>Apply Stock Adjustment</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: DIGITAL VAULT ITEMS */}
              {inventoryActiveTab === 'vault' && (
                <div className="space-y-4 text-xs">
                  {/* Add Vault Asset Card */}
                  <div className="p-4 rounded-2xl bg-[#EEF0FF]/40 border border-[#5B45F5]/30 space-y-3">
                    <h4 className="font-extrabold text-[#111426] flex items-center gap-2">
                      <Plus className="w-4 h-4 text-[#5B45F5]" />
                      <span>Add Digital Asset to Encrypted Vault</span>
                    </h4>

                    <form onSubmit={handleAddVaultItem} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[#667085] font-bold mb-1">Asset Label / Identifier</label>
                          <input
                            type="text"
                            placeholder="e.g. Account #4 - Immortal Riot ID"
                            value={newVaultItemForm.title}
                            onChange={(e) => setNewVaultItemForm({ ...newVaultItemForm, title: e.target.value })}
                            className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[#667085] font-bold mb-1">Internal Notes (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Clean account with email change available"
                            value={newVaultItemForm.notes}
                            onChange={(e) => setNewVaultItemForm({ ...newVaultItemForm, notes: e.target.value })}
                            className="w-full bg-white border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#667085] font-bold mb-1">Sensitive Credentials / Code *</label>
                        <textarea
                          rows={2}
                          placeholder="Username:Password or Digital Voucher Code to be revealed only upon verified purchase"
                          value={newVaultItemForm.account_details}
                          onChange={(e) => setNewVaultItemForm({ ...newVaultItemForm, account_details: e.target.value })}
                          className="w-full bg-white border border-[#E7E9F2] text-[#111426] font-mono text-xs rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={addingVaultItem}
                        className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {addingVaultItem ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                        <span>Deposit Asset in Vault</span>
                      </button>
                    </form>
                  </div>

                  {/* Vault Items List */}
                  <div className="space-y-2">
                    <h5 className="font-extrabold text-[#111426]">
                      Allocated Assets ({inventoryData?.vault_items?.length || 0})
                    </h5>

                    {(!inventoryData?.vault_items || inventoryData.vault_items.length === 0) ? (
                      <div className="p-8 text-center bg-[#F8F9FC] rounded-2xl border border-dashed border-[#E7E9F2] text-[#667085]">
                        <Key className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" />
                        <p className="font-bold">No digital assets deposited yet</p>
                        <p className="text-[11px] text-[#98A2B3] mt-1">
                          Deposit account credentials or codes above to enable instant automated customer delivery upon payment verification.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {inventoryData.vault_items.map((item, idx) => {
                          const isRevealed = !!revealedVaultSecrets[item.id];
                          return (
                            <div
                              key={item.id}
                              className="p-3.5 rounded-2xl bg-white border border-[#E7E9F2] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-[#5B45F5]">
                                    #{String(idx + 1).padStart(3, '0')}
                                  </span>
                                  <span className="font-bold text-[#111426]">
                                    {item.title || `Asset Unit #${idx + 1}`}
                                  </span>

                                  {item.status === 'available' && (
                                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200">
                                      Available
                                    </span>
                                  )}
                                  {item.status === 'reserved' && (
                                    <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200">
                                      Reserved
                                    </span>
                                  )}
                                  {item.status === 'sold' && (
                                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-purple-200">
                                      Delivered
                                    </span>
                                  )}
                                </div>

                                {/* Credential Masked View */}
                                <div className="flex items-center gap-2 text-[11px] font-mono">
                                  <span className="text-[#667085]">Credentials:</span>
                                  <span className="bg-[#F8F9FC] px-2 py-1 rounded border border-[#E7E9F2] text-[#111426]">
                                    {isRevealed ? item.account_details : '••••••••••••••••••••'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setRevealedVaultSecrets(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className="p-1 text-[#667085] hover:text-[#5B45F5] transition cursor-pointer"
                                    title={isRevealed ? 'Hide sensitive credentials' : 'Show credentials'}
                                  >
                                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.account_details || '');
                                      addToast('Credentials copied to clipboard!', 'success');
                                    }}
                                    className="p-1 text-[#667085] hover:text-[#5B45F5] transition cursor-pointer"
                                    title="Copy credentials"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {item.order_id && (
                                  <div className="text-[10px] text-[#667085]">
                                    Bound to Order: <span className="font-mono text-[#5B45F5] font-bold">#{item.order_id}</span>
                                  </div>
                                )}
                              </div>

                              {/* Item actions */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVaultItem(item.id)}
                                  className="p-1.5 rounded-lg border border-[#E7E9F2] hover:bg-rose-50 text-[#667085] hover:text-rose-600 transition cursor-pointer"
                                  title="Delete vault asset"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: AUDIT MOVEMENT HISTORY */}
              {inventoryActiveTab === 'history' && (
                <div className="space-y-3 text-xs">
                  <h5 className="font-extrabold text-[#111426]">Stock Adjustment Logs</h5>

                  {(!inventoryData?.adjustments || inventoryData.adjustments.length === 0) ? (
                    <div className="p-8 text-center bg-[#F8F9FC] rounded-2xl border border-dashed border-[#E7E9F2] text-[#667085]">
                      <History className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" />
                      <p className="font-bold">No historical stock movements yet</p>
                      <p className="text-[11px] text-[#98A2B3] mt-1">
                        Any manual stock adjustments, order deliveries, or refund returns will be logged here.
                      </p>
                    </div>
                  ) : (
                    <div className="border border-[#E7E9F2] rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-[#F8F9FC] text-[#667085] text-[10px] uppercase font-bold border-b border-[#E7E9F2]">
                          <tr>
                            <th className="p-2.5">Date & Time</th>
                            <th className="p-2.5">Type</th>
                            <th className="p-2.5">Change</th>
                            <th className="p-2.5">Stock Flow</th>
                            <th className="p-2.5">Reason</th>
                            <th className="p-2.5">Admin</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E9F2]">
                          {inventoryData.adjustments.map((log) => (
                            <tr key={log.id} className="hover:bg-[#F8F9FC]/60 font-mono text-[11px]">
                              <td className="p-2.5 text-[#667085]">
                                {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  log.adjustment_type === 'INCREASE' ? 'bg-emerald-50 text-emerald-700' :
                                  log.adjustment_type === 'DECREASE' ? 'bg-rose-50 text-rose-700' :
                                  log.adjustment_type === 'ORDER_DISPATCH' ? 'bg-purple-50 text-purple-700' :
                                  log.adjustment_type === 'REFUND_RESTORE' ? 'bg-amber-50 text-amber-700' :
                                  'bg-blue-50 text-blue-700'
                                }`}>
                                  {log.adjustment_type}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold">
                                {log.quantity_changed > 0 ? `+${log.quantity_changed}` : log.quantity_changed}
                              </td>
                              <td className="p-2.5 text-[#111426]">
                                {log.stock_before} &rarr; {log.stock_after}
                              </td>
                              <td className="p-2.5 font-sans text-[#344054]">
                                {log.reason || 'Manual modification'}
                              </td>
                              <td className="p-2.5 font-sans text-[#667085]">
                                {log.admin_name || 'System'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PRODUCT DELETE CONFIRMATION MODAL */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => !deletingLoading && setDeletingProduct(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#111426]">Delete Product Listing?</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Are you sure you want to permanently delete <strong className="text-[#111426]">"{deletingProduct.name}"</strong>?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px] leading-relaxed">
                  ⚠️ This action will remove the catalog listing and all unallocated digital assets in its inventory vault. Historical orders and revenue metrics will remain preserved.
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  disabled={deletingLoading}
                  className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] hover:text-[#111426] font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deletingLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {deletingLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete Product</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. BULK ACTIONS CONFIRMATION MODAL */}
        {bulkActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => !bulkLoading && setBulkActionModal(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-md w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">
                {bulkActionModal.type === 'delete' && 'Bulk Delete Listings'}
                {bulkActionModal.type === 'category' && 'Batch Change Category'}
                {bulkActionModal.type === 'stock' && 'Batch Update Stock'}
              </h3>
              <p className="text-xs text-[#667085]">
                Applying modification across <strong className="text-[#111426]">{selectedProductIds.length}</strong> selected products.
              </p>

              {bulkActionModal.type === 'category' && (
                <div className="space-y-1.5 text-xs">
                  <label className="block text-[#667085] font-bold">New Category</label>
                  <select
                    value={bulkCategoryTarget}
                    onChange={(e) => setBulkCategoryTarget(e.target.value)}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkActionModal.type === 'stock' && (
                <div className="space-y-1.5 text-xs">
                  <label className="block text-[#667085] font-bold">New Stock Quantity per Product</label>
                  <input
                    type="number"
                    min="0"
                    value={bulkStockTarget}
                    onChange={(e) => setBulkStockTarget(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] font-bold rounded-xl p-2.5 text-xs focus:border-[#5B45F5] outline-none"
                  />
                </div>
              )}

              {bulkActionModal.type === 'delete' && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-800 text-[11px] leading-relaxed">
                  ⚠️ This will permanently delete all {selectedProductIds.length} selected listings and their unallocated vault assets.
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBulkActionModal(null)}
                  disabled={bulkLoading}
                  className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] hover:text-[#111426] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => {
                    if (bulkActionModal.type === 'delete') {
                      handleExecuteBulkAction('delete');
                    } else if (bulkActionModal.type === 'category') {
                      handleExecuteBulkAction('update_category', { category_id: bulkCategoryTarget });
                    } else if (bulkActionModal.type === 'stock') {
                      handleExecuteBulkAction('update_stock', { stock: bulkStockTarget });
                    }
                  }}
                  className={`px-5 py-2 rounded-xl font-bold text-white transition shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50 ${
                    bulkActionModal.type === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#5B45F5] hover:bg-[#4B38D3]'
                  }`}
                >
                  {bulkLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirm Bulk Action</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. PRODUCT DETAILS MODAL */}
        {detailsProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setDetailsProduct(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto text-xs">
              <div className="flex items-start justify-between border-b border-[#E7E9F2] pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EEF0FF] text-[#5B45F5] uppercase">
                    {detailsProduct.category_name}
                  </span>
                  <h3 className="text-lg font-black text-[#111426] mt-1">{detailsProduct.name}</h3>
                  <div className="font-mono text-[#667085] text-[11px]">
                    SKU: {detailsProduct.sku || `#${detailsProduct.id}`}
                  </div>
                </div>
                <button
                  onClick={() => setDetailsProduct(null)}
                  className="p-1.5 rounded-xl hover:bg-[#F8F9FC] text-[#667085] hover:text-[#111426] transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                let images = [];
                try {
                  images = typeof detailsProduct.images === 'string' ? JSON.parse(detailsProduct.images) : detailsProduct.images || [];
                } catch {
                  images = [];
                }
                const img = images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800';
                return (
                  <img
                    src={img}
                    alt={detailsProduct.name}
                    className="w-full h-44 object-cover rounded-2xl border border-[#E7E9F2]"
                  />
                );
              })()}

              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#F8F9FC] border border-[#E7E9F2]">
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold">PRICE</span>
                  <span className="text-base font-black text-[#111426]">₹{Number(detailsProduct.price || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold">CURRENT STOCK</span>
                  <span className={`text-base font-black ${detailsProduct.stock > 5 ? 'text-emerald-600' : detailsProduct.stock > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {detailsProduct.stock} units
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold">DELIVERY TYPE</span>
                  <span className="capitalize font-bold text-[#344054]">{detailsProduct.delivery_type} Delivery</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold">STATUS</span>
                  <span className="capitalize font-bold text-[#344054]">{detailsProduct.status || 'Active'}</span>
                </div>
              </div>

              {detailsProduct.short_desc && (
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold uppercase mb-1">Highlights</span>
                  <p className="text-[#344054] bg-[#F8F9FC] p-2.5 rounded-xl border border-[#E7E9F2]">
                    {detailsProduct.short_desc}
                  </p>
                </div>
              )}

              {detailsProduct.description && (
                <div>
                  <span className="text-[10px] text-[#667085] block font-bold uppercase mb-1">Description</span>
                  <p className="text-[#344054] bg-[#F8F9FC] p-2.5 rounded-xl border border-[#E7E9F2] whitespace-pre-wrap">
                    {detailsProduct.description}
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E9F2]">
                <button
                  type="button"
                  onClick={() => {
                    const p = detailsProduct;
                    setDetailsProduct(null);
                    handleOpenEditProduct(p);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#344054] hover:text-[#5B45F5] font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = detailsProduct;
                    setDetailsProduct(null);
                    handleOpenInventory(p);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#5B45F5] hover:bg-[#4B38D3] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>Manage Stock</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CREATE COUPON MODAL */}
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setShowCouponModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            <div className="relative bg-white border border-[#E7E9F2] rounded-3xl max-w-sm w-full p-6 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-black text-[#111426]">Create Coupon Code</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. SUMMER20"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 font-mono uppercase focus:border-[#5B45F5] outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Type</label>
                    <select
                      value={newCoupon.discount_type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#667085] font-bold mb-1">Value</label>
                    <input
                      type="number"
                      value={newCoupon.discount_value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: Number(e.target.value) })}
                      className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#667085] font-bold mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={newCoupon.min_order_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, min_order_value: Number(e.target.value) })}
                    className="w-full bg-[#F8F9FC] border border-[#E7E9F2] text-[#111426] rounded-xl p-2.5 focus:border-[#5B45F5] outline-none"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="px-4 py-2 rounded-xl border border-[#E7E9F2] text-[#667085] font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#5B45F5] text-white font-bold"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
