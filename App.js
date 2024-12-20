import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import SplashScreen from "./src/screens/SplashScreen";
import MapScreen from "./src/screens/components/MapScreen";

import Reservation from "./src/screens/components/ReservationModal";
import ReservationScreen from './src/screens/ReservationScreen';

// Import your context and services
import AuthContext from "./context/AuthContext";
import { loadUser, logout } from "./services/AuthService";

// Create navigators
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Logout Screen Component
function LogoutScreen() {
  const { setUser } = React.useContext(AuthContext);

  React.useEffect(() => {
    async function performLogout() {
      try {
        await logout(); 
        setUser(null); 
      } catch (error) {
        console.error("Logout failed", error);
      }
    }

    performLogout();
  }, []);

  return null; 
}

// Bottom Tab Navigator for Authenticated Users
function MainTabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Logout') {
            iconName = focused ? 'log-out' : 'log-out-outline';
          }
          else if (route.name === 'Reservations') {
            iconName = focused ? 'book' : 'book-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
       <Tab.Screen 
        name="Reservations" 
        component={ReservationScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Logout" 
        component={LogoutScreen} 
        options={{ headerShown: false }}
      />
    
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function runEffect() {
      try {
        const loadedUser = await loadUser();
        setUser(loadedUser);
      } catch (e) {
        console.log("Failed to Load User", e);
      }

      setStatus("idle");
    }

    runEffect();
  }, []);

  // Show splash screen while loading
  if (status === "loading") {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            // If user is authenticated, show main tab navigator
            <Stack.Screen 
              name="MainApp" 
              component={MainTabNavigator} 
              options={{ headerShown: false }}
            />
          ) : (
            // Authentication screens
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Create Account" component={RegisterScreen} />
              <Stack.Screen name="MapScreen" component={MapScreen} />
              <Stack.Screen name="Reservation" component={Reservation} />
              <Stack.Screen 
                name="Forgot Password" 
                component={ForgotPasswordScreen} 
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}