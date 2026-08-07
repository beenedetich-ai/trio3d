'use client';

import React, { useState, ChangeEvent } from 'react';
import { X, Plus, Trash2, Edit2, Upload, Image as ImageIcon, CheckCircle, RefreshCw, Star, Download, Copy, Lock, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, CATEGORIES } from '@/data/products';
import { SubcategoryMap, DEFAULT_SUBCATEGORIES } from '@/hooks/useSubcategoryStore';
import { CategoryItem } from '@/hooks/useCategoryStore';
import { uploadProductImage, isSupabaseConfigured } from '@/lib/supabase';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories?: string[];
  categoryItems?: CategoryItem[];
  subcategoriesMap?: SubcategoryMap;
  onAddProduct: (productData: Omit<Product, 'id'>) => void;
  onEditProduct: (id: string, updatedData: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onResetCatalog: () => void;
  onAddCategory?: (category: string | CategoryItem) => Promise<boolean | void> | boolean | void;
  onEditCategory?: (name: string, updatedData: Partial<CategoryItem>) => Promise<boolean | void> | boolean | void;
  onRemoveCategory?: (categoryName: string) => Promise<boolean | void> | boolean | void;
  onAddSubcategory?: (categoryName: string, subcategoryName: string) => Promise<boolean | void> | boolean | void;
  onRemoveSubcategory?: (categoryName: string, subcategoryName: string) => Promise<boolean | void> | boolean | void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  products,
  categories = CATEGORIES as unknown as string[],
  categoryItems = [],
  subcategoriesMap = DEFAULT_SUBCATEGORIES,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onResetCatalog,
  onAddCategory,
  onEditCategory,
  onRemoveCategory,
  onAddSubcategory,
  onRemoveSubcategory,
}) => {
  const ADMIN_PASSWORD = '212939@';
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [inputPassword, setInputPassword] = useState<string>('');
  const [authError, setAuthError] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'export'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError(false);
      setInputPassword('');
    } else {
      setAuthError(true);
    }
  };

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Llaveros');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<string[]>(['/images/soportes.png']);
  const [urlInput, setUrlInput] = useState('');
  const [materials, setMaterials] = useState('PLA, PETG');
  const [dimensions, setDimensions] = useState('');
  const [tags, setTags] = useState('Personalizable, 3D');
  const [isPopular, setIsPopular] = useState(false);

  // Envíopack Weight (Grams) & 3D Dimensions states
  const [peso, setPeso] = useState<string | number>('200');
  const [alto, setAlto] = useState<string | number>('10');
  const [ancho, setAncho] = useState<string | number>('10');
  const [largo, setLargo] = useState<string | number>('10');

  const [notification, setNotification] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [newSubcategoryInput, setNewSubcategoryInput] = useState('');
  const [selectedSubCategoryParent, setSelectedSubCategoryParent] = useState<string>('Figuras');

  // Available categories (excluding 'Todos')
  const formCategories = categories.filter((c) => c !== 'Todos');

  // Active subcategories for selected form category
  const activeSubcategoriesForCategory = subcategoriesMap[category] || [];

  // Category Form State
  const [catNameInput, setCatNameInput] = useState('');
  const [catBadgeInput, setCatBadgeInput] = useState('Novedad');
  const [catDescInput, setCatDescInput] = useState('');
  const [catImageInput, setCatImageInput] = useState('/images/hero.png');
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [isUploadingCatImage, setIsUploadingCatImage] = useState(false);

  const resetCategoryForm = () => {
    setEditingCategoryName(null);
    setCatNameInput('');
    setCatBadgeInput('Novedad');
    setCatDescInput('');
    setCatImageInput('/images/hero.png');
  };

  const handleCatImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCatImage(true);
    if (isSupabaseConfigured) {
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setCatImageInput(publicUrl);
        setIsUploadingCatImage(false);
        return;
      }
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setCatImageInput(reader.result);
      setIsUploadingCatImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim()) {
      alert('Por favor ingresá el nombre de la categoría.');
      return;
    }

    const payload: CategoryItem = {
      name: catNameInput.trim(),
      badge: catBadgeInput.trim() || 'Novedad',
      desc: catDescInput.trim() || 'Productos y diseños impresos en 3D de alta precisión.',
      image: catImageInput || '/images/hero.png',
    };

    if (editingCategoryName) {
      if (onEditCategory) {
        await onEditCategory(editingCategoryName, payload);
        setNotification(`¡Categoría "${editingCategoryName}" actualizada correctamente!`);
      }
    } else {
      if (onAddCategory) {
        const ok = await onAddCategory(payload);
        if (ok !== false) {
          setCategory(payload.name as any);
          setNotification(`¡Categoría "${payload.name}" creada con éxito!`);
        }
      }
    }
    resetCategoryForm();
  };

  const handleEditCategoryClick = (catItem: CategoryItem) => {
    setEditingCategoryName(catItem.name);
    setCatNameInput(catItem.name);
    setCatBadgeInput(catItem.badge || 'Novedad');
    setCatDescInput(catItem.desc || '');
    setCatImageInput(catItem.image || '/images/hero.png');
  };

  const handleAddSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcategoryInput.trim() || !selectedSubCategoryParent) return;
    if (onAddSubcategory) {
      const ok = await onAddSubcategory(selectedSubCategoryParent, newSubcategoryInput.trim());
      if (ok !== false) {
        setSubcategory(newSubcategoryInput.trim());
        setNewSubcategoryInput('');
        setNotification(`¡Subcategoría "${newSubcategoryInput.trim()}" agregada a ${selectedSubCategoryParent}!`);
      }
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle local image files upload -> Supabase Storage or Base64 Data URL (up to 5 images max)
  const handleImageFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length >= 5) {
      alert('Ya has alcanzado el límite máximo de 5 imágenes por producto.');
      return;
    }

    setIsUploadingImage(true);
    const newUploadedUrls: string[] = [];
    const filesArray = Array.from(files);

    for (const file of filesArray) {
      if (images.length + newUploadedUrls.length >= 5) {
        alert('Se ha alcanzado el límite máximo de 5 imágenes por producto.');
        break;
      }

      if (isSupabaseConfigured) {
        const publicUrl = await uploadProductImage(file);
        if (publicUrl) {
          newUploadedUrls.push(publicUrl);
          continue;
        }
      }

      // Fallback if Supabase not configured or upload failed
      const base64Url = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.readAsDataURL(file);
      });

      if (base64Url) {
        newUploadedUrls.push(base64Url);
      }
    }

    if (newUploadedUrls.length > 0) {
      setImages((prev) => {
        // If prev only had default image and we're adding real images, replace default image
        const cleanPrev = prev.length === 1 && prev[0] === '/images/soportes.png' ? [] : prev;
        const combined = [...cleanPrev, ...newUploadedUrls].slice(0, 5);
        return combined;
      });
      setNotification(`¡${newUploadedUrls.length} imagen(es) agregada(s) correctamente!`);
    }

    setIsUploadingImage(false);
    // Reset file input value
    e.target.value = '';
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    if (images.length >= 5) {
      alert('Ya has alcanzado el límite máximo de 5 imágenes por producto.');
      return;
    }

    setImages((prev) => {
      const cleanPrev = prev.length === 1 && prev[0] === '/images/soportes.png' ? [] : prev;
      return [...cleanPrev, urlInput.trim()].slice(0, 5);
    });
    setUrlInput('');
    setNotification('¡Enlace de imagen agregado a la lista!');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      return updated.length > 0 ? updated : ['/images/soportes.png'];
    });
  };

  const handleMakeCover = (indexToCover: number) => {
    if (indexToCover === 0) return;
    setImages((prev) => {
      const target = prev[indexToCover];
      const rest = prev.filter((_, idx) => idx !== indexToCover);
      return [target, ...rest];
    });
    setNotification('¡Imagen de portada actualizada!');
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Llaveros');
    setSubcategory('');
    setDescription('');
    setPrice('');
    setImages(['/images/soportes.png']);
    setUrlInput('');
    setMaterials('PLA, PETG');
    setDimensions('');
    setTags('Personalizable, 3D');
    setIsPopular(false);
    setPeso('200');
    setAlto('10');
    setAncho('10');
    setLargo('10');
  };

  const handleEditClick = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setCategory(product.category);
    setSubcategory(product.subcategory || '');
    setDescription(product.description);
    setPrice(product.price);
    const prodImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image || '/images/soportes.png'];
    setImages(prodImages);
    setUrlInput('');
    setMaterials(product.materials.join(', '));
    setDimensions(product.dimensions || '');
    setTags(product.tags.join(', '));
    setIsPopular(!!product.isPopular);
    setPeso(product.peso && product.peso < 5 ? product.peso * 1000 : (product.peso ?? 200));
    setAlto(product.alto ?? 10);
    setAncho(product.ancho ?? 10);
    setLargo(product.largo ?? 10);
    setActiveTab('create');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !price.trim() || !description.trim()) {
      alert('Por favor completa el nombre, precio y descripción.');
      return;
    }

    const parsedMaterials = materials
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const numPeso = Math.max(1, parseFloat(String(peso)) || 200);
    const numAlto = Math.max(1, parseFloat(String(alto)) || 10);
    const numAncho = Math.max(1, parseFloat(String(ancho)) || 10);
    const numLargo = Math.max(1, parseFloat(String(largo)) || 10);

    const finalImages = images.length > 0 ? images.slice(0, 5) : ['/images/soportes.png'];

    const productPayload = {
      name,
      category,
      subcategory: subcategory.trim() || undefined,
      description,
      price,
      image: finalImages[0],
      images: finalImages,
      materials: parsedMaterials.length > 0 ? parsedMaterials : ['PLA'],
      dimensions: dimensions || `${numAlto} x ${numAncho} x ${numLargo} cm`,
      tags: parsedTags.length > 0 ? parsedTags : ['3D'],
      isPopular,
      peso: numPeso,
      alto: numAlto,
      ancho: numAncho,
      largo: numLargo,
    };

    if (editingId) {
      onEditProduct(editingId, productPayload);
      setNotification(`¡Producto "${name}" actualizado con éxito!`);
    } else {
      onAddProduct(productPayload);
      setNotification(`¡Producto "${name}" guardado exitosamente!`);
    }

    resetForm();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyCode = () => {
    const codeString = `export const PRODUCTS = ${JSON.stringify(products, null, 2)};`;
    navigator.clipboard.writeText(codeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neutral-900/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-500 border border-brand-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  Panel de Administración <span className="text-xs font-mono font-normal text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/30">Trío 3D</span>
                </h3>
                <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                  {isSupabaseConfigured ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ☁️ Sincronización en la Nube Activa (Supabase)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                      ⚠️ Modo Local (Faltan variables en Cloudflare Pages)
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated && (
                <button
                  onClick={() => setIsAuthenticated(false)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white text-xs font-bold transition-colors border border-white/10"
                >
                  🔒 Cerrar Sesión
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isAuthenticated ? (
            /* Password Authentication Screen */
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 text-pink-400 border border-pink-500/30 shadow-2xl animate-pulse">
                <Lock className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Acceso Administrador Trío 3D</h3>
                <p className="text-sm text-neutral-400 font-light mt-1">
                  Ingresá tu contraseña de seguridad para gestionar el catálogo
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
                <div>
                  <input
                    type="password"
                    required
                    autoFocus
                    placeholder="Escribí la contraseña aquí..."
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      if (authError) setAuthError(false);
                    }}
                    className={`w-full bg-white/[0.05] border ${
                      authError ? 'border-rose-500 focus:ring-rose-500' : 'border-white/20 focus:border-pink-500'
                    } rounded-2xl px-5 py-3.5 text-base text-white text-center tracking-widest placeholder-neutral-500 focus:outline-none transition-all shadow-inner`}
                  />
                  {authError && (
                    <p className="text-xs font-bold text-rose-400 mt-2">
                      ⚠️ Contraseña incorrecta. Verificá los caracteres e intentá de nuevo.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-pink-500/25 border border-white/20 transition-all cursor-pointer"
                >
                  Ingresar al Panel
                </button>
              </form>
            </div>
          ) : (
            <>

          {/* Navigation Tabs */}
          <div className="flex border-b border-white/10 bg-neutral-900/30 px-6 gap-2 pt-3">
            <button
              onClick={() => {
                resetForm();
                setActiveTab('create');
              }}
              className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                activeTab === 'create'
                  ? 'bg-neutral-950 text-white border-t-2 border-brand-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4 text-brand-500" />
              <span>{editingId ? 'Editar Producto' : 'Cargar Nuevo Producto'}</span>
            </button>

            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                activeTab === 'list'
                  ? 'bg-neutral-950 text-white border-t-2 border-brand-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Edit2 className="w-4 h-4 text-brand-500" />
              <span>Gestionar Catálogo ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                activeTab === 'export'
                  ? 'bg-neutral-950 text-white border-t-2 border-brand-500'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Download className="w-4 h-4 text-brand-500" />
              <span>Exportar Datos</span>
            </button>
          </div>

          {/* Alert Banner */}
          {notification && (
            <div className="bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-400 px-6 py-3 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4" />
              <span>{notification}</span>
            </div>
          )}

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-none">
            {activeTab === 'create' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Maceta Voronoi 3D"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Categoría *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as Product['category'])}
                          className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-brand-500"
                        >
                          {formCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Subcategoría (Seleccionar o crear)
                        </label>
                        <div className="space-y-2">
                          <select
                            value={activeSubcategoriesForCategory.includes(subcategory) ? subcategory : subcategory ? 'custom' : ''}
                            onChange={(e) => {
                              if (e.target.value !== 'custom') {
                                setSubcategory(e.target.value);
                              }
                            }}
                            className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                          >
                            <option value="">-- Seleccionar Subcategoría --</option>
                            {activeSubcategoriesForCategory.map((sub) => (
                              <option key={sub} value={sub}>
                                {sub}
                              </option>
                            ))}
                            <option value="custom">✏️ Escribir nueva subcategoría...</option>
                          </select>

                          {(!activeSubcategoriesForCategory.includes(subcategory) || subcategory === '') && (
                            <input
                              type="text"
                              placeholder="O escribí una nueva subcategoría..."
                              value={subcategory}
                              onChange={(e) => setSubcategory(e.target.value)}
                              className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        Precio *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Desde $4.500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                        Descripción Corta *
                      </label>
                      <textarea
                        rows={3}
                        required
                        placeholder="Explicación concisa del producto, usos y acabados..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Materiales (separados por coma)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: PLA, PETG"
                          value={materials}
                          onChange={(e) => setMaterials(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
                          Dimensiones Texto
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: 120 x 80 x 50 mm"
                          value={dimensions}
                          onChange={(e) => setDimensions(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    {/* Envíopack Logistical Specs (Weight & 3D Box Dimensions) */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                        <span>📦 Datos Logísticos para Cotización Envíopack</span>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Peso (Gramos / g)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="250"
                            value={peso}
                            onChange={(e) => setPeso(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Alto (cm)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="10"
                            value={alto}
                            onChange={(e) => setAlto(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Ancho (cm)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="10"
                            value={ancho}
                            onChange={(e) => setAncho(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                            Largo (cm)
                          </label>
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="10"
                            value={largo}
                            onChange={(e) => setLargo(e.target.value)}
                            className="w-full bg-white/[0.06] border border-white/20 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image & Options */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                          Imágenes del Producto (Máx. 5 fotos)
                        </label>
                        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          images.length >= 5
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                        }`}>
                          {images.length}/5 fotos
                        </span>
                      </div>

                      {/* File Upload Box */}
                      <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-colors bg-white/[0.02] ${
                        images.length >= 5
                          ? 'border-neutral-700 opacity-60 cursor-not-allowed'
                          : 'border-white/20 hover:border-brand-500/50 cursor-pointer'
                      }`}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={images.length >= 5 || isUploadingImage}
                          onChange={handleImageFileUpload}
                          className="hidden"
                          id="admin-image-upload"
                        />
                        <label
                          htmlFor={images.length >= 5 ? undefined : "admin-image-upload"}
                          className={`flex flex-col items-center justify-center gap-2 ${
                            images.length >= 5 ? 'cursor-not-allowed text-neutral-500' : 'cursor-pointer text-neutral-300 hover:text-white'
                          }`}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                              <span className="text-xs font-bold text-brand-400">Subiendo fotos a la nube...</span>
                            </>
                          ) : images.length >= 5 ? (
                            <>
                              <ImageIcon className="w-8 h-8 text-amber-500" />
                              <span className="text-xs font-bold text-amber-400">Límite alcanzado (5/5 fotos)</span>
                              <span className="text-[10px] text-neutral-500">Elimina una foto para subir otra</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-brand-500" />
                              <span className="text-xs font-bold">Subir foto(s) desde tu computadora</span>
                              <span className="text-[10px] text-neutral-500">Podés seleccionar hasta 5 fotos (PNG, JPG, WEBP)</span>
                            </>
                          )}
                        </label>
                      </div>

                      {/* URL input fallback */}
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="O pegar enlace URL de foto (https://...)"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          disabled={images.length >= 5}
                          className="flex-1 bg-white/[0.04] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={handleAddUrlImage}
                          disabled={!urlInput.trim() || images.length >= 5}
                          className="px-3 py-2 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white disabled:opacity-40 disabled:hover:bg-brand-500/20 text-xs font-bold transition-colors border border-brand-500/30 whitespace-nowrap"
                        >
                          + Agregar
                        </button>
                      </div>

                      {/* Image Thumbnails Gallery */}
                      <div className="mt-3 space-y-2">
                        <span className="text-[11px] font-bold text-neutral-400 block uppercase tracking-wider">
                          Galería cargada ({images.length} de 5):
                        </span>
                        <div className="grid grid-cols-5 gap-2">
                          {images.map((imgUrl, idx) => {
                            const isCover = idx === 0;
                            return (
                              <div
                                key={idx}
                                className={`relative group aspect-square rounded-xl overflow-hidden bg-neutral-900 border transition-all ${
                                  isCover ? 'border-brand-500 ring-2 ring-brand-500/30' : 'border-white/10 hover:border-white/30'
                                }`}
                              >
                                <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                                
                                {/* Badge Cover */}
                                {isCover ? (
                                  <span className="absolute top-1 left-1 bg-brand-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                                    Portada
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleMakeCover(idx)}
                                    className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 bg-black/70 hover:bg-brand-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-all"
                                    title="Hacer portada"
                                  >
                                    Portada
                                  </button>
                                )}

                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-all shadow"
                                  title="Eliminar foto"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}

                          {/* Empty slots placeholders if less than 5 */}
                          {Array.from({ length: Math.max(0, 5 - images.length) }).map((_, slotIdx) => (
                            <div
                              key={`empty-${slotIdx}`}
                              className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/[0.01] flex items-center justify-center text-neutral-600 text-[10px] font-mono"
                            >
                              + Slot
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Popular Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-brand-500/40">
                        <input
                          type="checkbox"
                          checked={isPopular}
                          onChange={(e) => setIsPopular(e.target.checked)}
                          className="w-5 h-5 accent-brand-500 rounded cursor-pointer"
                        />
                        <div>
                          <span className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-brand-500 fill-brand-500" />
                            Destacar como "MÁS VENDIDO"
                          </span>
                          <span className="text-xs text-neutral-400 block font-light">
                            Muestra una insignia dorada prominente en el catálogo.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-5 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                    >
                      Cancelar Edición
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-500 via-orange-500 to-orange-600 hover:from-brand-600 hover:to-orange-700 text-white text-sm font-extrabold shadow-xl shadow-brand-500/30 border border-white/20"
                  >
                    {editingId ? 'Guardar Cambios del Producto' : 'Publicar Producto en la Web'}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'list' && (
              <div className="space-y-6">
                {/* Módulo de Organización y Gestión de Categorías */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-brand-500/30 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4 text-brand-400" />
                      <span>{editingCategoryName ? `Editar Categoría "${editingCategoryName}"` : 'Crear Nueva Categoría para la Portada'}</span>
                    </label>
                    <span className="text-[11px] text-neutral-300 font-semibold px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                      {categoryItems.length} rubros activos
                    </span>
                  </div>

                  {/* Formulario Completo de Categoría */}
                  <form onSubmit={handleSaveCategorySubmit} className="space-y-3 bg-neutral-950/60 p-4 rounded-xl border border-white/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                          Nombre de la Categoría *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Llaveros, Iluminación..."
                          value={catNameInput}
                          onChange={(e) => setCatNameInput(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                          Insignia / Badge (Pill)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej: Personalizables, Novedad, Ergonómicos..."
                          value={catBadgeInput}
                          onChange={(e) => setCatBadgeInput(e.target.value)}
                          className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Descripción Corta (se muestra en la tarjeta de la portada)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Nombres, logos de empresas, formas bicolores..."
                        value={catDescInput}
                        onChange={(e) => setCatDescInput(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-300 uppercase mb-1">
                        Imagen de la Categoría
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-neutral-200 text-xs font-bold border border-white/15 flex items-center gap-1.5 transition-colors whitespace-nowrap">
                          {isUploadingCatImage ? (
                            <Loader2 className="w-4 h-4 animate-spin text-brand-500" />
                          ) : (
                            <Upload className="w-4 h-4 text-brand-500" />
                          )}
                          <span>Subir Foto</span>
                          <input type="file" accept="image/*" onChange={handleCatImageUpload} className="hidden" />
                        </label>

                        <input
                          type="text"
                          placeholder="O pegar URL de imagen (https://...)"
                          value={catImageInput}
                          onChange={(e) => setCatImageInput(e.target.value)}
                          className="flex-1 w-full bg-neutral-900 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                        />

                        {catImageInput && (
                          <div className="w-9 h-9 rounded-lg overflow-hidden bg-neutral-900 border border-white/20 flex-shrink-0">
                            <img src={catImageInput} alt="Vista previa" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      {editingCategoryName && (
                        <button
                          type="button"
                          onClick={resetCategoryForm}
                          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold"
                        >
                          Cancelar Edición
                        </button>
                      )}
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-90 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{editingCategoryName ? 'Guardar Cambios de Categoría' : 'Guardar Nueva Categoría'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Lista de categorías existentes con miniaturas y botón de edición */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2 tracking-wider">
                      Categorías Activas en la Portada (haz clic en ✏️ para editar o 🗑️ para eliminar):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categoryItems.map((catItem) => (
                        <div
                          key={catItem.name}
                          className="p-3 rounded-xl bg-neutral-900 border border-white/15 flex items-center justify-between gap-3 shadow-sm hover:border-brand-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-950 flex-shrink-0 border border-white/10">
                              <img src={catItem.image || '/images/hero.png'} alt={catItem.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-white truncate">{catItem.name}</h5>
                                {catItem.badge && (
                                  <span className="text-[9px] font-semibold px-1.5 py-0.2 bg-white/10 text-brand-300 rounded border border-white/15">
                                    {catItem.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-neutral-400 truncate font-light mt-0.5">
                                {catItem.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditCategoryClick(catItem)}
                              className="p-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors"
                              title={`Editar categoría ${catItem.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onRemoveCategory && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar la categoría "${catItem.name}"?`)) {
                                    onRemoveCategory(catItem.name);
                                    setNotification(`Categoría "${catItem.name}" eliminada.`);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                                title={`Eliminar categoría ${catItem.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Módulo de Organización y Gestión de Subcategorías Fijas */}
                <div className="p-4.5 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-amber-500/10 border border-pink-500/30 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-pink-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-pink-400" />
                      <span>Organizar Subcategorías Fijas (Ej: Figuras ➔ Roblox)</span>
                    </label>
                  </div>

                  {/* Formulario para Agregar Nueva Subcategoría */}
                  <form onSubmit={handleAddSubcategorySubmit} className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedSubCategoryParent}
                      onChange={(e) => setSelectedSubCategoryParent(e.target.value)}
                      className="bg-neutral-950 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                    >
                      {formCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          En: {cat}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Nombre de subcategoría (ej: Roblox, Anime...)"
                      value={newSubcategoryInput}
                      onChange={(e) => setNewSubcategoryInput(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-white/20 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 hover:opacity-90 text-white text-xs font-bold transition-all shadow-md whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar Subcategoría</span>
                    </button>
                  </form>

                  {/* Lista de subcategorías existentes para la categoría seleccionada */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-2 tracking-wider">
                      Subcategorías fijas en "{selectedSubCategoryParent}":
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(subcategoriesMap[selectedSubCategoryParent] || []).length === 0 ? (
                        <span className="text-xs text-neutral-500 italic">No hay subcategorías agregadas aún en {selectedSubCategoryParent}.</span>
                      ) : (
                        (subcategoriesMap[selectedSubCategoryParent] || []).map((sub) => (
                          <span
                            key={sub}
                            className="text-xs bg-neutral-900 border border-pink-500/30 px-3 py-1.5 rounded-xl text-pink-200 flex items-center gap-2 shadow-sm font-medium"
                          >
                            <span>{sub}</span>
                            {onRemoveSubcategory && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`¿Estás seguro de eliminar la subcategoría "${sub}" de ${selectedSubCategoryParent}?`)) {
                                    onRemoveSubcategory(selectedSubCategoryParent, sub);
                                    setNotification(`Subcategoría "${sub}" eliminada de ${selectedSubCategoryParent}.`);
                                  }
                                }}
                                className="text-neutral-500 hover:text-rose-400 transition-colors p-0.5"
                                title={`Eliminar subcategoría ${sub}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-neutral-400">
                    Total: <strong className="text-white">{products.length} productos</strong> activos
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('¿Deseas restablecer el catálogo al estado original por defecto?')) {
                        onResetCatalog();
                      }
                    }}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restablecer Catálogo Base</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 flex items-center gap-4 hover:border-brand-500/40 transition-colors"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-brand-400">
                            {p.category}
                          </span>
                          {p.subcategory && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-500/15 text-pink-300 border border-pink-500/30">
                              {p.subcategory}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white truncate mt-1">{p.name}</h4>
                        <p className="text-xs font-extrabold text-neutral-300">{p.price}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditClick(p)}
                          className="p-2 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar "${p.name}" del catálogo?`)) {
                              onDeleteProduct(p.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300">
                  Podés copiar el objeto TypeScript completo con todos los productos actuales para reemplazar permanentemente el archivo <code className="text-brand-400">src/data/products.ts</code> si lo deseas.
                </p>

                <div className="relative">
                  <textarea
                    readOnly
                    rows={12}
                    value={`export const PRODUCTS: Product[] = ${JSON.stringify(products, null, 2)};`}
                    className="w-full bg-neutral-900 border border-white/15 rounded-2xl p-4 font-mono text-xs text-neutral-300 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCode}
                    className="absolute top-3 right-3 flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg"
                  >
                    {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? '¡Copiado!' : 'Copiar Código JS/TS'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
