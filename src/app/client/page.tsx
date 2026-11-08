'use client';

import { useMenuLogic } from '@/src/hooks/useMenuLogic';
import styles from '../../components/client/ClientHome.module.css';
import MenuHeader from '@/src/components/client/MenuHeader';
import CategoryAccordion from '@/src/components/client/CategoryAccordion';
import ProductCustomizationModal from '@/src/components/client/ProductCustomizationModal';
import CartModal from '@/src/components/client/CartModal';

export default function ClientHomePage() {
  const {
    user,
    categories,
    loading,
    openCategories,
    selectedProduct,
    setSelectedProduct,
    isCartOpen,
    setIsCartOpen,
    quantity,
    setQuantity,
    notes,
    setNotes,
    availableExtras,
    selectedExtras,
    handleToggleExtra,
    pickupTime,
    setPickupTime,
    ingredientsMap,
    productsByCategory,
    isProductAvailable,
    toggleCategory,
    handleProductClick,
    handleConfirmAddToCart,
    cart,
    updateQuantity,
    removeFromCart,
    totalPrice,
    sendOrder,
    availablePickupSlots,
    totalCartItemsCount
  } = useMenuLogic();

  if (loading) {
    return <div className={styles.loadingMessage}>Caricamento menu in corso... 🍕</div>;
  }

  return (
    <main className={styles.container}>
      <MenuHeader 
        title={user ? `Benvenuto, ${user.name}!` : 'Il Nostro Menu'}
        subtitle={user ? 'Scegli tra le nostre specialità e componi il tuo ordine' : 'Esplora le nostre specialità. Accedi come cliente per ordinare!'}
        totalCartItemsCount={totalCartItemsCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <div className={styles.categoriesContainer}>
        {categories.map(category => {
          const isOpen = openCategories[category.id];
          const categoryProducts = productsByCategory[category.slug] || [];

          return (
            <CategoryAccordion 
              key={category.id}
              category={category}
              isOpen={isOpen}
              categoryProducts={categoryProducts}
              ingredientsMap={ingredientsMap}
              isProductAvailable={isProductAvailable}
              onToggleCategory={toggleCategory}
              onProductClick={handleProductClick}
              productButtonText="🛒 Aggiungi"
            />
          );
        })}
      </div>

      {selectedProduct && (
        <ProductCustomizationModal
          selectedProduct={selectedProduct}
          notes={notes}
          setNotes={setNotes}
          availableExtras={availableExtras}
          selectedExtras={selectedExtras}
          handleToggleExtra={handleToggleExtra}
          quantity={quantity}
          setQuantity={setQuantity}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirmAddToCart}
        />
      )}

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        totalPrice={totalPrice}
        pickupTime={pickupTime}
        setPickupTime={setPickupTime}
        availablePickupSlots={availablePickupSlots}
        user={user}
        sendOrder={sendOrder}
      />
    </main>
  );
}