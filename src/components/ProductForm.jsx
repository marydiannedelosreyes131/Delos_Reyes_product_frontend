import { useState } from 'react';
import { createProduct, updateProduct, errorMessage } from '../api.js';

const empty = { product_name: '', description: '', price: '', quantity: '' };

export default function ProductForm({ product, onSaved, onCancel }) {
  const editing = !!product;
  const [form, setForm] = useState(editing ? { ...product } : empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    const payload = {
      product_name: form.product_name,
      description: form.description,
      price: form.price,
      quantity: form.quantity,
    };

    try {
      if (editing) {
        await updateProduct(product.id, payload);
      } else {
        await createProduct(payload);
      }
      onSaved(editing ? 'Product updated successfully.' : 'Product added successfully.');
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{editing ? 'UPDATE YOUR CATALOG' : 'GROW YOUR CATALOG'}</p>
            <h2 id="product-form-title">{editing ? 'Edit product' : 'Add a product'}</h2>
            <p>{editing ? 'Update the details for this product.' : 'Enter the details to add a new product.'}</p>
          </div>
          <button className="close-button" type="button" onClick={onCancel} aria-label="Close dialog">×</button>
        </div>

        {error && <div className="alert error" role="alert">{error}</div>}

        <form className="form-stack" onSubmit={submit}>
          <label className="field">
            Product name
            <input
              value={form.product_name}
              onChange={set('product_name')}
              maxLength={100}
              placeholder="e.g. Everyday tote bag"
              required
              autoFocus
            />
          </label>
          <label className="field">
            Description
            <textarea
              value={form.description ?? ''}
              onChange={set('description')}
              placeholder="Add a few details about this product..."
              rows={3}
            />
          </label>
          <div className="field-pair">
            <label className="field">
              Price (PHP)
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={set('price')}
                placeholder="0.00"
                required
              />
            </label>
            <label className="field">
              Quantity
              <input
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={set('quantity')}
                placeholder="0"
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="button secondary" type="button" onClick={onCancel}>Cancel</button>
            <button className="button" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
