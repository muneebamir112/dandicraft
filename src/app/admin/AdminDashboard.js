"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./Admin.module.css";

const CATEGORIES = [
  "Paint-by-Number",
  "Washable Paint-by-Number",
  "Custom",
  "Plaster",
  "Stuff-a-Bear",
  "Paint and Supplies",
  "Photo Pillows",
  "CandleArt",
];

const EMPTY_PRODUCT = {
  id: "",
  name: "",
  slug: "",
  category: CATEGORIES[0],
  price: 0,
  description: "",
  images: [],
  hasUpload: false,
  requiresQuote: false,
  minQty: 1,
  featured: false,
  active: true,
  options: [],
  addons: [],
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminDashboard({ initialProducts, admin }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const visibleProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.category].some((field) => field.toLowerCase().includes(value))
    );
  }, [products, query]);

  function beginNewProduct() {
    setEditing({ ...EMPTY_PRODUCT, images: [] });
    setError("");
    setNotice("");
    setTimeout(() => {
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function beginEdit(product) {
    const safeOptions = Array.isArray(product.options) ? product.options : [];
    const safeAddons = Array.isArray(product.addons) ? product.addons : [];
    
    setEditing({
      ...product,
      images: Array.isArray(product.images) ? product.images : [],
      options: safeOptions.map((option) => ({ ...option, values: Array.isArray(option.values) ? [...option.values] : [] })),
      addons: safeAddons.map((addon) => ({ ...addon })),
    });
    setError("");
    setNotice("");
    setTimeout(() => {
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  async function handleImageUpload(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    
    setUploading(true);
    setError("");
    
    try {
      const newImages = [];
      for (const file of files) {
        const uploadData = new FormData();
        uploadData.append("image", file);
        const uploadResponse = await fetch("/api/admin/images", { method: "POST", body: uploadData });
        const uploadResult = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadResult.error || "Image upload failed.");
        newImages.push(uploadResult.url);
      }
      
      setEditing(current => ({
        ...current,
        images: [...(current.images || []), ...newImages]
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      // Reset input value to allow selecting same file again
      e.target.value = null;
    }
  }

  function removeImage(indexToRemove) {
    setEditing(current => ({
      ...current,
      images: current.images.filter((_, idx) => idx !== indexToRemove)
    }));
  }

  function setPrimaryImage(indexToPrimary) {
    setEditing(current => {
      const imgs = [...current.images];
      const selected = imgs.splice(indexToPrimary, 1)[0];
      return { ...current, images: [selected, ...imgs] };
    });
  }

  function updateField(field, value) {
    setEditing((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && !current.id) next.slug = slugify(value);
      return next;
    });
  }

  function updateOption(index, field, value) {
    const options = editing.options.map((option, optionIndex) =>
      optionIndex === index
        ? { ...option, [field]: field === "values" ? value.split(",").map((item) => item.trim()).filter(Boolean) : value }
        : option
    );
    updateField("options", options);
  }

  function updateAddon(index, field, value) {
    const addons = editing.addons.map((addon, addonIndex) =>
      addonIndex === index ? { ...addon, [field]: field === "price" ? Number(value) : value } : addon
    );
    updateField("addons", addons);
  }

  async function saveProduct(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const isExisting = Boolean(editing.id);
      const response = await fetch(
        isExisting ? `/api/admin/products/${encodeURIComponent(editing.id)}` : "/api/admin/products",
        {
          method: isExisting ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...editing }),
        }
      );
      const saved = await response.json();
      if (!response.ok) throw new Error(saved.error || "Could not save the product.");

      setProducts((current) => {
        const exists = current.some((product) => product.id === saved.id);
        return exists
          ? current.map((product) => (product.id === saved.id ? saved : product))
          : [saved, ...current];
      });
      setEditing(null);
      setNotice(`${saved.name} was saved successfully.`);
      router.refresh();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.name}” permanently?`)) return;
    setError("");
    const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not delete the product.");
      return;
    }
    setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice(`${product.name} was deleted.`);
    if (editing?.id === product.id) setEditing(null);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <section className={styles.adminPage}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>Dandicraft commerce</p>
            <h1>Product workspace</h1>
            <p className={styles.subhead}>Signed in as {admin.name}</p>
          </div>
          <div className={styles.topActions}>
            <Link href="/admin/orders" className={styles.secondaryButton}>View Orders</Link>
            <button className={styles.secondaryButton} onClick={logout}>Sign out</button>
            <button className={styles.primaryButton} onClick={beginNewProduct}>+ Add product</button>
          </div>
        </header>

        <div className={styles.stats}>
          <article><strong>{products.length}</strong><span>Total products</span></article>
          <article><strong>{products.filter((item) => item.active).length}</strong><span>Published</span></article>
          <article><strong>{products.filter((item) => item.featured).length}</strong><span>Featured</span></article>
          <article><strong>{new Set(products.map((item) => item.category)).size}</strong><span>Categories</span></article>
        </div>

        {notice && <div className={styles.notice}>{notice}</div>}
        {error && <div className={styles.error} role="alert">{error}</div>}

        {editing && (
          <form className={styles.editor} onSubmit={saveProduct}>
            <div className={styles.editorHeader}>
              <div>
                <p className={styles.eyebrow}>{editing.id ? "Edit listing" : "New listing"}</p>
                <h2>{editing.id ? editing.name : "Create a product"}</h2>
              </div>
              <button type="button" className={styles.iconButton} onClick={() => setEditing(null)} aria-label="Close editor">×</button>
            </div>

            <div className={styles.formGrid}>
              <label className={styles.field}><span>Product name</span><input value={editing.name} onChange={(e) => updateField("name", e.target.value)} required /></label>
              <label className={styles.field}><span>URL slug</span><input value={editing.slug} onChange={(e) => updateField("slug", slugify(e.target.value))} required /></label>
              <label className={`${styles.field} ${styles.categorySelect}`}><span>Category</span><select value={editing.category} onChange={(e) => updateField("category", e.target.value)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className={styles.field}><span>Price ($)</span><input type="number" min="0" step="0.01" value={editing.price} onChange={(e) => updateField("price", Number(e.target.value))} required /></label>
              <label className={`${styles.field} ${styles.fullWidth}`}><span>Description</span><textarea rows="5" value={editing.description} onChange={(e) => updateField("description", e.target.value)} required /></label>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <span>Product images (Gallery)</span>
                <div className={styles.galleryContainer}>
                  <div className={styles.galleryGrid}>
                    {(editing.images || []).map((imgUrl, index) => (
                      <div key={imgUrl} className={`${styles.imageCard} ${index === 0 ? styles.primaryImage : ''}`}>
                        <img src={imgUrl} alt={`Product ${index + 1}`} />
                        {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
                        <div className={styles.imageActions}>
                          {index > 0 && (
                            <button type="button" className={styles.imageActionBtn} onClick={() => setPrimaryImage(index)} title="Make Primary">
                              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            </button>
                          )}
                          <button type="button" className={`${styles.imageActionBtn} ${styles.deleteBtn}`} onClick={() => removeImage(index)} title="Remove">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <label className={styles.imageDropzone}>
                      <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageUpload} disabled={uploading} />
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span>{uploading ? "Uploading..." : "Add Images"}</span>
                    </label>
                  </div>
                </div>
              </div>

              <label className={styles.field}><span>Minimum quantity</span><input type="number" min="1" value={editing.minQty} onChange={(e) => updateField("minQty", Number(e.target.value))} /></label>
              <div className={styles.switches}>
                {[["active", "Published"], ["featured", "Featured"], ["hasUpload", "Customer photo upload"], ["requiresQuote", "Quote required"]].map(([field, label]) => (
                  <label key={field}><input type="checkbox" checked={editing[field]} onChange={(e) => updateField(field, e.target.checked)} /><span>{label}</span></label>
                ))}
              </div>
            </div>

            <div className={styles.builderSection}>
              <div className={styles.builderHeader}><div><h3>Product options</h3><p>Add selections such as size, style, or color.</p></div><button type="button" className={styles.secondaryButton} onClick={() => updateField("options", [...editing.options, { name: "", type: "select", values: [] }])}>+ Add option</button></div>
              {editing.options.map((option, index) => (
                <div className={styles.builderRow} key={`option-${index}`}>
                  <input placeholder="Option name" value={option.name} onChange={(e) => updateOption(index, "name", e.target.value)} />
                  <select value={option.type} onChange={(e) => updateOption(index, "type", e.target.value)}><option value="select">Dropdown</option><option value="swatch">Buttons</option></select>
                  <input placeholder="Values separated by commas" value={option.values.join(", ")} onChange={(e) => updateOption(index, "values", e.target.value)} />
                  <button type="button" className={styles.removeButton} onClick={() => updateField("options", editing.options.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                </div>
              ))}
              {!editing.options.length && <p className={styles.emptyBuilder}>No configurable options.</p>}
            </div>

            <div className={styles.builderSection}>
              <div className={styles.builderHeader}><div><h3>Add-ons</h3><p>Optional extras customers can add to this product.</p></div><button type="button" className={styles.secondaryButton} onClick={() => updateField("addons", [...editing.addons, { name: "", price: 0, description: "" }])}>+ Add add-on</button></div>
              {editing.addons.map((addon, index) => (
                <div className={styles.builderRow} key={`addon-${index}`}>
                  <input placeholder="Add-on name" value={addon.name} onChange={(e) => updateAddon(index, "name", e.target.value)} />
                  <input type="number" min="0" step="0.01" placeholder="Price" value={addon.price} onChange={(e) => updateAddon(index, "price", e.target.value)} />
                  <input placeholder="Description" value={addon.description} onChange={(e) => updateAddon(index, "description", e.target.value)} />
                  <button type="button" className={styles.removeButton} onClick={() => updateField("addons", editing.addons.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                </div>
              ))}
              {!editing.addons.length && <p className={styles.emptyBuilder}>No add-ons.</p>}
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryButton} onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : "Save product"}</button>
            </div>
          </form>
        )}

        <div className={styles.catalogHeader}>
          <div><h2>Catalog</h2><p>Changes are reflected on the storefront immediately.</p></div>
          <input className={styles.search} type="search" placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>

        <div className={styles.productGrid}>
          {visibleProducts.map((product) => (
            <article className={styles.productCard} key={product.id}>
              <div className={styles.cardImage}>
                {(product.images?.[0] || product.image) ? (
                  <img src={product.images?.[0] || product.image} alt={product.name} />
                ) : (
                  <span>No image</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardMeta}><span>{product.category}</span><span className={product.active ? styles.live : styles.draft}>{product.active ? "Live" : "Draft"}</span></div>
                <h3>{product.name}</h3>
                <p className={styles.slug}>/{product.slug}</p>
                <div className={styles.cardFooter}><strong>${Number(product.price).toFixed(2)}</strong><div><button onClick={() => beginEdit(product)}>Edit</button><button className={styles.dangerLink} onClick={() => removeProduct(product)}>Delete</button></div></div>
              </div>
            </article>
          ))}
          {!visibleProducts.length && <div className={styles.noResults}>No products match your search.</div>}
        </div>
      </div>
    </section>
  );
}
