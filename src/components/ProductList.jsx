import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
const number = new Intl.NumberFormat('en-PH');

function stockStatus(quantity) {
  if (quantity < 1) return ['out', 'Out of stock'];
  if (quantity < 6) return ['low', 'Low stock'];
  return ['', 'In stock'];
}

export default function ProductList({ user, onLogout }) {
  const canManageProducts = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [formFor, setFormFor] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.product_name, product.description].some((value) =>
        String(value ?? '').toLowerCase().includes(query)
      )
    );
  }, [products, search]);

  const totalUnits = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const inventoryValue = products.reduce(
    (sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0),
    0
  );

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.product_name}"?`)) return;
    try {
      await deleteProduct(product.id);
      setNotice('Product deleted successfully.');
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = async (message) => {
    setFormFor(null);
    setNotice(message);
    await load();
  };

  const initials = user.username.slice(0, 1).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">P</div>
          <div>
            <div className="brand-name">Stockroom</div>
            <div className="brand-caption">Product workspace</div>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <div className="nav-link active" aria-current="page">
          <span className="nav-icon" aria-hidden="true">▦</span>
          Inventory
        </div>

        <div className="sidebar-note">
          <div className="sidebar-note-mark" aria-hidden="true">✳</div>
          <strong>Everything in its place.</strong>
          <p>A clear view of your products and stock, all in one space.</p>
        </div>
        <div className="sidebar-footer">PRODUCT MANAGEMENT · 2026</div>
      </aside>

      <div className="workspace">
        <div className="topbar">
          <div className="breadcrumb">Workspace <span aria-hidden="true">/</span> <strong>Inventory</strong></div>
          <div className="account">
            <div className="avatar" aria-hidden="true">{initials}</div>
            <div className="account-copy">
              <strong>{user.username}</strong>
              <span>{canManageProducts ? 'Administrator' : 'View-only account'}</span>
            </div>
            <button className="button secondary small" onClick={onLogout}>Log out</button>
          </div>
        </div>

        <main className="main-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR CATALOG</p>
              <h1>Product inventory</h1>
              <p className="page-subtitle">A complete overview of the products in your workspace.</p>
            </div>
            {canManageProducts && (
              <button className="button" onClick={() => setFormFor({})}>
                <span className="button-icon" aria-hidden="true">+</span>
                Add product
              </button>
            )}
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status" onClick={() => setNotice('')}>{notice}</div>}

          <section className="stats-grid" aria-label="Inventory summary">
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">▦</div>
              <div>
                <div className="stat-label">Total products</div>
                <div className="stat-value">{number.format(products.length)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber" aria-hidden="true">▤</div>
              <div>
                <div className="stat-label">Units in stock</div>
                <div className="stat-value">{number.format(totalUnits)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue" aria-hidden="true">₱</div>
              <div>
                <div className="stat-label">Inventory value</div>
                <div className="stat-value">{peso.format(inventoryValue)}</div>
              </div>
            </div>
          </section>

          <section className="inventory-panel" aria-labelledby="inventory-heading">
            <div className="panel-toolbar">
              <div>
                <h2 className="panel-title" id="inventory-heading">All products</h2>
                <p className="panel-count">
                  {search ? `${filteredProducts.length} of ${products.length} products` : `${products.length} products in your catalog`}
                </p>
              </div>
              <label className="search-wrap">
                <span className="search-icon" aria-hidden="true">⌕</span>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search products..."
                  aria-label="Search products"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
            </div>

            {loading ? (
              <div className="empty-state" role="status">
                <div className="loading-mark" aria-hidden="true">P</div>
                Loading your products…
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon" aria-hidden="true">{search ? '⌕' : '▦'}</div>
                <strong>{search ? 'No matching products' : 'Your catalog is empty'}</strong>
                <span>{search ? 'Try a different product name or description.' : 'Products will appear here once they have been added.'}</span>
              </div>
            ) : (
              <>
                <div className="table-scroll">
                  <table className="inventory-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock status</th>
                        <th className="num">Quantity</th>
                        <th className="num">Price</th>
                        <th>Date added</th>
                        {canManageProducts && <th className="num">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const [stockClass, stockLabel] = stockStatus(Number(product.quantity));
                        return (
                          <tr key={product.id}>
                            <td>
                              <div className="product-cell">
                                <div className="product-mark" aria-hidden="true">
                                  {product.product_name.trim().slice(0, 2)}
                                </div>
                                <div>
                                  <strong>{product.product_name}</strong>
                                  <span>{product.description || 'No description'}</span>
                                </div>
                              </div>
                            </td>
                            <td><span className={`stock-pill ${stockClass}`}>{stockLabel}</span></td>
                            <td className="num">{number.format(Number(product.quantity))}</td>
                            <td className="num">{peso.format(Number(product.price))}</td>
                            <td>{product.created_at || '—'}</td>
                            {canManageProducts && (
                              <td>
                                <div className="row-actions">
                                  <button className="button secondary small" onClick={() => setFormFor(product)}>Edit</button>
                                  <button className="button danger small" onClick={() => handleDelete(product)}>Delete</button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <span>Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products</span>
                  <span>{canManageProducts ? 'Admin access' : 'View-only access'}</span>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {canManageProducts && formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </div>
  );
}
