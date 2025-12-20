import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { WishlistProvider } from './src/context/WishlistContext';
import { CartProvider } from './src/context/CartContext';

const App = () => {
  return (
    <CartProvider>
      <WishlistProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </WishlistProvider>
    </CartProvider>
  );
};

export default App;
