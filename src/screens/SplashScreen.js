import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, Animated } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#1B1B1B", "#2A2A2A", "#000000"]}
      style={styles.container}
    >
      <Animated.View style={{ 
        opacity: fadeAnim, 
        transform: [{ scale: scaleAnim }],
        alignItems: "center" 
      }}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Arodona</Text>
        <Text style={styles.subtitle}>JEWELLERY & WATCHES</Text>
      </Animated.View>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
    tintColor: "#D4AF37",
    resizeMode: "contain",
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: "#D4AF37",
    letterSpacing: 2,
    marginTop: 8,
  },
});
