'use client';

import { useMenuLogic } from '@/src/hooks/useMenuLogic';
import MenuHeader from '../components/UserNotLoggedIn/MenuHeader';
import MenuCategories from '../components/UserNotLoggedIn/MenuCategories';
import ProductModal from '../components/UserNotLoggedIn/ProductModal';
import CartModal from '../components/client/CartModal';

import styles from '../components/UserNotLoggedIn/UserNotLoggedIn.module.css';

export default function UserNotLoggedInPage() {
  const {
    user,
    menu,
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
    availablePickupSlots,
    isProductAvailable,
    toggleCategory,
    handleProductClick,
    handleConfirmAddToCart,
    cart,
    updateQuantity,
    removeFromCart,
    totalPrice,
    clearCart,
    totalCartItemsCount
  } = useMenuLogic();

  // Funzione d'invio ordine specifica per utenti non loggati
  const handleSendOrderForGuest = async (customerName: string, selectedPickupTime?: string) => {
    if (!user) {
      alert('Devi effettuare l\'accesso o registrarti per inviare l\'ordine!');
      return null;
    }
    if (cart.length === 0) {
      alert('Il carrello è vuoto!');
      return null;
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          customerName: customerName,
          pickupTime: selectedPickupTime || pickupTime,
          items: cart,
          total: totalPrice,
          status: 'In attesa'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Ordine inviato con successo al pizzaiolo! 🍕');
        clearCart();
        setIsCartOpen(false);
        return data.orderId || Date.now();
      } else {
        alert('Errore durante l\'invio dell\'ordine.');
        return null;
      }
    } catch (err) {
      console.error(err);
      alert('Errore di connessione.');
      return null;
    }
  };

  if (loading) {
    return <div className={styles.loadingMessage}>Caricamento menu in corso... 🍕</div>;
  }

  return (
    <main className={styles.container}>
      <MenuHeader 
        totalCartItemsCount={totalCartItemsCount} 
        onOpenCart={() => setIsCartOpen(true)} 
      />

      <MenuCategories
        categories={categories}
        menu={menu}
        openCategories={openCategories}
        toggleCategory={toggleCategory}
        isProductAvailable={isProductAvailable}
        handleProductClick={handleProductClick}
      />

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          notes={notes}
          setNotes={setNotes}
          availableExtras={availableExtras}
          selectedExtras={selectedExtras}
          onToggleExtra={handleToggleExtra}
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
        sendOrder={handleSendOrderForGuest} 
      />
    </main>
  );
}