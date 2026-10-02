<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <RouterLink to="/" class="brand footer-brand">
          <img
            class="brand-image"
            src="/assets/branding/bazaarx-logo.png"
            alt="BazaarX"
          />
        </RouterLink>
        <p>Discover great finds from trusted local stores.</p>
      </div>
      <div>
        <b>Shop</b><RouterLink to="/search">All products</RouterLink
        ><RouterLink to="/wishlist">Wishlist</RouterLink
        ><RouterLink to="/cart">Shopping cart</RouterLink>
      </div>
      <div>
        <b>Help & support</b><a href="/account/orders">Track an order</a
        ><a href="/support">Customer care</a
        ><a href="/contact">Contact us</a>
      </div>
      <div>
        <b>Sell with us</b><a href="/seller/">Seller Center</a
        ><a href="/admin/">Marketplace admin</a>
      </div>
    </div>
    <div class="container footer-bottom">
      © 2026 BazaarX Marketplace <span>Made for shoppers everywhere</span>
    </div>
  </footer>
</template>
