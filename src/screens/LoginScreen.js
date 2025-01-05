import { SafeAreaView, View, StyleSheet, Button, Platform, Image, ScrollView, KeyboardAvoidingView } from "react-native";
import FormTextField from "./components/FormTextField";
import { useState, useContext } from "react";
import axios from "../../utils/axios";
import { login, loadUser } from "../../services/AuthService";
import AuthContext from "../../context/AuthContext";

export default function ({ navigation }) {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  async function handleLogin() {
    setErrors({});
    try {
      await login({
        email,
        password,
        device_name: `${Platform.OS} ${Platform.Version}`,
      });

      const user = await loadUser();
      setUser(user);

      console.log(user);
    } catch (e) {
      console.log(e.response.data);
      if (e.response?.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  }

  return (
    <SafeAreaView style={styles.wrapper}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Image
              source={require("../../assets/house.png")}
              style={styles.logo}
            />

            <FormTextField
              label="Email Address"
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              errors={errors.email}
            />
            <FormTextField
              label="Password"
              secureTextEntry={true}
              value={password}
              onChangeText={(text) => setPassword(text)}
              errors={errors.password}
            />

            <Button title="Login" onPress={handleLogin} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { 
    backgroundColor: "#fff", 
    flex: 1 
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollContainer: {
    flexGrow: 1
  },
  container: { 
    padding: 20, 
    rowGap: 16,
    flex: 1,
    justifyContent: 'center' // This will center the content vertically
  },
  logo: {
    width: 80, 
    height: 80, 
    alignSelf: "center", 
    marginBottom: 20
  },
});