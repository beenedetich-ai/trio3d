'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Upload, Image as ImageIcon, CheckCircle, RefreshCw, Star, Download, Copy, Lock, Loader2, ShieldCheck, Eye, EyeOff, ExternalLink, Key, Search, Filter, Calendar, Percent, CheckSquare, Square, PackageCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, CATEGORIES } from '@/data/products';
import { SubcategoryMap, DEFAULT_SUBCATEGORIES } from '@/hooks/useSubcategoryStore';
import { CategoryItem } from '@/hooks/useCategoryStore';
import { uploadProductImage, isSupabaseConfigured } from '@/lib/supabase';
import { MercadoLibreService, MeliPublicationItem } from '@/services/mercadoLibreService';
import {
  calculateCleanPrice,
  sanitizeMeliTitle,
  sanitizeMeliDescription,
  groupAndDeduplicateMeliPublications,
  ConsolidatedMeliProduct,
  MeliPricingConfig,
  DEFAULT_MELI_PRICING_CONFIG,
} from '@/utils/meliSanitizer';



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

  const [activeTab, setActiveTab] = useState<'create' | 'list' | 'export' | 'mercadolibre'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mercado Libre Integration States
  const [meliClientId, setMeliClientId] = useState('');
  const [meliClientSecret, setMeliClientSecret] = useState('');
  const [meliRedirectUri, setMeliRedirectUri] = useState('https://trio-3d.beenedetich.workers.dev/meli/redirect');
  const [copiedMeliSql, setCopiedMeliSql] = useState(false);

  const handleCopyMeliSql = () => {
    const sql = `-- CREACIÓN DE TABLAS DE MERCADO LIBRE EN SUPABASE
CREATE TABLE IF NOT EXISTS public.mercadolibre_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL DEFAULT 'https://trio-3d.beenedetich.workers.dev/meli/redirect',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mercadolibre_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en mercadolibre_config" ON public.mercadolibre_config;
CREATE POLICY "Permitir todo en mercadolibre_config" ON public.mercadolibre_config FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.mercadolibre_tokens (
  id TEXT PRIMARY KEY DEFAULT 'default',
  user_id BIGINT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_in INTEGER NOT NULL,
  scope TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mercadolibre_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todo en mercadolibre_tokens" ON public.mercadolibre_tokens;
CREATE POLICY "Permitir todo en mercadolibre_tokens" ON public.mercadolibre_tokens FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedMeliSql(true);
    setTimeout(() => setCopiedMeliSql(false), 3000);
  };

  const [showMeliSecret, setShowMeliSecret] = useState(false);
  const [isSavingMeli, setIsSavingMeli] = useState(false);
  const [isMeliLoaded, setIsMeliLoaded] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [meliTokens, setMeliTokens] = useState<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    user_id?: number;
    expires_at?: string;
    updated_at?: string;
  } | null>(null);

  // Mercado Libre Sub-tabs and Publications States
  const [meliSubTab, setMeliSubTab] = useState<'publications' | 'config'>('publications');
  const [meliPublications, setMeliPublications] = useState<MeliPublicationItem[]>([]);
  const [isSearchingMeliPubs, setIsSearchingMeliPubs] = useState(false);
  const [selectedMeliItemIds, setSelectedMeliItemIds] = useState<string[]>([]);
  const [meliSearchError, setMeliSearchError] = useState<string | null>(null);

  // Filters & Pricing Recalculation state
  const [filterQuery, setFilterQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [isImportingMeli, setIsImportingMeli] = useState(false);
  const [meliPricingConfig, setMeliPricingConfig] = useState<MeliPricingConfig>(DEFAULT_MELI_PRICING_CONFIG);
  const [showPricingConfigPanel, setShowPricingConfigPanel] = useState<boolean>(true);

  // Raw JSON Debug Modal state
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [rawDebugData, setRawDebugData] = useState<any>(null);

  const handleOpenRawDebugModal = () => {
    const debugInfo = MercadoLibreService.getLastRawDebugInfo();
    setRawDebugData(debugInfo || { message: 'Aún no se ha realizado ninguna consulta a la API de Mercado Libre. Hacé clic en Buscar / Aplicar Filtros primero.' });
    setShowRawJsonModal(true);
  };


  const handleFetchMeliPublications = async () => {
    setIsSearchingMeliPubs(true);
    setMeliSearchError(null);
    try {
      const items = await MercadoLibreService.searchUserItems({
        status: filterStatus,
        query: filterQuery,
      });
      setMeliPublications(items);
      setSelectedMeliItemIds([]);
      if (items.length === 0) {
        setMeliSearchError('No se encontraron publicaciones con el filtro seleccionado.');
      }
    } catch (err: any) {
      console.error('Error buscando publicaciones ML:', err);
      setMeliSearchError(err.message || 'Error al conectar con Mercado Libre (fetch falló)');
    } finally {
      setIsSearchingMeliPubs(false);
    }
  };


  const handleToggleSelectAllMeli = () => {
    if (selectedMeliItemIds.length === meliPublications.length) {
      setSelectedMeliItemIds([]);
    } else {
      setSelectedMeliItemIds(meliPublications.map((item) => item.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    setSelectedMeliItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleImportSelectedItems = async () => {
    if (selectedMeliItemIds.length === 0) {
      alert('Por favor seleccioná al menos una publicación para importar.');
      return;
    }

    setIsImportingMeli(true);
    let count = 0;

    try {
      // 1. Agrupar y consolidar publicaciones según configuración
      const consolidatedList = groupAndDeduplicateMeliPublications(meliPublications, meliPricingConfig);

      // 2. Filtrar los productos consolidados seleccionados
      const selectedConsolidated = consolidatedList.filter((item) =>
        item.meli_ids.some((id) => selectedMeliItemIds.includes(id)) || selectedMeliItemIds.includes(item.id)
      );

      for (const item of selectedConsolidated) {
        const catName = item.category_name || 'General';

        // A. Crear categoría si no existe
        if (onAddCategory) {
          await onAddCategory({
            name: catName,
            badge: 'Tienda Oficial',
            desc: 'Categoría sincronizada desde Mercado Libre',
            image: item.pictures[0]?.url || item.lowestPriceItem.thumbnail || '/images/hero.png',
          });
        }

        const mainImg = item.pictures[0]?.url || item.lowestPriceItem.thumbnail || '/images/soportes.png';
        const allImages = item.pictures.map((p) => p.url).filter(Boolean);

        // B. Crear producto consolidado en Supabase con variantes y precio basado en el menor costo
        await onAddProduct({
          name: item.title,
          category: catName,
          description: item.description,
          price: item.cleanPriceResult.formattedPrice,
          image: mainImg,
          images: allImages.length > 0 ? allImages : [mainImg],
          materials: ['PLA Premium', 'PETG High Detail'],
          tags: ['Tienda Oficial', '3D', 'Consolidado'],
          peso: 200,
          alto: 10,
          ancho: 10,
          largo: 10,
          meli_id: item.id,
          meli_ids: item.meli_ids,
          variants: item.variants,
        });

        count++;
      }

      setNotification(`¡Se importaron exitosamente ${count} productos consolidados (con variantes y precio limpio basado en menor costo base)!`);
      setTimeout(() => setNotification(null), 5000);
      setSelectedMeliItemIds([]);
    } catch (err: any) {
      console.error('Error importando publicaciones:', err);
      alert('Error importando publicaciones: ' + (err.message || err));
    } finally {
      setIsImportingMeli(false);
    }
  };




  useEffect(() => {
    if (activeTab === 'mercadolibre' && !isMeliLoaded) {
      MercadoLibreService.getConfigFromSupabase().then((cfg) => {
        if (cfg) {
          setMeliClientId(cfg.client_id || '');
          setMeliClientSecret(cfg.client_secret || '');
          if (cfg.redirect_uri) setMeliRedirectUri(cfg.redirect_uri);
        }
      });

      MercadoLibreService.getTokensFromSupabase().then((toks) => {
        if (toks) setMeliTokens(toks);
        setIsMeliLoaded(true);
      });
    }
  }, [activeTab, isMeliLoaded]);

  const handleSaveMeliConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meliClientId.trim() || !meliClientSecret.trim()) {
      alert('Por favor ingresá tanto el Client ID como el Client Secret.');
      return;
    }
    setIsSavingMeli(true);
    const success = await MercadoLibreService.saveConfigToSupabase({
      client_id: meliClientId.trim(),
      client_secret: meliClientSecret.trim(),
      redirect_uri: meliRedirectUri.trim(),
    });
    setIsSavingMeli(false);

    if (success) {
      setNotification('¡Configuración de Mercado Libre guardada encriptada en Supabase!');
      setTimeout(() => setNotification(null), 4000);
    } else {
      alert('No se pudo guardar la configuración en Supabase. Verificá que exista la tabla "mercadolibre_config".');
    }
  };

  const handleRefreshTokenInAdmin = async () => {
    if (!meliTokens?.refresh_token) {
      alert('No hay ningún Refresh Token guardado en la base de datos.');
      return;
    }
    if (!meliClientId.trim() || !meliClientSecret.trim()) {
      alert('Client ID y Client Secret son requeridos para refrescar el token.');
      return;
    }

    setIsRefreshingToken(true);
    try {
      const meliService = new MercadoLibreService(meliClientId, meliClientSecret, meliRedirectUri);
      const newTokens = await meliService.refreshToken(meliTokens.refresh_token);
      await MercadoLibreService.saveTokensToSupabase(newTokens);
      setMeliTokens(newTokens);
      setNotification('¡Token de Mercado Libre refrescado y guardado en Supabase!');
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert('Error al refrescar token: ' + (err.message || err));
    } finally {
      setIsRefreshingToken(false);
    }
  };

  const handleTriggerAuthorize = () => {
    if (!meliClientId.trim()) {
      alert('Por favor ingresá un Client ID antes de iniciar la autorización.');
      return;
    }
    const meliService = new MercadoLibreService(meliClientId, meliClientSecret, meliRedirectUri);
    const authUrl = meliService.getAuthorizeUrl(meliRedirectUri);
    window.open(authUrl, '_blank');
  };


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
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [customSubcatInput, setCustomSubcatInput] = useState('');
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
    setSubcategories([]);
    setCustomSubcatInput('');
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
    const prodSubcats = Array.isArray(product.subcategories) && product.subcategories.length > 0
      ? product.subcategories
      : (product.subcategory ? product.subcategory.split(',').map((s) => s.trim()).filter(Boolean) : []);
    setSubcategories(prodSubcats);
    setCustomSubcatInput('');
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
    const finalSubcategories = subcategories.length > 0
      ? subcategories
      : (subcategory.trim() ? subcategory.split(',').map((s) => s.trim()).filter(Boolean) : []);

    const productPayload = {
      name,
      category,
      subcategory: finalSubcategories.join(', ') || undefined,
      subcategories: finalSubcategories,
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

            <button
              onClick={() => setActiveTab('mercadolibre')}
              className={`px-5 py-3 text-xs font-bold rounded-t-xl transition-colors flex items-center gap-2 ${
                activeTab === 'mercadolibre'
                  ? 'bg-neutral-950 text-amber-400 border-t-2 border-amber-500'
                  : 'text-neutral-400 hover:text-amber-400'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Mercado Libre</span>
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

                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Subcategorías Compatibles (Podés elegir varias a la vez)</span>
                          <span className="text-[10px] text-brand-400 font-semibold">{subcategories.length} seleccionada(s)</span>
                        </label>
                        
                        {/* Interactive Pill Buttons for Active Subcategories */}
                        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
                          {activeSubcategoriesForCategory.length > 0 && (
                            <div>
                              <span className="text-[10px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                                Subcategorías disponibles en {category}:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {activeSubcategoriesForCategory.map((sub) => {
                                  const isSelected = subcategories.includes(sub);
                                  return (
                                    <button
                                      type="button"
                                      key={sub}
                                      onClick={() => {
                                        if (isSelected) {
                                          setSubcategories(subcategories.filter((s) => s !== sub));
                                        } else {
                                          setSubcategories([...subcategories, sub]);
                                        }
                                      }}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                                        isSelected
                                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 shadow-md shadow-pink-500/20'
                                          : 'bg-white/5 text-neutral-300 border-white/10 hover:border-white/30 hover:bg-white/10'
                                      }`}
                                    >
                                      <span>{isSelected ? '✓' : '+'}</span>
                                      <span>{sub}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Quick Custom Subcategory Input */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Escribí otra subcategoría (ej: PS5, Xbox, Pro...)"
                              value={customSubcatInput}
                              onChange={(e) => setCustomSubcatInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (customSubcatInput.trim() && !subcategories.includes(customSubcatInput.trim())) {
                                    setSubcategories([...subcategories, customSubcatInput.trim()]);
                                    setCustomSubcatInput('');
                                  }
                                }
                              }}
                              className="flex-1 bg-neutral-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customSubcatInput.trim() && !subcategories.includes(customSubcatInput.trim())) {
                                  setSubcategories([...subcategories, customSubcatInput.trim()]);
                                  setCustomSubcatInput('');
                                }
                              }}
                              disabled={!customSubcatInput.trim()}
                              className="px-3.5 py-2 rounded-xl bg-brand-500/20 text-brand-400 hover:bg-brand-500 hover:text-white disabled:opacity-40 text-xs font-bold transition-colors border border-brand-500/30 whitespace-nowrap"
                            >
                              + Añadir
                            </button>
                          </div>

                          {/* Active Selected Subcategories Pills */}
                          {subcategories.length > 0 && (
                            <div className="pt-2 border-t border-white/10">
                              <span className="text-[10px] font-bold text-neutral-400 block mb-1.5 uppercase tracking-wider">
                                Asignadas al producto:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {subcategories.map((sub) => (
                                  <span
                                    key={sub}
                                    className="px-2.5 py-1 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5"
                                  >
                                    <span>{sub}</span>
                                    <button
                                      type="button"
                                      onClick={() => setSubcategories(subcategories.filter((s) => s !== sub))}
                                      className="hover:text-white text-pink-400 transition-colors"
                                      title="Quitar subcategoría"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
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

            {activeTab === 'mercadolibre' && (
              <div className="space-y-6">
                {/* Sub-tabs bar */}
                <div className="flex border-b border-white/10 pb-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMeliSubTab('publications')}
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      meliSubTab === 'publications'
                        ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Publicaciones Mercado Libre</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeliSubTab('config')}
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                      meliSubTab === 'config'
                        ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white border border-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Configuración & OAuth</span>
                  </button>
                </div>

                {/* Sub-tab 1: Configuración & OAuth */}
                {meliSubTab === 'config' && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                          <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-extrabold text-amber-300">Integración con Mercado Libre OAuth 2.0</h4>
                          <p className="text-xs text-neutral-300 mt-1">
                            Configurá tus credenciales de aplicación de Mercado Libre. El <strong className="text-amber-300">Client Secret</strong> se guardará encriptado de forma segura en la base de datos Supabase (<code className="text-amber-400">public.mercadolibre_config</code>).
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopyMeliSql}
                        className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                        title="Copiar código SQL para ejecutar en Supabase SQL Editor"
                      >
                        {copiedMeliSql ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedMeliSql ? '¡SQL Copiado!' : 'Copiar SQL Tablas Supabase'}</span>
                      </button>
                    </div>

                    {/* Form Credenciales */}
                    <form onSubmit={handleSaveMeliConfig} className="p-5 rounded-2xl bg-neutral-900/80 border border-white/10 space-y-4">
                      <h4 className="text-xs font-extrabold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
                        <Key className="w-4 h-4 text-amber-400" />
                        Credenciales de la Aplicación
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1">
                            Client ID (App ID) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej: 1234567890123456"
                            value={meliClientId}
                            onChange={(e) => setMeliClientId(e.target.value)}
                            className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-neutral-300 mb-1 flex items-center justify-between">
                            <span>Client Secret (Encriptado) *</span>
                            <span className="text-[10px] text-amber-400 font-normal">🔒 Encriptación AES</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showMeliSecret ? 'text' : 'password'}
                              required
                              placeholder="Clave secreta de Mercado Libre"
                              value={meliClientSecret}
                              onChange={(e) => setMeliClientSecret(e.target.value)}
                              className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                            />
                            <button
                              type="button"
                              onClick={() => setShowMeliSecret(!showMeliSecret)}
                              className="absolute right-3 top-2.5 text-neutral-400 hover:text-white"
                            >
                              {showMeliSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-neutral-300 mb-1">
                          Redirect URI (URL de Redirección)
                        </label>
                        <input
                          type="url"
                          required
                          value={meliRedirectUri}
                          onChange={(e) => setMeliRedirectUri(e.target.value)}
                          className="w-full bg-neutral-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={isSavingMeli}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                        >
                          {isSavingMeli ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          <span>{isSavingMeli ? 'Guardando...' : 'Guardar Credenciales en Supabase'}</span>
                        </button>
                      </div>
                    </form>

                    {/* Section Authorize Button */}
                    <div className="p-5 rounded-2xl bg-neutral-900/90 border border-amber-500/20 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                            <span>⚡ Proceso de Autorización (Authorize)</span>
                          </h4>
                          <p className="text-xs text-neutral-400 mt-0.5">
                            Iniciá la autorización OAuth 2.0 redirigiendo tu cuenta a Mercado Libre para autorizar a la app y recibir el <code className="text-amber-400 font-mono">code</code>.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={handleTriggerAuthorize}
                          className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Iniciar Authorize</span>
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 text-xs font-mono text-neutral-400 space-y-1">
                        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">URL de Autorización Generada:</div>
                        <div className="text-amber-300 break-all">
                          {`https://auth.mercadolibre.com.ar/authorization?response_type=code&client_id=${meliClientId || 'CLIENT_ID'}&redirect_uri=${encodeURIComponent(meliRedirectUri)}`}
                        </div>
                      </div>
                    </div>

                    {/* Section Tokens Guardados en Supabase */}
                    <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Key className="w-4 h-4 text-emerald-400" />
                          <span>Tokens Guardados en Supabase (public.mercadolibre_tokens)</span>
                        </h4>

                        {meliTokens && (
                          <button
                            type="button"
                            onClick={handleRefreshTokenInAdmin}
                            disabled={isRefreshingToken}
                            className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                          >
                            {isRefreshingToken ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>{isRefreshingToken ? 'Refrescando...' : 'Refrescar Token Ahora'}</span>
                          </button>
                        )}
                      </div>

                      {meliTokens ? (
                        <div className="space-y-3">
                          <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-neutral-400 font-bold uppercase tracking-wider">Access Token:</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                                User ID: {meliTokens.user_id || 'N/A'}
                              </span>
                            </div>
                            <p className="font-mono text-xs text-slate-200 break-all bg-neutral-900 p-2 rounded-lg border border-white/5">
                              {meliTokens.access_token}
                            </p>
                          </div>

                          <div className="p-3.5 rounded-xl bg-neutral-950 border border-white/10 space-y-2">
                            <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Refresh Token:</div>
                            <p className="font-mono text-xs text-amber-300 break-all bg-neutral-900 p-2 rounded-lg border border-white/5">
                              {meliTokens.refresh_token}
                            </p>
                            {meliTokens.expires_at && (
                              <p className="text-[11px] text-neutral-400 mt-1">
                                Expira el: <span className="text-white font-mono">{new Date(meliTokens.expires_at).toLocaleString()}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-neutral-950 border border-dashed border-white/10 text-center text-xs text-neutral-400">
                          <span>No se encontraron tokens guardados en Supabase. Hacé clic en <strong>Iniciar Authorize</strong> para obtener y guardar tu primer token.</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-tab 2: Publicaciones Mercado Libre */}
                {meliSubTab === 'publications' && (
                  <div className="space-y-6">
                    {/* Filters Top Bar */}
                    <div className="p-5 rounded-2xl bg-neutral-900/90 border border-white/10 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                          <Filter className="w-4 h-4 text-amber-400" />
                          <span>Filtros de Publicaciones de Mercado Libre</span>
                        </h4>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleFetchMeliPublications}
                            disabled={isSearchingMeliPubs}
                            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
                          >
                            {isSearchingMeliPubs ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            <span>{isSearchingMeliPubs ? 'Buscando...' : 'Buscar / Aplicar Filtros'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleOpenRawDebugModal}
                            className="px-3.5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-white/15 text-amber-300 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
                            title="Ver JSON crudo de la respuesta obtenida de la API de Mercado Libre"
                          >
                            <Copy className="w-4 h-4 text-amber-400" />
                            <span>Ver JSON Crudo (Debug)</span>
                          </button>

                          {meliPublications.length > 0 && (
                            <button
                              type="button"
                              onClick={handleImportSelectedItems}
                              disabled={isImportingMeli || selectedMeliItemIds.length === 0}
                              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg ${
                                selectedMeliItemIds.length > 0
                                  ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 cursor-pointer shadow-emerald-500/20'
                                  : 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed'
                              }`}
                            >
                              {isImportingMeli ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              <span>{isImportingMeli ? 'Importando...' : `Importar Seleccionadas (${selectedMeliItemIds.length})`}</span>
                            </button>
                          )}
                        </div>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Search Query */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">Buscar por Título / Nombre</label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Ej: Maceta, Llavero, Soporte..."
                              value={filterQuery}
                              onChange={(e) => setFilterQuery(e.target.value)}
                              className="w-full bg-neutral-950 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                            />
                            <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                          </div>
                        </div>

                        {/* Publication Status */}
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">Estado de Publicación</label>
                          <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full bg-neutral-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="all">Todos los Estados</option>
                            <option value="active">🟢 Activas (active)</option>
                            <option value="paused">🟡 Pausadas (paused)</option>
                            <option value="closed">🔴 Cerradas (closed)</option>
                          </select>
                        </div>
                      </div>


                      {/* Pricing & Sanitization Controls Panel */}
                      <div className="p-4 rounded-2xl bg-neutral-950/80 border border-amber-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setShowPricingConfigPanel(!showPricingConfigPanel)}
                            className="text-xs font-extrabold text-amber-300 flex items-center gap-2 hover:text-amber-200 transition-colors"
                          >
                            <Percent className="w-4 h-4 text-amber-400" />
                            <span>⚙️ Parámetros de Recálculo de Precios y Sanitización de Contenidos</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
                              {showPricingConfigPanel ? 'Ocultar' : 'Mostrar'}
                            </span>
                          </button>

                          {meliPublications.length > 0 && (
                            <button
                              type="button"
                              onClick={handleToggleSelectAllMeli}
                              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-xs text-neutral-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              {selectedMeliItemIds.length === meliPublications.length ? (
                                <CheckSquare className="w-4 h-4 text-amber-400" />
                              ) : (
                                <Square className="w-4 h-4 text-neutral-400" />
                              )}
                              <span>
                                {selectedMeliItemIds.length === meliPublications.length ? 'Deseleccionar Todo' : `Seleccionar Todo (${meliPublications.length})`}
                              </span>
                            </button>
                          )}
                        </div>

                        {showPricingConfigPanel && (
                          <div className="pt-3 border-t border-white/10 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {/* Comisión Clásica */}
                              <div>
                                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                                  Comisión Clásica ML (%):
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={meliPricingConfig.classicCommissionPercent}
                                    onChange={(e) =>
                                      setMeliPricingConfig({
                                        ...meliPricingConfig,
                                        classicCommissionPercent: Number(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                                  />
                                  <span className="absolute right-3 top-1.5 text-xs text-neutral-500 font-bold">%</span>
                                </div>
                              </div>

                              {/* Comisión Premium */}
                              <div>
                                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                                  Comisión Premium ML (%):
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={meliPricingConfig.premiumCommissionPercent}
                                    onChange={(e) =>
                                      setMeliPricingConfig({
                                        ...meliPricingConfig,
                                        premiumCommissionPercent: Number(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                                  />
                                  <span className="absolute right-3 top-1.5 text-xs text-neutral-500 font-bold">%</span>
                                </div>
                              </div>

                              {/* Recargo por Cuotas */}
                              <div>
                                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                                  Recargo Cuotas/Financiación (%):
                                </label>
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={meliPricingConfig.financingSurchargePercent}
                                    onChange={(e) =>
                                      setMeliPricingConfig({
                                        ...meliPricingConfig,
                                        financingSurchargePercent: Number(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                                  />
                                  <span className="absolute right-3 top-1.5 text-xs text-neutral-500 font-bold">%</span>
                                </div>
                              </div>

                              {/* Deducción Envío Gratis ($ ARS) */}
                              <div>
                                <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                                  Deducción Envío Gratis ($):
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  placeholder="Ej: 3500"
                                  value={meliPricingConfig.estimatedFreeShippingCost || ''}
                                  onChange={(e) =>
                                    setMeliPricingConfig({
                                      ...meliPricingConfig,
                                      estimatedFreeShippingCost: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                                />
                              </div>
                            </div>

                            {/* Options Checkboxes */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={meliPricingConfig.sanitizeTitle}
                                  onChange={(e) =>
                                    setMeliPricingConfig({
                                      ...meliPricingConfig,
                                      sanitizeTitle: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-900 border-white/20"
                                />
                                <span className="text-xs text-neutral-300 font-bold">
                                  Sanitizar títulos (eliminar "Envío gratis", "Cuotas", "ML")
                                </span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={meliPricingConfig.sanitizeDescription}
                                  onChange={(e) =>
                                    setMeliPricingConfig({
                                      ...meliPricingConfig,
                                      sanitizeDescription: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-900 border-white/20"
                                />
                                <span className="text-xs text-neutral-300 font-bold">
                                  Sanitizar descripciones al tono de Tienda Oficial (conservar specs)
                                </span>
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer sm:col-span-2 pt-1 border-t border-white/5">
                                <input
                                  type="checkbox"
                                  checked={meliPricingConfig.groupDuplicates}
                                  onChange={(e) =>
                                    setMeliPricingConfig({
                                      ...meliPricingConfig,
                                      groupDuplicates: e.target.checked,
                                    })
                                  }
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-900 border-white/20"
                                />
                                <span className="text-xs text-amber-300 font-extrabold flex items-center gap-1.5">
                                  <PackageCheck className="w-4 h-4 text-amber-400" />
                                  <span>📦 Consolidar publicaciones duplicadas y crear variantes automáticamente (Precio neto basado en menor costo)</span>
                                </span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Results Grid / Loading / Error */}
                    {isSearchingMeliPubs && (
                      <div className="py-16 text-center space-y-3 bg-neutral-900/40 rounded-2xl border border-white/5">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                        <p className="text-xs text-neutral-300 font-medium">Buscando publicaciones en api.mercadolibre.com...</p>
                      </div>
                    )}

                    {meliSearchError && !isSearchingMeliPubs && (
                      <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl space-y-2 text-left">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-rose-400">
                          <X className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>Diagnóstico de Respuesta Mercado Libre API:</span>
                        </div>
                        <div className="p-3 bg-neutral-950 rounded-xl border border-white/10 font-mono text-[11px] text-rose-300 break-all leading-relaxed">
                          {meliSearchError}
                        </div>
                        <p className="text-[11px] text-neutral-400">
                          Si observás un error <strong>401 / 403 / Token expirado</strong>, andá a la pestaña <strong className="text-amber-400">Configuración & OAuth</strong> y hacé clic en <strong className="text-amber-300">Iniciar Authorize</strong> o <strong className="text-emerald-400">Refrescar Token Ahora</strong>.
                        </p>
                      </div>
                    )}


                    {meliPublications.length === 0 && !isSearchingMeliPubs && !meliSearchError && (
                      <div className="py-12 text-center bg-neutral-900/40 rounded-2xl border border-dashed border-white/10 space-y-3">
                        <Search className="w-8 h-8 text-amber-400/60 mx-auto" />
                        <h5 className="text-sm font-bold text-white">Búsqueda de Publicaciones de Mercado Libre</h5>
                        <p className="text-xs text-neutral-400 max-w-md mx-auto">
                          Haz clic en <strong className="text-amber-400 font-semibold">"Buscar / Aplicar Filtros"</strong> para traer el catálogo de publicaciones de tu cuenta.
                        </p>
                      </div>
                    )}

                    {meliPublications.length > 0 && !isSearchingMeliPubs && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {groupAndDeduplicateMeliPublications(meliPublications, meliPricingConfig).map((consolidated) => {
                          const isSelected = consolidated.meli_ids.some((id) => selectedMeliItemIds.includes(id));
                          const priceResult = consolidated.cleanPriceResult;
                          const groupCount = consolidated.groupedItems.length;

                          const handleToggleConsolidatedSelect = () => {
                            if (isSelected) {
                              setSelectedMeliItemIds((prev) => prev.filter((id) => !consolidated.meli_ids.includes(id)));
                            } else {
                              setSelectedMeliItemIds((prev) => Array.from(new Set([...prev, ...consolidated.meli_ids])));
                            }
                          };

                          return (
                            <div
                              key={consolidated.id}
                              onClick={handleToggleConsolidatedSelect}
                              className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                                isSelected
                                  ? 'bg-neutral-900 border-amber-500 shadow-lg shadow-amber-500/10'
                                  : 'bg-neutral-900/60 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <div>
                                {/* Top Row: Checkbox, ID, Group Badge & Status */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={handleToggleConsolidatedSelect}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-950 border-white/20"
                                    />
                                    <span className="text-[10px] font-mono font-bold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-white/10">
                                      {consolidated.id}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                    {groupCount > 1 && (
                                      <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                        📦 {groupCount} publicaciones unificadas
                                      </span>
                                    )}

                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      {priceResult.listingType}
                                    </span>
                                  </div>
                                </div>

                                {/* Image & Main Info */}
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-white/10">
                                    <img
                                      src={consolidated.pictures[0]?.url || consolidated.lowestPriceItem.thumbnail}
                                      alt={consolidated.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 block truncate mb-1">
                                      {consolidated.category_name || 'Mercado Libre'}
                                    </span>
                                    <h5 className="text-xs font-extrabold text-white line-clamp-2 leading-snug">
                                      {consolidated.title}
                                    </h5>
                                  </div>
                                </div>

                                {/* Variants chips */}
                                {consolidated.variants.length > 0 && (
                                  <div className="mb-3 space-y-1">
                                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Variantes consolidadas ({consolidated.variants.length}):</div>
                                    <div className="flex flex-wrap gap-1">
                                      {consolidated.variants.slice(0, 4).map((v, i) => (
                                        <span key={i} className="text-[9px] bg-neutral-950 text-neutral-300 px-1.5 py-0.5 rounded border border-white/10">
                                          {v.name}: <strong className="text-amber-300">{v.value}</strong>
                                        </span>
                                      ))}
                                      {consolidated.variants.length > 4 && (
                                        <span className="text-[9px] text-amber-400 font-bold">+{consolidated.variants.length - 4} más</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Bottom Row: Price breakdown */}
                              <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
                                <div>
                                  <div className="text-[10px] text-neutral-400 line-through">
                                    ML menor base: ${consolidated.lowestBasePrice.toLocaleString('es-AR')}
                                  </div>
                                  <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                                    <span>Neto Limpio: {priceResult.formattedPrice}</span>
                                    {priceResult.totalDeductionPercent > 0 && (
                                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1 rounded border border-emerald-500/30">
                                        -{priceResult.totalDeductionPercent}%
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {consolidated.permalink && (
                                  <a
                                    href={consolidated.permalink}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-amber-400 transition-colors"
                                    title="Ver publicación base en Mercado Libre"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}



          </div>
          </>
          )}
        </motion.div>
      </div>

      {/* Raw JSON Debug Modal */}
      {showRawJsonModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[85vh] bg-neutral-900 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-neutral-950">
              <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Copy className="w-4 h-4 text-amber-400" />
                <span>JSON Crudo de Respuesta API Mercado Libre (Debug)</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowRawJsonModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto font-mono text-xs text-amber-300 bg-neutral-950 space-y-4 flex-1">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(rawDebugData, null, 2));
                    alert('¡JSON crudo copiado al portapapeles!');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copiar JSON Completo</span>
                </button>
              </div>

              <pre className="whitespace-pre-wrap break-all p-4 rounded-2xl bg-neutral-900 border border-white/10 text-[11px] text-amber-200 leading-relaxed overflow-x-auto">
                {JSON.stringify(rawDebugData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};


