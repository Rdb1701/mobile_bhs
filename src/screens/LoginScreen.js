import { SafeAreaView, View, StyleSheet, Button, Platform } from "react-native";
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

      //console.log("res", data);

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
      <View style={styles.container}>
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
        <Button
          title="Create an Account"
          onPress={() => {
            navigation.navigate("Create Account");
          }}
        />

        {/* <Button
          title="Forgot Password"
          onPress={() => {
            navigation.navigate("Forgot Password");
          }}
        /> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#fff", flex: 1 },
  container: { padding: 20, rowGap: 16, marginTop: 200 },
});
